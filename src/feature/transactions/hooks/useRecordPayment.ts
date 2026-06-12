import { useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Alert } from 'react-native';

import { ROUTES } from '@/config/routes';
import { listAccounts } from '@/feature/accounts/api/accounts.api';
import { useAccountsOverviewStore } from '@/feature/accounts/store/accountsOverview.store';
import { listCurrencies } from '@/feature/currencies/api/currencies.api';
import { getFriendship } from '@/feature/friendships/api/friendships.api';
import type { FriendshipDetail } from '@/feature/friendships/types/friendship.types';
import type { GroupUser } from '@/feature/groups/types/group.types';
import { createSettlement } from '@/feature/transactions/api/transactions.api';
import { createSettlementSubmitter } from '@/feature/transactions/services/settlementSubmission.service';
import type { RecordPaymentViewModel } from '@/feature/transactions/types/settlement.types';
import {
  isSettlementAllowed,
  settlementCentsToInput,
  validateSettlement,
} from '@/feature/transactions/utils/settlement.utils';
import { ApiError } from '@/services/api';
import { useAuthStore } from '@/store/auth.store';
import { invalidateSettlementData } from '@/store/serverDataInvalidation.store';
import { fallbackCurrencies } from '@/utils/currency';

const useRecordPayment = (): RecordPaymentViewModel => {
  const router = useRouter();
  const params = useLocalSearchParams<{
    accountId?: string;
    amountCents?: string;
    friendName?: string;
    friendshipId?: string;
  }>();
  const token = useAuthStore((state) => state.token);
  const user = useAuthStore((state) => state.user);
  const clearSession = useAuthStore((state) => state.clearSession);
  const storedAccounts = useAccountsOverviewStore((state) => state.accounts);
  const storedCurrencies = useAccountsOverviewStore((state) => state.currencies);
  const setAccounts = useAccountsOverviewStore((state) => state.setAccounts);
  const setCurrencies = useAccountsOverviewStore((state) => state.setCurrencies);
  const routeAccountId = Number(params.accountId);
  const friendshipId = Number(params.friendshipId);
  const initialAmountCents = Math.max(0, Number(params.amountCents) || 0);
  const [amount, setAmountState] = useState(
    settlementCentsToInput(initialAmountCents),
  );
  const [amountError, setAmountError] = useState('');
  const [error, setError] = useState('');
  const [friendship, setFriendship] = useState<FriendshipDetail | null>(null);
  const [isAccountPickerVisible, setIsAccountPickerVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [selectedPaymentAccountId, setSelectedPaymentAccountId] = useState<
    number | null
  >(Number.isFinite(routeAccountId) ? routeAccountId : null);
  const [submitSettlement] = useState(() =>
    createSettlementSubmitter({
      createSettlement,
      invalidateCaches: invalidateSettlementData,
    }),
  );
  const accounts = useMemo(
    () => storedAccounts.filter((account) => !account.is_archived),
    [storedAccounts],
  );
  const currencies =
    storedCurrencies.length > 0 ? storedCurrencies : fallbackCurrencies;
  const account = accounts.find(
    (item) => item.id === selectedPaymentAccountId,
  );
  const balance = friendship?.balance_summary ?? {
    amount_cents: 0,
    type: 'settled_up' as const,
  };
  const friendName =
    friendship?.friend.full_name?.trim() ||
    friendship?.friend.email?.trim() ||
    params.friendName?.trim() ||
    'Friend';
  const friendUser: GroupUser = friendship?.friend ?? {
    full_name: friendName,
    id: 0,
  };
  const currentUser: GroupUser = user
    ? { ...user, full_name: 'You' }
    : { full_name: 'You', id: 0 };
  const validationErrors = validateSettlement({
    accountId: account?.id ?? null,
    amount,
    balance,
  });
  const displayedAmountError =
    amountError || (amount.trim() ? validationErrors.amount : undefined);

  const redirectToLogin = useCallback(async () => {
    await clearSession();
    router.replace(ROUTES.AUTH_LOGIN);
  }, [clearSession, router]);

  const loadPaymentData = useCallback(async () => {
    if (!token || !Number.isFinite(friendshipId) || friendshipId <= 0) {
      setError('Could not open this settlement.');
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const currentActiveAccounts =
        useAccountsOverviewStore
          .getState()
          .accounts.filter((currentAccount) => !currentAccount.is_archived);
      const currentCurrencies =
        useAccountsOverviewStore.getState().currencies;
      const hasStoredAccounts = currentActiveAccounts.length > 0;
      const hasStoredCurrencies = currentCurrencies.length > 0;
      const [nextAccounts, nextCurrencies, nextFriendship] = await Promise.all([
        hasStoredAccounts
          ? Promise.resolve(currentActiveAccounts)
          : listAccounts(token),
        hasStoredCurrencies
          ? Promise.resolve(currentCurrencies)
          : listCurrencies(token).catch(() => fallbackCurrencies),
        getFriendship(token, friendshipId),
      ]);

      if (!hasStoredAccounts) {
        setAccounts(nextAccounts);
      }

      if (!hasStoredCurrencies) {
        setCurrencies(
          nextCurrencies.length > 0 ? nextCurrencies : fallbackCurrencies,
        );
      }

      setFriendship(nextFriendship);

      if (isSettlementAllowed(nextFriendship.balance_summary)) {
        setAmountState(
          settlementCentsToInput(nextFriendship.balance_summary.amount_cents),
        );
      } else {
        setError('Only an amount you owe can be settled.');
      }

      if (nextAccounts.filter((nextAccount) => !nextAccount.is_archived).length === 0) {
        setError('Add an active account before settling up.');
      }
    } catch (requestError) {
      if (requestError instanceof ApiError && requestError.status === 401) {
        await redirectToLogin();
        return;
      }

      setError(
        requestError instanceof Error
          ? requestError.message
          : 'Could not load settlement details.',
      );
    } finally {
      setIsLoading(false);
    }
  }, [
    friendshipId,
    redirectToLogin,
    setAccounts,
    setCurrencies,
    token,
  ]);

  useEffect(() => {
    void loadPaymentData();
  }, [loadPaymentData]);

  useEffect(() => {
    if (
      accounts.length > 0 &&
      !accounts.some((item) => item.id === selectedPaymentAccountId)
    ) {
      setSelectedPaymentAccountId(accounts[0].id);
    }
  }, [accounts, selectedPaymentAccountId]);

  const close = useCallback(() => {
    if (router.canGoBack()) {
      router.back();
      return;
    }

    router.replace(ROUTES.MAIN_HOME);
  }, [router]);

  const closeAfterSuccess = useCallback(() => {
    if (router.canGoBack()) {
      router.back();
      return;
    }

    if (Number.isFinite(friendshipId) && friendshipId > 0) {
      router.replace({
        pathname: ROUTES.FRIENDSHIP_DETAIL,
        params: { friendshipId },
      });
      return;
    }

    router.replace(ROUTES.MAIN_HOME);
  }, [friendshipId, router]);

  const setAmount = useCallback((nextAmount: string) => {
    setAmountState(nextAmount);
    setAmountError('');
    setError('');
  }, []);

  const submit = useCallback(async () => {
    if (!token || !friendship?.friend.id) {
      setError('Could not record this settlement.');
      return;
    }

    setAmountError('');
    setError('');

    const result = await submitSettlement({
      accountId: account?.id ?? null,
      amount,
      balance: friendship.balance_summary,
      friendId: friendship.friend.id,
      friendName,
      note: `You paid ${friendName}`,
      onSubmittingChange: setIsSaving,
      token,
      transactionDate: new Date().toISOString(),
    });

    if (result.status === 'validation_error') {
      setAmountError(result.errors.amount ?? '');
      setError(result.errors.accountId || result.errors.form || '');
      return;
    }

    if (result.status === 'request_error') {
      setAmountError(result.errors.amount ?? '');
      setError(result.message);
      return;
    }

    if (result.status !== 'success') {
      return;
    }

    setAmountState('');
    setSelectedPaymentAccountId(null);
    closeAfterSuccess();
    Alert.alert('Settled up', `Your payment to ${friendName} was recorded.`);
  }, [
    account?.id,
    amount,
    closeAfterSuccess,
    friendName,
    friendship,
    submitSettlement,
    token,
  ]);

  return {
    account,
    accounts,
    amount,
    amountError: displayedAmountError,
    close,
    closeAccountPicker: () => setIsAccountPickerVisible(false),
    currencies,
    currentUser,
    error,
    friendName,
    friendUser,
    isAccountPickerVisible,
    isLoading,
    isSaving,
    isSubmitDisabled:
      isSaving ||
      !friendship ||
      Object.keys(validationErrors).length > 0,
    openAccountPicker: () => {
      if (accounts.length > 0) {
        setIsAccountPickerVisible(true);
      }
    },
    selectPaymentAccount: (accountId) => {
      setSelectedPaymentAccountId(accountId);
      setIsAccountPickerVisible(false);
      setError('');
    },
    setAmount,
    submit: () => void submit(),
  };
};

export default useRecordPayment;
