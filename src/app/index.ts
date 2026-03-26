/**
 * Security-focused Fastify server entry point.
 */
import { buildServer } from './server';
import { securityLogger } from '../shared/lib/securityLogger';

const startServer = async (): Promise<void> => {
  const app = await buildServer();
  const port = Number(process.env.PORT ?? 3000);
  const host = '0.0.0.0';

  try {
    await app.listen({ port, host });
    securityLogger.info({ port, host }, 'Server started.');
  } catch (error) {
    securityLogger.error({ error }, 'Failed to start server.');
    process.exit(1);
  }
};

void startServer();
