import type { CreateAccountPayload } from '@/types/account.types';
import type { Currency } from '@/types/currency.types';

export type AuthUser = {
  avatar_url?: string | null;
  currency?: Currency | null;
  currency_code?: string | null;
  currency_symbol?: string | null;
  id: number;
  full_name: string;
  mobile_number?: string | null;
  email: string;
  photo_url?: string | null;
  profile_image_url?: string | null;
  profile_photo_url?: string | null;
  role: string;
  onboarding_completed?: boolean;
  has_completed_onboarding?: boolean;
  currency_id?: number | null;
  created_at: string;
  updated_at: string;
};

export type AuthSuccess = {
  success: true;
  token?: string;
  expires_at?: string;
  user: AuthUser;
};

export type LoginPayload = {
  email: string;
  password: string;
};

export type LoginFormValues = LoginPayload;

export type SignupPayload = {
  full_name: string;
  mobile_number: string;
  email: string;
  password: string;
  password_confirmation: string;
};

export type RegisterFormValues = {
  full_name: string;
  email: string;
  mobile_number: string;
  password: string;
  password_confirmation: string;
};

export type UpdateMePayload = {
  current_password?: string;
  email?: string;
  full_name?: string;
  mobile_number?: string;
  onboarding_completed?: boolean;
  password?: string;
  password_confirmation?: string;
  currency_id?: number;
};

export type CompleteOnboardingPayload = {
  currency_id: number;
  account?: CreateAccountPayload;
};

export type AuthStatus =
  | 'idle'
  | 'restoring'
  | 'signingIn'
  | 'signingUp'
  | 'signingOut';

export type AuthStore = {
  token: string | null;
  user: AuthUser | null;
  isAuthenticated: boolean;
  hasCompletedOnboarding: boolean;
  status: AuthStatus;
  isRestoring: boolean;
  restoreSession: () => Promise<void>;
  login: (payload: LoginPayload) => Promise<void>;
  signup: (payload: SignupPayload) => Promise<void>;
  logout: () => Promise<void>;
  clearSession: () => Promise<void>;
  completeOnboarding: (payload: CompleteOnboardingPayload) => Promise<void>;
  updateProfile: (payload: UpdateMePayload) => Promise<AuthUser>;
};
