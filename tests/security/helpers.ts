/**
 * Security-focused test helpers for Fastify API security tests.
 */
import FormData from 'form-data';
import fastify, { type FastifyInstance } from 'fastify';
import jwt from '@fastify/jwt';
import { buildServer } from '../../src/app/server';
import type { UserRole } from '../../src/app/types';

export interface AuthTokenPayload {
  sub: string;
  role: UserRole;
}

export interface MultipartPayload {
  payload: Buffer;
  headers: Record<string, string>;
}

export const createTestServer = async (): Promise<FastifyInstance> => {
  if (!process.env.JWT_SECRET) {
    process.env.JWT_SECRET = 'test-jwt-secret';
  }

  return buildServer();
};

export const signToken = (
  app: FastifyInstance,
  payload: AuthTokenPayload,
  options?: { expiresIn?: string | number },
): string => app.jwt.sign(payload, options);

export const signTokenWithSecret = async (
  secret: string,
  payload: AuthTokenPayload,
  options?: { expiresIn?: string | number },
): Promise<string> => {
  const tempApp = fastify();
  await tempApp.register(jwt, { secret });
  await tempApp.ready();
  const token = tempApp.jwt.sign(payload, options);
  await tempApp.close();
  return token;
};

export const authHeader = (token: string): Record<string, string> => ({
  authorization: `Bearer ${token}`,
});

export const createMultipartPayload = (
  filename: string,
  buffer: Buffer,
  contentType = 'application/octet-stream',
): MultipartPayload => {
  const form = new FormData();
  form.append('file', buffer, { filename, contentType });

  const headers = form.getHeaders();
  const contentLength = form.getLengthSync();
  return {
    payload: form.getBuffer(),
    headers: {
      ...headers,
      'content-length': contentLength.toString(),
    },
  };
};
