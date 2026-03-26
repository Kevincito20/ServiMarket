/**
 * Security-hardened Fastify server for ServiMarket API.
 */
import fastify, { type FastifyInstance, type FastifyReply, type FastifyRequest } from 'fastify';
import jwt from '@fastify/jwt';
import multipart from '@fastify/multipart';
import { createHmac, randomBytes } from 'node:crypto';
import { createDataStore, type DataStore } from './dataStore';
import type { AuthUser, OrderStatus, UserRole } from './types';
import { registerSecurityPlugins } from '../shared/middleware/security';
import { hashPassword, verifyPassword } from '../shared/lib/passwords';
import { initSentry } from '../shared/lib/sentry';
import { logAuthAttempt, securityLogger } from '../shared/lib/securityLogger';

interface JwtPayload {
  sub?: string;
  role?: UserRole;
}

const isValidRole = (role: string | undefined): role is UserRole =>
  role === 'provider' || role === 'client';

const getJwtSecret = (): string => {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('JWT_SECRET is required.');
  }
  return secret;
};

const buildAuthContext = (
  request: FastifyRequest,
  userId?: string,
  outcome?: 'success' | 'failure',
) => ({
  userId,
  ip: request.ip,
  userAgent: request.headers['user-agent'] ?? 'unknown',
  timestamp: new Date().toISOString(),
  outcome: outcome ?? 'failure',
});

const createAuthenticator =
  (store: DataStore) =>
  async (request: FastifyRequest, reply: FastifyReply): Promise<void> => {
    try {
      const payload = await request.jwtVerify<JwtPayload>();

      if (!payload.sub || !isValidRole(payload.role)) {
        reply.status(401).send({ error: 'Invalid token claims.' });
        return;
      }

      const storedUser = store.users.get(payload.sub);

      if (!storedUser) {
        reply.status(401).send({ error: 'Unknown user.' });
        return;
      }

      request.user = {
        id: storedUser.id,
        role: storedUser.role,
        email: storedUser.email,
      } satisfies AuthUser;
    } catch {
      reply.status(401).send({ error: 'Unauthorized.' });
      return;
    }
  };

const verifyProvider = (request: FastifyRequest, reply: FastifyReply): boolean => {
  if (request.user?.role !== 'provider') {
    reply.status(403).send({ error: 'Forbidden.' });
    return false;
  }

  return true;
};

export const buildServer = async (): Promise<FastifyInstance> => {
  const app = fastify({ logger: false, trustProxy: true });
  const store = createDataStore();
  const authenticate = createAuthenticator(store);

  initSentry();

  app.decorateRequest('startTime', 0n);

  app.setErrorHandler((error, request, reply) => {
    const code = (error as { code?: string }).code;
    const statusCode = (error as { statusCode?: number }).statusCode ?? 500;

    if (
      code === 'FST_MULTIPART_FILE_TOO_LARGE' ||
      code === 'FST_ERR_CTP_BODY_TOO_LARGE' ||
      statusCode === 413
    ) {
      reply.status(413).send({ error: 'File too large.' });
      return;
    }

    if (statusCode === 429) {
      reply.status(429).send({ error: 'Too many requests.' });
      return;
    }

    reply.status(statusCode).send({
      error: statusCode >= 500 ? 'Internal server error.' : 'Request failed.',
    });
  });

  app.addHook('onRequest', (request, _reply, done) => {
    request.startTime = process.hrtime.bigint();
    done();
  });

  app.addHook('onResponse', (request, reply, done) => {
    const statusCode = reply.statusCode;
    const startTime = request.startTime ?? process.hrtime.bigint();
    const responseTime = Number(process.hrtime.bigint() - startTime) / 1e6;
    const userId = request.user?.id ?? 'anonymous';
    const logPayload = {
      method: request.method,
      url: request.url,
      statusCode,
      responseTime,
      userId,
      ip: request.ip,
    };

    if (statusCode >= 500) {
      securityLogger.error(logPayload, 'Request failed.');
    } else if (statusCode >= 400) {
      securityLogger.warn(logPayload, 'Request warning.');
    } else {
      securityLogger.info(logPayload, 'Request completed.');
    }

    if (statusCode === 401 || statusCode === 403) {
      securityLogger.warn(
        {
          route: request.routeOptions.url ?? request.url,
          userId,
          statusCode,
        },
        'Unauthorized or forbidden response.',
      );
    }

    done();
  });

  app.register(jwt, { secret: getJwtSecret() });
  app.register(multipart, {
    limits: {
      fileSize: 10 * 1024 * 1024,
    },
  });

  await registerSecurityPlugins(app);
  const defaultRateLimit = app.rateLimit({ max: 100, timeWindow: '1 minute' });
  const authRateLimit = app.rateLimit({ max: 10, timeWindow: '1 minute' });

  app.post('/auth/login', { onRequest: authRateLimit }, async (request, reply) => {
    const body = request.body as { email?: string; password?: string } | undefined;
    const user = body?.email
      ? [...store.users.values()].find((stored) => stored.email === body.email)
      : undefined;
    const hasValidPassword =
      !!body?.password &&
      !!user?.passwordHash &&
      !!user?.passwordSalt &&
      verifyPassword(body.password, user.passwordSalt, user.passwordHash);

    if (!body?.email || !body.password || !user || !hasValidPassword) {
      logAuthAttempt(buildAuthContext(request, user?.id, 'failure'));
      reply.status(401).send({ error: 'Invalid credentials.' });
      return;
    }

    const token = app.jwt.sign({ sub: user.id, role: user.role }, { expiresIn: '1h' });
    logAuthAttempt(buildAuthContext(request, user.id, 'success'));
    reply.send({ token });
  });

  app.post('/auth/register', { onRequest: authRateLimit }, async (request, reply) => {
    const body = request.body as { email?: string; role?: UserRole; password?: string } | undefined;
    if (!body?.email || !body.role || !isValidRole(body.role) || !body.password) {
      logAuthAttempt(buildAuthContext(request, undefined, 'failure'));
      reply.status(400).send({ error: 'Invalid registration data.' });
      return;
    }

    const passwordSalt = randomBytes(16).toString('hex');
    const passwordHash = hashPassword(body.password, passwordSalt);
    const newUser = {
      id: `user-${store.users.size + 1}`,
      role: body.role,
      email: body.email,
      passwordHash,
      passwordSalt,
    };

    store.users.set(newUser.id, newUser);
    const token = app.jwt.sign({ sub: newUser.id, role: newUser.role }, { expiresIn: '1h' });
    logAuthAttempt(buildAuthContext(request, newUser.id, 'success'));
    reply.status(201).send({ token });
  });

  app.get('/services', async (_request, reply) => {
    reply.send({ services: [...store.services.values()] });
  });

  app.post(
    '/services',
    { onRequest: defaultRateLimit, preHandler: authenticate },
    async (request, reply) => {
      if (!verifyProvider(request, reply)) {
        return;
      }

      const body = request.body as { title?: string; description?: string } | undefined;
      const title = body?.title ?? '';
      const description = body?.description ?? '';

      if (!title || !description) {
        reply.status(422).send({ error: 'Invalid payload.' });
        return;
      }

      if (description.length > 10000) {
        reply.status(422).send({ error: 'Description too long.' });
        return;
      }

      if (/[<>]/.test(title) || /<script/i.test(title)) {
        reply.status(422).send({ error: 'Invalid title content.' });
        return;
      }

      const serviceId = `service-${store.services.size + 1}`;
      const service = {
        id: serviceId,
        providerId: request.user?.id ?? 'unknown',
        title,
        description,
      };

      store.services.set(serviceId, service);
      reply.status(201).send(service);
    },
  );

  app.post(
    '/services/upload',
    { onRequest: defaultRateLimit, preHandler: authenticate },
    async (request, reply) => {
      if (!verifyProvider(request, reply)) {
        return;
      }

      const file = await request.file();
      if (!file) {
        reply.status(400).send({ error: 'File required.' });
        return;
      }

      const filename = file.filename.toLowerCase();
      if (filename.endsWith('.exe')) {
        reply.status(415).send({ error: 'Unsupported file type.' });
        return;
      }

      await file.toBuffer();
      reply.status(201).send({ uploaded: true });
    },
  );

  app.get(
    '/orders',
    { onRequest: defaultRateLimit, preHandler: authenticate },
    async (request, reply) => {
      const userId = request.user?.id;
      const orders = [...store.orders.values()].filter(
        (order) => order.providerId === userId || order.clientId === userId,
      );
      reply.send({ orders });
    },
  );

  app.get(
    '/orders/:id',
    { onRequest: defaultRateLimit, preHandler: authenticate },
    async (request, reply) => {
      const { id } = request.params as { id: string };
      const order = store.orders.get(id);

      if (!order) {
        reply.status(404).send({ error: 'Order not found.' });
        return;
      }

      if (order.providerId !== request.user?.id && order.clientId !== request.user?.id) {
        reply.status(403).send({ error: 'Forbidden.' });
        return;
      }

      reply.send({ order });
    },
  );

  app.patch(
    '/orders/:id/status',
    { onRequest: defaultRateLimit, preHandler: authenticate },
    async (request, reply) => {
      const { id } = request.params as { id: string };
      const body = request.body as { status?: OrderStatus } | undefined;
      const order = store.orders.get(id);

      if (!order) {
        reply.status(404).send({ error: 'Order not found.' });
        return;
      }

      if (body?.status === 'completed' && request.user?.role !== 'provider') {
        reply.status(403).send({ error: 'Only providers can complete orders.' });
        return;
      }

      if (request.user?.role === 'provider' && order.providerId !== request.user?.id) {
        reply.status(403).send({ error: 'Forbidden.' });
        return;
      }

      if (body?.status) {
        order.status = body.status;
        store.orders.set(id, order);
      }

      reply.send({ order });
    },
  );

  app.patch(
    '/users/:id',
    { onRequest: defaultRateLimit, preHandler: authenticate },
    async (request, reply) => {
      const { id } = request.params as { id: string };

      if (request.user?.id !== id) {
        reply.status(403).send({ error: 'Forbidden.' });
        return;
      }

      const body = request.body as { displayName?: string } | undefined;
      reply.send({ id, displayName: body?.displayName ?? null });
    },
  );

  app.post('/payments/webhook', async (request, reply) => {
    const signature = request.headers['stripe-signature'];

    if (typeof signature !== 'string') {
      reply.status(400).send({ error: 'Missing signature.' });
      return;
    }

    const secret = process.env.STRIPE_WEBHOOK_SECRET ?? 'whsec_test';
    const payload = JSON.stringify(request.body ?? {});
    const expectedSignature = createHmac('sha256', secret).update(payload).digest('hex');

    if (signature !== expectedSignature) {
      reply.status(400).send({ error: 'Invalid signature.' });
      return;
    }

    reply.send({ received: true });
  });

  app.post(
    '/payments/create',
    { onRequest: defaultRateLimit, preHandler: authenticate },
    async (request, reply) => {
      const body = request.body as { orderId?: string; amount?: number } | undefined;

      if (!body?.orderId) {
        reply.status(400).send({ error: 'Order ID required.' });
        return;
      }

      const order = store.orders.get(body.orderId);
      if (!order) {
        reply.status(404).send({ error: 'Order not found.' });
        return;
      }

      reply.send({ orderId: order.id, amount: order.amount });
    },
  );

  await app.ready();
  return app;
};
