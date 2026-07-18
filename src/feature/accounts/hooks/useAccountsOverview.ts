import { useRouter } from 'expo-router';
import { useCallback, useEffect, useMemo, useRef } from 'react';

import { ROUTES } from '@/config/routes';
import { listAccounts } from '@/feature/accounts/api/accounts.api';
import { useAccountsOverviewStore } from '@/feature/accounts/store/accountsOverview.store';
import type { AccountsOverviewViewModel } from '@/feature/accounts/types/accountsOverview.types';
import { getCategoriesSummary } from '@/feature/categories/api/categories.api';
import type { TransactionCategoryBreakdown } from '@/feature/categories/types/categoryDashboard.types';
import { listCurrencies } from '@/feature/currencies/api/currencies.api';
import { listFriendships } from '@/feature/friendships/api/friendships.api';
import type { Transaction } from '@/feature/transactions/types/transaction.types';
import {
    getTransactionEditRouteParams,
    isSharedTransaction,
} from '@/feature/transactions/utils/transactionRouteParams.utils';
import { ApiError } from '@/services/api';
import { useAuthStore } from '@/store/auth.store';
import { useServerDataInvalidationStore } from '@/store/serverDataInvalidation.store';
import { fallbackCurrencies, getCurrencyById } from '@/utils/currency';

const getDashboardTotals = (categories: TransactionCategoryBreakdown[]) =>
  categories.reduce(
    (totals, item) => {
      const amount = Math.abs(item.amount_cents);

      if (item.category.category_type === 'income') {
        return {
          ...totals,
          totalIncomeCents: totals.totalIncomeCents + amount,
        };
      }

      return {
        ...totals,
        totalExpenseCents: totals.totalExpenseCents + amount,
      };
    },
    { totalExpenseCents: 0, totalIncomeCents: 0 },
  );

export const useAccountsOverview = (): AccountsOverviewViewModel => {
  const router = useRouter();
  const accountsRequestIdRef = useRef(0);
  const categoryDashboardRequestIdRef = useRef(0);
  const friendshipDashboardRequestIdRef = useRef(0);
  const token = useAuthStore((state) => state.token);
  const user = useAuthStore((state) => state.user);
  const clearSession = useAuthStore((state) => state.clearSession);
  const accountsDataVersion = useServerDataInvalidationStore(
    (state) => state.accounts,
  );
  const friendshipDataVersion = useServerDataInvalidationStore(
    (state) => state.friendships,
  );
  const accounts = useAccountsOverviewStore((state) => state.accounts);
  const categoryDashboard = useAccountsOverviewStore(
    (state) => state.categoryDashboard,
  );
  const categoryDashboardError = useAccountsOverviewStore(
    (state) => state.categoryDashboardError,
  );
  const closeStoredAccountPicker = useAccountsOverviewStore(
    (state) => state.closeAccountPicker,
  );
  const currencies = useAccountsOverviewStore((state) => state.currencies);
  const error = useAccountsOverviewStore((state) => state.error);
  const friendshipDashboardError = useAccountsOverviewStore(
    (state) => state.friendshipDashboardError,
  );
  const friendshipLedgers = useAccountsOverviewStore(
    (state) => state.friendshipLedgers,
  );
  const isAccountPickerVisible = useAccountsOverviewStore(
    (state) => state.isAccountPickerVisible,
  );
  const isCategoryDashboardLoading = useAccountsOverviewStore(
    (state) => state.isCategoryDashboardLoading,
  );
  const isFriendshipDashboardLoading = useAccountsOverviewStore(
    (state) => state.isFriendshipDashboardLoading,
  );
  const isLoading = useAccountsOverviewStore((state) => state.isLoading);
  const openStoredAccountPicker = useAccountsOverviewStore(
    (state) => state.openAccountPicker,
  );
  const selectedAccountId = useAccountsOverviewStore(
    (state) => state.selectedAccountId,
  );
  const selectedCategoryId = useAccountsOverviewStore(
    (state) => state.selectedCategoryId,
  );
  const selectedExpenseTab = useAccountsOverviewStore(
    (state) => state.selectedExpenseTab,
  );
  const setAccounts = useAccountsOverviewStore((state) => state.setAccounts);
  const setCategoryDashboard = useAccountsOverviewStore(
    (state) => state.setCategoryDashboard,
  );
  const setCategoryDashboardError = useAccountsOverviewStore(
    (state) => state.setCategoryDashboardError,
  );
  const setCurrencies = useAccountsOverviewStore((state) => state.setCurrencies);
  const setError = useAccountsOverviewStore((state) => state.setError);
  const setFriendshipDashboardError = useAccountsOverviewStore(
    (state) => state.setFriendshipDashboardError,
  );
  const setFriendshipLedgers = useAccountsOverviewStore(
    (state) => state.setFriendshipLedgers,
  );
  const setIsCategoryDashboardLoading = useAccountsOverviewStore(
    (state) => state.setIsCategoryDashboardLoading,
  );
  const setIsFriendshipDashboardLoading = useAccountsOverviewStore(
    (state) => state.setIsFriendshipDashboardLoading,
  );
  const setIsLoading = useAccountsOverviewStore((state) => state.setIsLoading);
  const setSelectedAccountId = useAccountsOverviewStore(
    (state) => state.setSelectedAccountId,
  );
  const setSelectedCategoryId = useAccountsOverviewStore(
    (state) => state.setSelectedCategoryId,
  );
  const setSelectedExpenseTab = useAccountsOverviewStore(
    (state) => state.setSelectedExpenseTab,
  );
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
  // The category dashboard API isn't scoped to a single account, so it only
  // needs to be refetched when an account becomes available/unavailable -
  // not every time the user swipes between accounts they already have data for.
  const hasSelectedAccount = Boolean(selectedAccount?.id);
  // The app currently supports a single app-wide currency, so the display
  // currency is intentionally not derived from the selected account. This
  // keeps swiping between accounts from changing the currency (and
  // re-rendering everything below the balance card) even if individual
  // accounts happen to have a different currency_id.
  const displayCurrencyId = user?.currency_id ?? activeAccounts[0]?.currency_id;
  const displayCurrency = useMemo(
    () => getCurrencyById(displayCurrencyId, currencies),
    [displayCurrencyId, currencies],
  );
  const userFirstName = user?.full_name?.split(' ')[0];
  const categoryBreakdowns = useMemo(
    () =>
      [...(categoryDashboard?.categories ?? [])].sort(
        (first, second) =>
          Math.abs(second.amount_cents) - Math.abs(first.amount_cents),
      ),
    [categoryDashboard],
  );
  const categoryTotals = useMemo(
    () => getDashboardTotals(categoryBreakdowns),
    [categoryBreakdowns],
  );
  const selectedCategoryBreakdown = useMemo(
    () =>
      categoryBreakdowns.find(
        (item) => item.category.id === selectedCategoryId,
      ),
    [categoryBreakdowns, selectedCategoryId],
  );
  const redirectToLogin = useCallback(async () => {
    await clearSession();
    router.replace(ROUTES.AUTH_LOGIN);
  }, [clearSession, router]);

  const refreshAccounts = useCallback(async () => {
    if (!token) {
      accountsRequestIdRef.current += 1;
      setIsLoading(false);
      return;
    }

    const requestId = accountsRequestIdRef.current + 1;
    accountsRequestIdRef.current = requestId;
    setIsLoading(true);
    setError(null);

    try {
      const [nextAccounts, nextCurrencies] = await Promise.all([
        listAccounts(token),
        listCurrencies(token).catch((error: unknown) => {
          if (error instanceof ApiError && error.status === 401) {
            throw error;
          }

          return fallbackCurrencies;
        }),
      ]);

      if (accountsRequestIdRef.current !== requestId) {
        return;
      }

      setAccounts(nextAccounts);
      setCurrencies(nextCurrencies.length > 0 ? nextCurrencies : fallbackCurrencies);
    } catch (requestError) {
      if (accountsRequestIdRef.current !== requestId) {
        return;
      }

      if (requestError instanceof ApiError && requestError.status === 401) {
        await redirectToLogin();
        return;
      }

      setError(
        requestError instanceof Error
          ? requestError.message
          : 'Could not load accounts.',
      );
    } finally {
      if (accountsRequestIdRef.current === requestId) {
        setIsLoading(false);
      }
    }
  }, [
    redirectToLogin,
    setAccounts,
    setCurrencies,
    setError,
    setIsLoading,
    token,
  ]);

  const refreshCategoryDashboard = useCallback(async () => {
    if (!token || !hasSelectedAccount || selectedExpenseTab !== 'personal') {
      categoryDashboardRequestIdRef.current += 1;
      setCategoryDashboard(null);
      setCategoryDashboardError(null);
      setIsCategoryDashboardLoading(false);
      return;
    }

    const requestId = categoryDashboardRequestIdRef.current + 1;
    categoryDashboardRequestIdRef.current = requestId;
    setIsCategoryDashboardLoading(true);
    setCategoryDashboardError(null);

    try {
      const nextDashboard = await getCategoriesSummary(token);

      if (categoryDashboardRequestIdRef.current !== requestId) {
        return;
      }

      setCategoryDashboard(nextDashboard);
    } catch (requestError) {
      if (categoryDashboardRequestIdRef.current !== requestId) {
        return;
      }

      if (requestError instanceof ApiError && requestError.status === 401) {
        await redirectToLogin();
        return;
      }

      setCategoryDashboardError(
        requestError instanceof Error
          ? requestError.message
          : 'Could not load category dashboard.',
      );
    } finally {
      if (categoryDashboardRequestIdRef.current === requestId) {
        setIsCategoryDashboardLoading(false);
      }
    }
  }, [
    hasSelectedAccount,
    redirectToLogin,
    selectedExpenseTab,
    setCategoryDashboard,
    setCategoryDashboardError,
    setIsCategoryDashboardLoading,
    token,
  ]);

  const refreshFriendshipDashboard = useCallback(async () => {
    if (!token || selectedExpenseTab !== 'shared') {
      friendshipDashboardRequestIdRef.current += 1;
      setFriendshipLedgers([]);
      setFriendshipDashboardError(null);
      setIsFriendshipDashboardLoading(false);
      return;
    }

    const requestId = friendshipDashboardRequestIdRef.current + 1;
    friendshipDashboardRequestIdRef.current = requestId;
    setIsFriendshipDashboardLoading(true);
    setFriendshipDashboardError(null);

    try {
      const ledgers = await listFriendships(token);

      if (friendshipDashboardRequestIdRef.current !== requestId) {
        return;
      }

      setFriendshipLedgers(ledgers);
    } catch (requestError) {
      if (friendshipDashboardRequestIdRef.current !== requestId) {
        return;
      }

      if (requestError instanceof ApiError && requestError.status === 401) {
        await redirectToLogin();
        return;
      }

      setFriendshipDashboardError(
        requestError instanceof Error
          ? requestError.message
          : 'Could not load shared balances.',
      );
    } finally {
      if (friendshipDashboardRequestIdRef.current === requestId) {
        setIsFriendshipDashboardLoading(false);
      }
    }
  }, [
    redirectToLogin,
    selectedExpenseTab,
    setFriendshipDashboardError,
    setFriendshipLedgers,
    setIsFriendshipDashboardLoading,
    token,
  ]);

  const refreshOverview = useCallback(() => {
    void refreshAccounts();
    void refreshCategoryDashboard();
    void refreshFriendshipDashboard();
  }, [refreshAccounts, refreshCategoryDashboard, refreshFriendshipDashboard]);

  useEffect(() => {
    void refreshAccounts();
  }, [accountsDataVersion, refreshAccounts]);

  useEffect(() => {
    void refreshCategoryDashboard();
  }, [refreshCategoryDashboard]);

  useEffect(() => {
    void refreshFriendshipDashboard();
  }, [friendshipDataVersion, refreshFriendshipDashboard]);

  useEffect(() => {
    if (activeAccounts.length === 0) {
      setSelectedAccountId(null);
      return;
    }

    const hasSelectedAccount = activeAccounts.some(
      (account) => account.id === selectedAccountId,
    );

    if (!hasSelectedAccount) {
      setSelectedAccountId(activeAccounts[0].id);
    }
  }, [activeAccounts, selectedAccountId, setSelectedAccountId]);

  useEffect(() => {
    setSelectedCategoryId(null);
  }, [selectedAccount?.id, selectedExpenseTab, setSelectedCategoryId]);

  useEffect(() => {
    if (selectedCategoryId && !selectedCategoryBreakdown) {
      setSelectedCategoryId(null);
    }
  }, [selectedCategoryBreakdown, selectedCategoryId, setSelectedCategoryId]);

  const openAccountPicker = useCallback(() => {
    if (activeAccounts.length > 0) {
      openStoredAccountPicker();
    }
  }, [activeAccounts.length, openStoredAccountPicker]);

  const selectAccount = useCallback((accountId: number) => {
    setSelectedAccountId(accountId);
    closeStoredAccountPicker();
  }, [closeStoredAccountPicker, setSelectedAccountId]);

  const selectDashboardCategory = useCallback((categoryId: number) => {
    setSelectedCategoryId(categoryId);
  }, [setSelectedCategoryId]);

  const selectFriendship = useCallback(
    (friendshipId: number) => {
      router.push({
        pathname: ROUTES.FRIENDSHIP_DETAIL,
        params: { friendshipId },
      });
    },
    [router],
  );

  const closeDashboardCategory = useCallback(() => {
    setSelectedCategoryId(null);
  }, [setSelectedCategoryId]);

  const addDashboardCategoryRecord = useCallback((categoryId: number) => {
    const categoryBreakdown = categoryBreakdowns.find(
      (item) => item.category.id === categoryId,
    );

    if (!selectedAccount?.id || !categoryBreakdown) {
      return;
    }

    setSelectedCategoryId(null);
    router.push({
      pathname: ROUTES.ADD_PERSONAL_RECORD,
      params: {
        accountId: selectedAccount.id,
        categoryId,
        transactionType: categoryBreakdown.category.category_type,
      },
    });
  }, [categoryBreakdowns, router, selectedAccount?.id, setSelectedCategoryId]);

  const selectDashboardCategoryTransaction = useCallback(
    (transaction: Transaction) => {
      setSelectedCategoryId(null);

      if (isSharedTransaction(transaction)) {
        router.push({
          pathname: ROUTES.TRANSACTION_DETAIL,
          params: { transactionId: String(transaction.id) },
        });
        return;
      }

      router.push({
        pathname: ROUTES.ADD_PERSONAL_RECORD,
        params: getTransactionEditRouteParams(transaction),
      });
    },
    [router, setSelectedCategoryId],
  );

  return {
    activeAccounts,
    addDashboardCategoryRecord,
    categoryBreakdowns,
    categoryDashboard,
    categoryDashboardError,
    categoryTotals,
    closeAccountPicker: closeStoredAccountPicker,
    closeDashboardCategory,
    currencies,
    displayCurrency,
    error,
    friendshipDashboardError,
    friendshipLedgers,
    isCategoryDashboardLoading,
    isAccountPickerVisible,
    isFriendshipDashboardLoading,
    isLoading,
    openAccountPicker,
    refreshAccounts,
    refreshCategoryDashboard,
    refreshFriendshipDashboard,
    refreshOverview,
    selectedAccount,
    selectedCategoryBreakdown,
    selectedExpenseTab,
    selectAccount,
    selectDashboardCategory,
    selectDashboardCategoryTransaction,
    selectFriendship,
    setSelectedExpenseTab,
    userFirstName,
  };
};
