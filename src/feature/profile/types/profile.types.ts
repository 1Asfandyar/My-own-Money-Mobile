import type { Currency } from '@/types/currency.types';
import type { AuthUser } from '@/types/auth.types';
import type { Ionicons } from '@expo/vector-icons';
import type { ReactNode } from 'react';

export type ProfileIconName = keyof typeof Ionicons.glyphMap;

export type ProfileFormValues = {
  currency_id: number;
  email: string;
  full_name: string;
  mobile_number: string;
};

export type PasswordFormValues = {
  current_password: string;
  password: string;
  password_confirmation: string;
};

export type ProfileFieldErrors = Partial<Record<keyof ProfileFormValues, string>>;

export type PasswordFieldErrors = Partial<Record<keyof PasswordFormValues, string>>;

export type ProfileSectionKey = 'profile' | 'password';

export type ProfileExpandedSections = Record<ProfileSectionKey, boolean>;

export type ProfilePasswordVisibility = Record<keyof PasswordFormValues, boolean>;

export type ProfileSettingsViewModel = {
  currencies: Currency[];
  fieldErrors: ProfileFieldErrors;
  expandedSections: ProfileExpandedSections;
  isChangingPassword: boolean;
  isCurrencyPickerVisible: boolean;
  isLoadingCurrencies: boolean;
  isPasswordDraftStarted: boolean;
  isProfileDirty: boolean;
  isSavingProfile: boolean;
  lastUpdatedLabel: string;
  memberSinceLabel: string;
  onChangePassword: () => Promise<void>;
  onChangePasswordField: (field: keyof PasswordFormValues, value: string) => void;
  onChangeProfileField: (field: keyof ProfileFormValues, value: string) => void;
  onCloseCurrencyPicker: () => void;
  onOpenCurrencyPicker: () => void;
  onSaveProfile: () => Promise<void>;
  onSelectCurrency: (currencyId: number) => void;
  onSignOut: () => Promise<void>;
  onTogglePasswordVisibility: (field: keyof PasswordFormValues) => void;
  onToggleSection: (section: ProfileSectionKey) => void;
  passwordError: string;
  passwordFieldErrors: PasswordFieldErrors;
  passwordSuccess: string;
  passwordValues: PasswordFormValues;
  passwordVisibility: ProfilePasswordVisibility;
  profileError: string;
  profileSuccess: string;
  profileValues: ProfileFormValues;
  selectedCurrency: Currency;
  user: AuthUser | null;
};

export type ProfileSummaryCardProps = {
  user: AuthUser | null;
};

export type ProfileInfoItem = {
  iconName: ProfileIconName;
  label: string;
  value: string;
};

export type ProfileInfoListProps = {
  items: ProfileInfoItem[];
};

export type ProfileAccordionSectionProps = {
  children: ReactNode;
  isExpanded: boolean;
  onToggle: () => void;
  subtitle?: string;
  title: string;
};

export type ProfileStatusMessageProps = {
  message: string;
  tone: 'error' | 'success';
};

export type ProfileInformationSectionProps = {
  currencies: Currency[];
  fieldErrors: ProfileFieldErrors;
  isCurrencyPickerVisible: boolean;
  isLoadingCurrencies: boolean;
  isProfileDirty: boolean;
  isSavingProfile: boolean;
  onChangeProfileField: (field: keyof ProfileFormValues, value: string) => void;
  onCloseCurrencyPicker: () => void;
  onOpenCurrencyPicker: () => void;
  onSaveProfile: () => Promise<void>;
  onSelectCurrency: (currencyId: number) => void;
  profileError: string;
  profileSuccess: string;
  profileValues: ProfileFormValues;
  selectedCurrency: Currency;
};

export type ProfilePasswordSectionProps = {
  isChangingPassword: boolean;
  isPasswordDraftStarted: boolean;
  onChangePassword: () => Promise<void>;
  onChangePasswordField: (field: keyof PasswordFormValues, value: string) => void;
  onTogglePasswordVisibility: (field: keyof PasswordFormValues) => void;
  passwordError: string;
  passwordFieldErrors: PasswordFieldErrors;
  passwordSuccess: string;
  passwordValues: PasswordFormValues;
  passwordVisibility: ProfilePasswordVisibility;
};

export type ProfileSessionSectionProps = {
  onSignOut: () => Promise<void>;
};
