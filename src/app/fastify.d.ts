/**
 * Security-focused Fastify type augmentation for authenticated requests.
 */
import type { AuthUser } from './types';

declare module 'fastify' {
  interface FastifyRequest {
    user?: AuthUser;
    startTime?: bigint;
  }
}

declare module '@fastify/jwt' {
  interface FastifyJWT {
    user: AuthUser;
  }
}
