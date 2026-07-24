import { ENV } from '@/config/env';
import { Client } from 'rollbar-react-native';

const isProduction = !__DEV__;

export const rollbar = ENV.ROLLBAR_ACCESS_TOKEN
  ? new Client({
      accessToken: ENV.ROLLBAR_ACCESS_TOKEN,
      captureUncaught: true,
      captureUnhandledRejections: true,
      environment: isProduction ? 'production' : 'development',
      payload: {
        client: {
          javascript: {
            source_map_enabled: true,
          },
        },
      },
    })
  : null;

export const reportError = (
  error: unknown,
  context?: Record<string, unknown>,
): void => {
  if (__DEV__) {
    console.error('[Rollbar]', error, context);
  }
  rollbar?.error(error instanceof Error ? error : String(error), context);
};

export const setRollbarPerson = (
  id: string,
  name?: string,
  email?: string,
): void => {
  rollbar?.setPerson(id, name ?? '', email ?? '');
};

export const clearRollbarPerson = (): void => {
  rollbar?.clearPerson();
};
