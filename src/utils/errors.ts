import { ERROR_MESSAGES } from '@/config/constants';
import { ApiError } from '@/services/api';

export class AppError extends Error {
  constructor(
    public code: string,
    public message: string,
    public originalError?: Error,
  ) {
    super(message);
    this.name = 'AppError';
  }
}

export const getErrorMessage = (error: unknown): string => {
  if (error instanceof AppError) return error.message;
  if (error instanceof Error) return error.message;
  if (typeof error === 'string') return error;
  return ERROR_MESSAGES.SERVER_ERROR;
};

/**
 * Extracts a user-facing message from a caught request error, falling back
 * to a provided message when the error has no useful details.
 *
 * Shared across feature hooks to avoid re-implementing this per-hook.
 */
export const getRequestError = (error: unknown, fallback: string): string =>
  error instanceof ApiError
    ? error.fieldErrors.base || error.message
    : error instanceof Error
      ? error.message
      : fallback;

export const handleApiError = (error: unknown): AppError => {
  if (error instanceof ApiError) {
    switch (error.status) {
      case 401:
        return new AppError('AUTH_ERROR', 'Invalid credentials', error);
      case 404:
        return new AppError('NOT_FOUND', 'Not found', error);
      case 500:
        return new AppError('SERVER_ERROR', ERROR_MESSAGES.SERVER_ERROR, error);
      default:
        return new AppError('ERROR', error.message || ERROR_MESSAGES.SERVER_ERROR, error);
    }
  }

  if (error instanceof Error) {
    return new AppError('NETWORK_ERROR', ERROR_MESSAGES.NETWORK_ERROR, error);
  }

  return new AppError('NETWORK_ERROR', ERROR_MESSAGES.NETWORK_ERROR);
};

export const logError = (error: unknown, context?: Record<string, unknown>): void => {
  console.error('[ERROR]', {
    error: error instanceof Error ? error.message : String(error),
    context,
    timestamp: new Date().toISOString(),
  });
};
