/**
 * Security regression tests for authentication and authorization controls.
 */
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import type { FastifyInstance } from 'fastify';
import { testOrders, testUsers } from '../../src/app/dataStore';
import {
  authHeader,
  createMultipartPayload,
  createTestServer,
  signToken,
  signTokenWithSecret,
} from './helpers';

let app: FastifyInstance;

beforeEach(async () => {
  app = await createTestServer();
});

afterEach(async () => {
  await app.close();
});

describe('Unauthenticated access', () => {
  it('GET /orders without JWT returns 401', async () => {
    const response = await app.inject({ method: 'GET', url: '/orders' });
    expect(response.statusCode).toBe(401);
  });

  it('GET /services without JWT returns 200', async () => {
    const response = await app.inject({ method: 'GET', url: '/services' });
    expect(response.statusCode).toBe(200);
  });

  it('POST /services without JWT returns 401', async () => {
    const response = await app.inject({
      method: 'POST',
      url: '/services',
      payload: { title: 'Service', description: 'Description' },
    });

    expect(response.statusCode).toBe(401);
  });
});

describe('Authorization checks', () => {
  it('Provider A cannot access Provider B orders', async () => {
    const token = signToken(app, { sub: testUsers.providerA.id, role: 'provider' });
    const response = await app.inject({
      method: 'GET',
      url: `/orders/${testOrders.providerBOrder.id}`,
      headers: authHeader(token),
    });

    expect(response.statusCode).toBe(403);
  });

  it('Client cannot change order status to completed', async () => {
    const token = signToken(app, { sub: testUsers.client.id, role: 'client' });
    const response = await app.inject({
      method: 'PATCH',
      url: `/orders/${testOrders.providerBOrder.id}/status`,
      headers: authHeader(token),
      payload: { status: 'completed' },
    });

    expect(response.statusCode).toBe(403);
  });

  it('User cannot edit another user profile', async () => {
    const token = signToken(app, { sub: testUsers.providerA.id, role: 'provider' });
    const response = await app.inject({
      method: 'PATCH',
      url: `/users/${testUsers.providerB.id}`,
      headers: authHeader(token),
      payload: { displayName: 'New Name' },
    });

    expect(response.statusCode).toBe(403);
  });
});

describe('Input validation', () => {
  it('Rejects service descriptions over 10,000 chars', async () => {
    const token = signToken(app, { sub: testUsers.providerA.id, role: 'provider' });
    const response = await app.inject({
      method: 'POST',
      url: '/services',
      headers: authHeader(token),
      payload: { title: 'Valid', description: 'a'.repeat(10001) },
    });

    expect(response.statusCode).toBe(422);
  });

  it('Rejects XSS payload in service title', async () => {
    const token = signToken(app, { sub: testUsers.providerA.id, role: 'provider' });
    const response = await app.inject({
      method: 'POST',
      url: '/services',
      headers: authHeader(token),
      payload: { title: '<script>alert(1)</script>', description: 'Safe' },
    });

    expect(response.statusCode).toBe(422);
  });

  it('Rejects .exe uploads', async () => {
    const token = signToken(app, { sub: testUsers.providerA.id, role: 'provider' });
    const multipart = createMultipartPayload('malware.exe', Buffer.from('bad'));
    const response = await app.inject({
      method: 'POST',
      url: '/services/upload',
      headers: { ...multipart.headers, ...authHeader(token) },
      payload: multipart.payload,
    });

    expect(response.statusCode).toBe(415);
  });

  it('Rejects uploads larger than 10MB', async () => {
    const token = signToken(app, { sub: testUsers.providerA.id, role: 'provider' });
    const largeBuffer = Buffer.alloc(10 * 1024 * 1024 + 1, 1);
    const multipart = createMultipartPayload('large.pdf', largeBuffer, 'application/pdf');
    const response = await app.inject({
      method: 'POST',
      url: '/services/upload',
      headers: { ...multipart.headers, ...authHeader(token) },
      payload: multipart.payload,
    });

    expect(response.statusCode).toBe(413);
  });
});

describe('Rate limiting', () => {
  it('Returns 429 on the 11th failed login attempt', async () => {
    const loginPayload = { email: testUsers.providerA.email, password: 'wrong-pass' };
    const headers = { 'x-forwarded-for': '203.0.113.10' };

    for (let attempt = 0; attempt < 10; attempt += 1) {
      const response = await app.inject({
        method: 'POST',
        url: '/auth/login',
        headers,
        payload: loginPayload,
      });
      expect(response.statusCode).toBe(401);
    }

    const rateLimitedResponse = await app.inject({
      method: 'POST',
      url: '/auth/login',
      headers,
      payload: loginPayload,
    });

    expect(rateLimitedResponse.statusCode).toBe(429);
  });
});

describe('JWT security', () => {
  it('Rejects expired JWTs', async () => {
    const token = signToken(
      app,
      { sub: testUsers.providerA.id, role: 'provider' },
      { expiresIn: '1s' },
    );
    await new Promise((resolve) => setTimeout(resolve, 1100));

    const response = await app.inject({
      method: 'GET',
      url: '/orders',
      headers: authHeader(token),
    });

    expect(response.statusCode).toBe(401);
  });

  it('Rejects JWTs signed with the wrong secret', async () => {
    const token = await signTokenWithSecret('wrong-secret', {
      sub: testUsers.providerA.id,
      role: 'provider',
    });

    const response = await app.inject({
      method: 'GET',
      url: '/orders',
      headers: authHeader(token),
    });

    expect(response.statusCode).toBe(401);
  });

  it('Rejects JWTs missing required claims', async () => {
    const token = app.jwt.sign({});
    const response = await app.inject({
      method: 'GET',
      url: '/orders',
      headers: authHeader(token),
    });

    expect(response.statusCode).toBe(401);
  });
});
