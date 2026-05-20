import { useRouter } from 'expo-router';
import { useCallback, useEffect, useMemo, useState } from 'react';

import { ERROR_MESSAGES } from '@/config/constants';
import { ROUTES } from '@/config/routes';
import { listAccounts } from '@/feature/accounts/api/accounts.api';
import { listCurrencies } from '@/feature/currencies/api/currencies.api';
import { ApiError } from '@/services/api';
import { useAuthStore } from '@/store/auth.store';
import type { ApiFieldErrors } from '@/types/api.types';
import type { AuthUser } from '@/types/auth.types';
import { fallbackCurrencies, getCurrencyById } from '@/utils/currency';

import type {
  PasswordFormValues,
  PasswordFieldErrors,
  ProfileExpandedSections,
  ProfileFieldErrors,
  ProfileFormValues,
  ProfilePasswordVisibility,
  ProfileSettingsViewModel,
} from '../types/profile.types';
import {
  getPrimaryAccountCurrencyId,
  resolveProfileCurrencyId,
} from '../utils/profileCurrency.utils';

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_ALLOWED_PATTERN = /^[+\d\s()-]+$/;
const PASSWORD_MIN_LENGTH = 8;
const PHONE_MIN_DIGITS = 7;
const PHONE_MAX_DIGITS = 15;

const emptyPasswordValues: PasswordFormValues = {
  current_password: '',
  password: '',
  password_confirmation: '',
};

const collapsedSections: ProfileExpandedSections = {
  password: false,
  profile: false,
};

const hiddenPasswordFields: ProfilePasswordVisibility = {
  current_password: false,
  password: false,
  password_confirmation: false,
};

const getPhoneDigits = (mobileNumber: string) =>
  mobileNumber.replace(/\D/g, '');

const getInitialProfileValues = (user: AuthUser | null): ProfileFormValues => ({
  currency_id: user?.currency_id ?? fallbackCurrencies[0].id,
  email: user?.email ?? '',
  full_name: user?.full_name ?? '',
  mobile_number: user?.mobile_number ?? '',
});

const formatDate = (value?: string) => {
  if (!value) return 'Not available';

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return 'Not available';

  return date.toLocaleDateString(undefined, {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
};

const getApiProfileFieldErrors = (
  fieldErrors: ApiFieldErrors,
): ProfileFieldErrors => ({
  currency_id: fieldErrors.currency_id,
  email: fieldErrors.email,
  full_name: fieldErrors.full_name,
  mobile_number: fieldErrors.mobile_number,
});

const getApiPasswordFieldErrors = (
  fieldErrors: ApiFieldErrors,
): PasswordFieldErrors => ({
  current_password: fieldErrors.current_password,
  password: fieldErrors.password,
  password_confirmation: fieldErrors.password_confirmation,
});

const validateProfileValues = (values: ProfileFormValues) => {
  const nextErrors: ProfileFieldErrors = {};
  const fullName = values.full_name.trim();
  const email = values.email.trim();
  const mobileNumber = values.mobile_number.trim();
  const phoneDigits = getPhoneDigits(mobileNumber);

  if (fullName.length < 2) {
    nextErrors.full_name = 'Full name must be at least 2 characters';
  }

  if (!EMAIL_PATTERN.test(email)) {
    nextErrors.email = 'Enter a valid email address';
  }

  if (!mobileNumber) {
    nextErrors.mobile_number = 'Mobile number is required';
  } else if (
    !PHONE_ALLOWED_PATTERN.test(mobileNumber) ||
    phoneDigits.length < PHONE_MIN_DIGITS ||
    phoneDigits.length > PHONE_MAX_DIGITS
  ) {
    nextErrors.mobile_number = 'Enter a valid mobile number';
  }

  if (!values.currency_id) {
    nextErrors.currency_id = 'Choose a default currency';
  }

  return nextErrors;
};

const validatePasswordValues = (values: PasswordFormValues) => {
  const nextErrors: PasswordFieldErrors = {};

  if (!values.current_password) {
    nextErrors.current_password = 'Current password is required';
  }

  if (values.password.length < PASSWORD_MIN_LENGTH) {
    nextErrors.password = `Password must be at least ${PASSWORD_MIN_LENGTH} characters`;
  }

  if (!values.password_confirmation) {
    nextErrors.password_confirmation = 'Confirm your password';
  } else if (values.password_confirmation !== values.password) {
    nextErrors.password_confirmation = 'Passwords do not match';
  }

  return nextErrors;
};

export const useProfileSettings = (): ProfileSettingsViewModel => {
  const router = useRouter();
  const token = useAuthStore((state) => state.token);
  const user = useAuthStore((state) => state.user);
  const userCurrencyId = user?.currency_id;
  const clearSession = useAuthStore((state) => state.clearSession);
  const logout = useAuthStore((state) => state.logout);
  const updateProfile = useAuthStore((state) => state.updateProfile);
  const [currencies, setCurrencies] = useState(fallbackCurrencies);
  const [accountCurrencyId, setAccountCurrencyId] = useState<number | null>(null);
  const [expandedSections, setExpandedSections] =
    useState<ProfileExpandedSections>(collapsedSections);
  const [fieldErrors, setFieldErrors] = useState<ProfileFieldErrors>({});
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [isCurrencyPickerVisible, setIsCurrencyPickerVisible] = useState(false);
  const [isLoadingCurrencies, setIsLoadingCurrencies] = useState(false);
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  const [passwordFieldErrors, setPasswordFieldErrors] =
    useState<PasswordFieldErrors>({});
  const [passwordSuccess, setPasswordSuccess] = useState('');
  const [passwordValues, setPasswordValues] =
    useState<PasswordFormValues>(emptyPasswordValues);
  const [passwordVisibility, setPasswordVisibility] =
    useState<ProfilePasswordVisibility>(hiddenPasswordFields);
  const [profileError, setProfileError] = useState('');
  const [profileSuccess, setProfileSuccess] = useState('');
  const [profileValues, setProfileValues] = useState<ProfileFormValues>(
    getInitialProfileValues(user),
  );

  const redirectToLogin = useCallback(async () => {
    await clearSession();
    router.replace(ROUTES.AUTH_LOGIN);
  }, [clearSession, router]);

  useEffect(() => {
    setProfileValues({
      ...getInitialProfileValues(user),
      currency_id: resolveProfileCurrencyId(user, currencies, accountCurrencyId),
    });
  }, [accountCurrencyId, currencies, user]);

  useEffect(() => {
    let isMounted = true;

    const loadCurrencies = async () => {
      if (!token) return;

      setIsLoadingCurrencies(true);

      try {
        const [nextCurrencies, nextAccounts] = await Promise.all([
          listCurrencies(token),
          listAccounts(token).catch((error: unknown) => {
            if (error instanceof ApiError && error.status === 401) {
              throw error;
            }

            return [];
          }),
        ]);
        const resolvedCurrencies =
          nextCurrencies.length > 0 ? nextCurrencies : fallbackCurrencies;
        const nextAccountCurrencyId = getPrimaryAccountCurrencyId(nextAccounts);

        if (!isMounted) return;

        setCurrencies(resolvedCurrencies);
        setAccountCurrencyId(nextAccountCurrencyId);

        if (!userCurrencyId) {
          setProfileValues((values) => ({
            ...values,
            currency_id:
              nextAccountCurrencyId ??
              resolveProfileCurrencyId(user, resolvedCurrencies, null),
          }));
        }
      } catch (error) {
        if (error instanceof ApiError && error.status === 401) {
          await redirectToLogin();
          return;
        }

        if (isMounted) {
          setCurrencies(fallbackCurrencies);
        }
      } finally {
        if (isMounted) {
          setIsLoadingCurrencies(false);
        }
      }
    };

    void loadCurrencies();

    return () => {
      isMounted = false;
    };
  }, [redirectToLogin, token, user, userCurrencyId]);

  const selectedCurrency = useMemo(
    () => getCurrencyById(profileValues.currency_id, currencies),
    [currencies, profileValues.currency_id],
  );

  const isProfileDirty = useMemo(() => {
    if (!user) return false;

    return (
      profileValues.full_name.trim() !== user.full_name.trim() ||
      profileValues.email.trim() !== user.email.trim() ||
      profileValues.mobile_number.trim() !== user.mobile_number.trim() ||
      profileValues.currency_id !== user.currency_id
    );
  }, [profileValues, user]);

  const isPasswordDraftStarted = useMemo(
    () => Object.values(passwordValues).some((value) => value.length > 0),
    [passwordValues],
  );

  const onChangeProfileField = useCallback(
    (field: keyof ProfileFormValues, value: string) => {
      setProfileValues((values) => ({
        ...values,
        [field]: field === 'currency_id' ? Number(value) : value,
      }));
      setFieldErrors((errors) => ({ ...errors, [field]: undefined }));
      setProfileError('');
      setProfileSuccess('');
    },
    [],
  );

  const onChangePasswordField = useCallback(
    (field: keyof PasswordFormValues, value: string) => {
      setPasswordValues((values) => ({ ...values, [field]: value }));
      setPasswordFieldErrors((errors) => ({ ...errors, [field]: undefined }));
      setPasswordError('');
      setPasswordSuccess('');
    },
    [],
  );

  const onSelectCurrency = useCallback((currencyId: number) => {
    setProfileValues((values) => ({ ...values, currency_id: currencyId }));
    setFieldErrors((errors) => ({ ...errors, currency_id: undefined }));
    setProfileError('');
    setProfileSuccess('');
    setIsCurrencyPickerVisible(false);
  }, []);

  const onSaveProfile = useCallback(async () => {
    const nextErrors = validateProfileValues(profileValues);

    setFieldErrors(nextErrors);
    setProfileError('');
    setProfileSuccess('');

    if (Object.keys(nextErrors).length > 0) return;

    setIsSavingProfile(true);

    try {
      await updateProfile({
        currency_id: profileValues.currency_id,
        email: profileValues.email.trim(),
        full_name: profileValues.full_name.trim(),
        mobile_number: profileValues.mobile_number.trim(),
      });
      setProfileSuccess('Profile updated');
    } catch (error) {
      if (error instanceof ApiError) {
        if (error.status === 401) {
          await redirectToLogin();
          return;
        }

        setFieldErrors(getApiProfileFieldErrors(error.fieldErrors));
        setProfileError(error.fieldErrors.base || error.message);
        return;
      }

      setProfileError(ERROR_MESSAGES.NETWORK_ERROR);
    } finally {
      setIsSavingProfile(false);
    }
  }, [profileValues, redirectToLogin, updateProfile]);

  const onChangePassword = useCallback(async () => {
    const nextErrors = validatePasswordValues(passwordValues);

    setPasswordFieldErrors(nextErrors);
    setPasswordError('');
    setPasswordSuccess('');

    if (Object.keys(nextErrors).length > 0) return;

    setIsChangingPassword(true);

    try {
      await updateProfile({
        current_password: passwordValues.current_password,
        password: passwordValues.password,
        password_confirmation: passwordValues.password_confirmation,
      });
      setPasswordValues(emptyPasswordValues);
      setPasswordVisibility(hiddenPasswordFields);
      setPasswordSuccess('Password updated');
    } catch (error) {
      if (error instanceof ApiError) {
        if (error.status === 401) {
          await redirectToLogin();
          return;
        }

        setPasswordFieldErrors(getApiPasswordFieldErrors(error.fieldErrors));
        setPasswordError(error.fieldErrors.base || error.message);
        return;
      }

      setPasswordError(ERROR_MESSAGES.NETWORK_ERROR);
    } finally {
      setIsChangingPassword(false);
    }
  }, [passwordValues, redirectToLogin, updateProfile]);

  const onSignOut = useCallback(async () => {
    await logout();
    router.replace(ROUTES.AUTH_LOGIN);
  }, [logout, router]);

  const onToggleSection = useCallback((section: keyof ProfileExpandedSections) => {
    setExpandedSections((sections) => ({
      ...sections,
      [section]: !sections[section],
    }));
  }, []);

  const onTogglePasswordVisibility = useCallback(
    (field: keyof PasswordFormValues) => {
      setPasswordVisibility((visibility) => ({
        ...visibility,
        [field]: !visibility[field],
      }));
    },
    [],
  );

  return {
    currencies,
    expandedSections,
    fieldErrors,
    isChangingPassword,
    isCurrencyPickerVisible,
    isLoadingCurrencies,
    isPasswordDraftStarted,
    isProfileDirty,
    isSavingProfile,
    lastUpdatedLabel: formatDate(user?.updated_at),
    memberSinceLabel: formatDate(user?.created_at),
    onChangePassword,
    onChangePasswordField,
    onChangeProfileField,
    onCloseCurrencyPicker: () => setIsCurrencyPickerVisible(false),
    onOpenCurrencyPicker: () => setIsCurrencyPickerVisible(true),
    onSaveProfile,
    onSelectCurrency,
    onSignOut,
    onTogglePasswordVisibility,
    onToggleSection,
    passwordError,
    passwordFieldErrors,
    passwordSuccess,
    passwordValues,
    passwordVisibility,
    profileError,
    profileSuccess,
    profileValues,
    selectedCurrency,
    user,
  };
};
