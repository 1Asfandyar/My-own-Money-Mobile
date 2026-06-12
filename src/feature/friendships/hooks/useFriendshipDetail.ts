import { useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useEffect, useMemo, useState } from 'react';

import { ROUTES } from '@/config/routes';
import { useAccountsOverviewStore } from '@/feature/accounts/store/accountsOverview.store';
import { getFriendship } from '@/feature/friendships/api/friendships.api';
import type {
  FriendshipDetail,
  FriendshipDetailViewModel,
} from '@/feature/friendships/types/friendship.types';
import {
  getFriendshipBalanceColor,
  getFriendshipBalanceLabel,
} from '@/feature/friendships/utils/friendshipDisplay.utils';
import type { ApiTransaction } from '@/feature/transactions/types/transaction.types';
import { getTransactionListItem } from '@/feature/transactions/utils/transactionListItem.utils';
import { ApiError } from '@/services/api';
import { useAuthStore } from '@/store/auth.store';
import { fallbackCurrencies, formatCents, getCurrencyById } from '@/utils/currency';

const useFriendshipDetail = (): FriendshipDetailViewModel => {
  const router = useRouter();
  const params = useLocalSearchParams<{ friendshipId?: string }>();
  const routeFriendshipId = Number(params.friendshipId);
  const friendshipId = Number.isFinite(routeFriendshipId)
    ? routeFriendshipId
    : null;
  const token = useAuthStore((state) => state.token);
  const user = useAuthStore((state) => state.user);
  const clearSession = useAuthStore((state) => state.clearSession);
  const accounts = useAccountsOverviewStore((state) => state.accounts);
  const currencies = useAccountsOverviewStore((state) => state.currencies);
  const selectedAccountId = useAccountsOverviewStore(
    (state) => state.selectedAccountId,
  );
  const [error, setError] = useState<string | null>(null);
  const [friendship, setFriendship] = useState<FriendshipDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const activeAccounts = useMemo(
    () => accounts.filter((account) => !account.is_archived),
    [accounts],
  );
  const selectedAccount = useMemo(
    () =>
      activeAccounts.find((account) => account.id === selectedAccountId) ??
      activeAccounts[0],
    [activeAccounts, selectedAccountId],
  );
  const displayCurrencies = currencies.length > 0 ? currencies : fallbackCurrencies;
  const displayCurrency = getCurrencyById(
    selectedAccount?.currency_id ?? user?.currency_id,
    displayCurrencies,
  );
  const balance = friendship?.balance_summary ?? {
    amount_cents: 0,
    type: 'settled_up' as const,
  };

  const transactions = useMemo(
    () => (friendship?.transactions ?? []).map((t) => getTransactionListItem(t, displayCurrencies)),
    [displayCurrencies, friendship?.transactions],
  );

  const redirectToLogin = useCallback(async () => {
    await clearSession();
    router.replace(ROUTES.AUTH_LOGIN);
  }, [clearSession, router]);

  const loadFriendship = useCallback(async () => {
    if (!token || !friendshipId) {
      setError('Could not open this friend.');
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const nextFriendship = await getFriendship(token, friendshipId);

      setFriendship(nextFriendship);
    } catch (requestError) {
      if (requestError instanceof ApiError && requestError.status === 401) {
        await redirectToLogin();
        return;
      }

      setError(
        requestError instanceof Error
          ? requestError.message
          : 'Could not load friend details.',
      );
    } finally {
      setIsLoading(false);
    }
  }, [friendshipId, redirectToLogin, token]);

  useEffect(() => {
    void loadFriendship();
  }, [loadFriendship]);

  const onBack = useCallback(() => {
    router.back();
  }, [router]);

  const onSelectTransaction = useCallback(
    (transaction: ApiTransaction) => {
      router.push({
        pathname: ROUTES.TRANSACTION_DETAIL,
        params: { transactionId: String(transaction.id) },
      });
    },
    [router],
  );

  const onSettleUp = useCallback(() => {
    if (!friendship?.friend || !selectedAccount?.id) {
      return;
    }

    router.push({
      pathname: ROUTES.RECORD_PAYMENT,
      params: {
        accountId: selectedAccount.id,
        amountCents: Math.abs(balance.amount_cents),
        balanceType: balance.type,
        friendId: friendship.friend.id,
        friendName:
          friendship.friend.full_name?.trim() ||
          friendship.friend.email?.trim() ||
          `Friend #${friendship.friend.id}`,
      },
    });
  }, [balance.amount_cents, balance.type, friendship?.friend, router, selectedAccount?.id]);

  return {
    balanceAmountLabel: formatCents(
      Math.abs(balance.amount_cents),
      displayCurrency.id,
      displayCurrencies,
    ),
    balanceColor: getFriendshipBalanceColor(balance.type),
    balanceLabel: getFriendshipBalanceLabel(balance.type),
    error,
    friend: friendship?.friend ?? null,
    friendship,
    isLoading,
    onBack,
    onRetry: loadFriendship,
    onSelectTransaction,
    onSettleUp,
    settleUpDisabled:
      !friendship ||
      !selectedAccount?.id ||
      balance.type === 'settled_up' ||
      Math.abs(balance.amount_cents) <= 0,
    transactions,
  };
};

export default useFriendshipDetail;
