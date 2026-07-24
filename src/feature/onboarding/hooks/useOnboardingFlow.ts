import { useRouter } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';

import { ROUTES } from '@/config/routes';
import { listCurrencies } from '@/feature/currencies/api/currencies.api';
import { ApiError } from '@/services/api';
import { useAuthStore } from '@/store/auth.store';
import { moneyInputToCents } from '@/utils/currency';

import {
    accountColors,
    accountIcons,
    fallbackOnboardingCurrencies,
    toOnboardingCurrencyOptions,
    totalOnboardingSteps,
} from '../constants/onboarding.constants';
import type {
    IconName,
    OnboardingFlow,
    OnboardingStep,
} from '../types';

export const useOnboardingFlow = (): OnboardingFlow => {
  const router = useRouter();
  const token = useAuthStore((state) => state.token);
  const clearSession = useAuthStore((state) => state.clearSession);
  const completeOnboarding = useAuthStore((state) => state.completeOnboarding);
  const [currentStep, setCurrentStep] = useState<OnboardingStep>(0);
  const [selectedCurrencyCode, setSelectedCurrencyCode] = useState('PKR');
  const [accountName, setAccountName] = useState('');
  const [selectedAccountIcon, setSelectedAccountIcon] = useState<IconName>(
    accountIcons[0].icon,
  );
  const [selectedAccountColor, setSelectedAccountColor] = useState(
    accountColors[0].value,
  );
  const [openingBalance, setOpeningBalance] = useState('');
  const [currencyOptions, setCurrencyOptions] = useState(
    fallbackOnboardingCurrencies,
  );
  const [isCompleting, setIsCompleting] = useState(false);
  const [onboardingError, setOnboardingError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const loadCurrencies = async () => {
      if (!token) return;

      try {
        const nextCurrencies = await listCurrencies(token);

        if (!isMounted || nextCurrencies.length === 0) return;

        setCurrencyOptions(toOnboardingCurrencyOptions(nextCurrencies));
      } catch (error) {
        if (error instanceof ApiError && error.status === 401) {
          await clearSession();
          router.replace(ROUTES.AUTH_LOGIN);
          return;
        }

        if (isMounted) {
          setCurrencyOptions(fallbackOnboardingCurrencies);
        }
      }
    };

    void loadCurrencies();

    return () => {
      isMounted = false;
    };
  }, [clearSession, router, token]);

  const selectedCurrency = useMemo(
    () =>
      currencyOptions.find(
        (currency) => currency.code === selectedCurrencyCode,
      ) ?? currencyOptions[0],
    [currencyOptions, selectedCurrencyCode],
  );

  const accountDraft = accountName.trim()
    ? {
        name: accountName.trim(),
        current_balance_cents: moneyInputToCents(openingBalance),
        initial_balance_cents: moneyInputToCents(openingBalance),
      }
    : undefined;

  const finishOnboarding = async () => {
    setIsCompleting(true);
    setOnboardingError(null);

    try {
      await completeOnboarding({
        currency_id: selectedCurrency.id,
        account: accountDraft,
      });
      router.replace(ROUTES.MAIN_HOME);
    } catch (error) {
      setOnboardingError(
        error instanceof Error
          ? error.message
          : 'Could not finish onboarding. Please try again.',
      );
    } finally {
      setIsCompleting(false);
    }
  };

  const handleContinue = async () => {
    if (currentStep < totalOnboardingSteps - 1) {
      setCurrentStep((step) => (step + 1) as OnboardingStep);
      return;
    }

    await finishOnboarding();
  };

  const handleBack = () => {
    setCurrentStep((step) => Math.max(step - 1, 0) as OnboardingStep);
  };

  const handleSkip = async () => {
    await finishOnboarding();
  };

  return {
    currentStep,
    totalSteps: totalOnboardingSteps,
    currencyOptions,
    selectedCurrency,
    accountName,
    selectedAccountIcon,
    selectedAccountColor,
    openingBalance,
    canContinue: currentStep !== 2 || Boolean(accountName.trim()),
    showSkip: currentStep === 2 || currentStep === 3,
    isCompleting,
    onboardingError,
    setSelectedCurrencyCode,
    setAccountName,
    setSelectedAccountIcon,
    setSelectedAccountColor,
    setOpeningBalance,
    handleContinue,
    handleBack,
    handleSkip,
  };
};
