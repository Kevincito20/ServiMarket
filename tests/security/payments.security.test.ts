/**
 * Security regression tests for payment workflows.
 */
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import type { FastifyInstance } from 'fastify';
import { testOrders, testUsers } from '../../src/app/dataStore';
import { authHeader, createTestServer, signToken } from './helpers';

let app: FastifyInstance;

beforeEach(async () => {
  app = await createTestServer();
});

afterEach(async () => {
  await app.close();
});

describe('Stripe webhook security', () => {
  it('Rejects webhook without signature header', async () => {
    const response = await app.inject({
      method: 'POST',
      url: '/payments/webhook',
      payload: { event: 'payment_intent.succeeded' },
    });

    expect(response.statusCode).toBe(400);
  });

  it('Rejects webhook with invalid signature', async () => {
    const response = await app.inject({
      method: 'POST',
      url: '/payments/webhook',
      headers: { 'stripe-signature': 'invalid' },
      payload: { event: 'payment_intent.succeeded' },
    });

    expect(response.statusCode).toBe(400);
  });
});

describe('Payment amount tampering', () => {
  it('Uses server-side order amount regardless of client input', async () => {
    const token = signToken(app, { sub: testUsers.providerB.id, role: 'provider' });
    const response = await app.inject({
      method: 'POST',
      url: '/payments/create',
      headers: authHeader(token),
      payload: { orderId: testOrders.providerBOrder.id, amount: 1 },
    });

    const payload = JSON.parse(response.body) as { amount: number };
    expect(response.statusCode).toBe(200);
    expect(payload.amount).toBe(testOrders.providerBOrder.amount);
  });
});
