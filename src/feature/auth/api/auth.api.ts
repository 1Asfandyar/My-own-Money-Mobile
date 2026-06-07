import { apiRequest, extractBearerToken } from '@/services/api';
import {
  AuthSuccess,
  AuthUser,
  LoginPayload,
  SignupPayload,
  UpdateMePayload,
} from '@/types/auth.types';

const isAuthUser = (user: unknown): user is AuthUser => {
  if (typeof user !== 'object' || user === null) return false;

  const candidate = user as Partial<AuthUser>;

  return (
    typeof candidate.id === 'number' &&
    typeof candidate.full_name === 'string' &&
    (candidate.mobile_number == null || typeof candidate.mobile_number === 'string') &&
    typeof candidate.email === 'string' &&
    typeof candidate.role === 'string' &&
    typeof candidate.created_at === 'string' &&
    typeof candidate.updated_at === 'string'
  );
};

const getValidatedUser = (data: unknown) => {
  if (typeof data !== 'object' || data === null || !('user' in data)) {
    throw new Error('Invalid auth response.');
  }

  if (!isAuthUser(data.user)) {
    throw new Error('Invalid auth response.');
  }

  return data.user;
};

export const login = async (payload: LoginPayload) => {
  const result = await apiRequest<AuthSuccess>('/api/v0/auth/login', {
    method: 'POST',
    body: payload,
  });
  const token = extractBearerToken(result.response, result.data);

  if (!token) {
    throw new Error('Login succeeded, but no auth token was returned.');
  }

  return { token, user: getValidatedUser(result.data) };
};

export const signup = async (payload: SignupPayload) => {
  const result = await apiRequest<AuthSuccess>('/api/v0/auth/signup', {
    method: 'POST',
    body: payload,
  });
  const token = extractBearerToken(result.response, result.data);

  if (!token) {
    throw new Error('Signup succeeded, but no auth token was returned.');
  }

  return { token, user: getValidatedUser(result.data) };
};

export const getMe = async (token: string) => {
  const result = await apiRequest<{ success: true; user: AuthUser }>('/api/v0/me', {
    token,
  });

  return getValidatedUser(result.data);
};

export const updateMe = async (token: string, payload: UpdateMePayload) => {
  const result = await apiRequest<{ success: true; user?: AuthUser }>('/api/v0/me', {
    method: 'PATCH',
    token,
    body: payload,
  });

  if (
    typeof result.data === 'object' &&
    result.data !== null &&
    'user' in result.data &&
    result.data.user
  ) {
    return getValidatedUser(result.data);
  }

  return getMe(token);
};

export const logout = async (token: string) => {
  await apiRequest<{ success: true; message: string }>('/api/v0/auth/logout', {
    method: 'DELETE',
    token,
  });
};
