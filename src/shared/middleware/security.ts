/**
 * Security middleware registrations for Fastify hardening.
 */
import type { FastifyInstance } from 'fastify';
import cors from '@fastify/cors';
import helmet from '@fastify/helmet';
import rateLimit from '@fastify/rate-limit';

const getAllowedOrigins = (): Set<string> => {
  const allowed = new Set<string>(['http://localhost:8081']);
  const envOrigins: string[] = process.env.ALLOWED_ORIGINS
    ? process.env.ALLOWED_ORIGINS.split(',')
    : [];

  envOrigins
    .map((origin) => origin.trim())
    .filter((origin) => origin.length > 0)
    .forEach((origin) => allowed.add(origin));

  return allowed;
};

export const registerSecurityPlugins = async (app: FastifyInstance): Promise<void> => {
  await app.register(helmet, {
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        connectSrc: ["'self'"],
        imgSrc: ["'self'", 'data:'],
        scriptSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        objectSrc: ["'none'"],
        frameAncestors: ["'none'"],
      },
    },
  });

  const allowedOrigins = getAllowedOrigins();

  await app.register(cors, {
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.has(origin)) {
        callback(null, true);
        return;
      }

      callback(new Error('Origin not allowed'), false);
    },
  });

  await app.register(rateLimit, {
    max: 100,
    timeWindow: '1 minute',
  });
};
