/**
 * Security-focused structured logger for auth and access control events.
 */
import pino from 'pino';

export type AuthOutcome = 'success' | 'failure';

export interface AuthLogContext {
  userId?: string;
  ip: string;
  userAgent?: string;
  timestamp: string;
  outcome: AuthOutcome;
}

export const securityLogger = pino({
  level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
  redact: {
    paths: ['req.headers.authorization', 'body.password', 'body.cardNumber', 'body.cvv'],
    censor: '[Redacted]',
  },
});

export const logAuthAttempt = (context: AuthLogContext): void => {
  securityLogger.info({
    userId: context.userId ?? 'unknown',
    ip: context.ip,
    userAgent: context.userAgent ?? 'unknown',
    timestamp: context.timestamp,
    outcome: context.outcome,
  });
};
