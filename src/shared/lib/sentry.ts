/**
 * Security-focused Sentry initialization with sensitive data scrubbing.
 */
import * as Sentry from '@sentry/node';

const stripeKeyPattern = /(sk_live_[0-9a-zA-Z]+|pk_live_[0-9a-zA-Z]+|whsec_[0-9a-zA-Z]+)/g;

const scrubStripeKeys = (value: unknown): unknown => {
  if (typeof value === 'string') {
    return value.replace(stripeKeyPattern, '[Filtered]');
  }

  if (Array.isArray(value)) {
    return value.map((entry) => scrubStripeKeys(entry));
  }

  if (value && typeof value === 'object') {
    const record = value as Record<string, unknown>;
    return Object.fromEntries(
      Object.entries(record).map(([key, entry]) => [key, scrubStripeKeys(entry)]),
    );
  }

  return value;
};

const scrubBreadcrumbHeaders = (event: Sentry.Event): void => {
  event.breadcrumbs?.forEach((breadcrumb) => {
    if (breadcrumb.data && typeof breadcrumb.data === 'object') {
      const data = breadcrumb.data as Record<string, unknown>;
      const headers = data.headers;

      if (headers && typeof headers === 'object') {
        const headerRecord = headers as Record<string, unknown>;
        if ('Authorization' in headerRecord) {
          delete headerRecord.Authorization;
        }
      }
    }
  });
};

const scrubRequestData = (event: Sentry.Event): void => {
  const requestData = event.request?.data;
  if (requestData && typeof requestData === 'object') {
    const record = requestData as Record<string, unknown>;
    if ('password' in record) {
      record.password = '[Filtered]';
    }
  }
};

export const initSentry = (): void => {
  const dsn = process.env.SENTRY_DSN;
  if (!dsn) {
    return;
  }

  const environment = process.env.NODE_ENV ?? 'development';
  const appVersion = process.env.APP_VERSION ?? 'unknown';
  const platform = process.env.PLATFORM ?? 'server';

  Sentry.init({
    dsn,
    tracesSampleRate: environment === 'production' ? 0.1 : 1.0,
    beforeSend(event) {
      scrubBreadcrumbHeaders(event);
      scrubRequestData(event);

      event.request = scrubStripeKeys(event.request) as Sentry.Event['request'];
      event.extra = scrubStripeKeys(event.extra) as Record<string, unknown>;

      event.tags = {
        ...event.tags,
        environment,
        appVersion,
        platform,
      };

      return event;
    },
  });

  Sentry.setTag('environment', environment);
  Sentry.setTag('appVersion', appVersion);
  Sentry.setTag('platform', platform);
};
