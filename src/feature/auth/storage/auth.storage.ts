import * as SecureStore from 'expo-secure-store';

import { logger } from '@/services/logger';
import { AuthUser } from '@/types/auth.types';

const AUTH_TOKEN_KEY = 'auth_token';
const AUTH_USER_KEY = 'auth_user';

const isStoredAuthUser = (user: unknown): user is AuthUser => {
  if (typeof user !== 'object' || user === null) return false;

  const candidate = user as Partial<AuthUser>;

  return (
    typeof candidate.id === 'number' &&
    typeof candidate.full_name === 'string' &&
    typeof candidate.mobile_number === 'string' &&
    typeof candidate.email === 'string' &&
    typeof candidate.role === 'string' &&
    typeof candidate.created_at === 'string' &&
    typeof candidate.updated_at === 'string'
  );
};

export const getStoredToken = async () => {
  try {
    return await SecureStore.getItemAsync(AUTH_TOKEN_KEY);
  } catch (error) {
    logger.error('Failed to read stored auth token', { error });
    return null;
  }
};

export const getStoredUser = async () => {
  let user: string | null;
  try {
    user = await SecureStore.getItemAsync(AUTH_USER_KEY);
  } catch (error) {
    logger.error('Failed to read stored auth user', { error });
    return null;
  }

  if (!user) return null;

  try {
    const parsedUser = JSON.parse(user);
    return isStoredAuthUser(parsedUser) ? parsedUser : null;
  } catch (error) {
    logger.error('Failed to parse stored auth user', { error });
    return null;
  }
};

export const saveSession = async (token: string, user: AuthUser) => {
  try {
    await SecureStore.setItemAsync(AUTH_TOKEN_KEY, token);
    await SecureStore.setItemAsync(AUTH_USER_KEY, JSON.stringify(user));
  } catch (error) {
    logger.error('Failed to save auth session', { error });
    throw error;
  }
};

export const removeSession = async () => {
  try {
    await SecureStore.deleteItemAsync(AUTH_TOKEN_KEY);
    await SecureStore.deleteItemAsync(AUTH_USER_KEY);
  } catch (error) {
    logger.error('Failed to remove auth session', { error });
    throw error;
  }
};
