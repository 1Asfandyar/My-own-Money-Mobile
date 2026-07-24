import { useRouter } from 'expo-router';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { ROUTES } from '@/config/routes';
import { getDashboardData } from '@/feature/accounts/api/dashboard.api';
import { useAccountsOverviewStore } from '@/feature/accounts/store/accountsOverview.store';
import type { AccountsOverviewViewModel } from '@/feature/accounts/types/accountsOverview.types';
import type { TransactionCategoryBreakdown } from '@/feature/categories/types/categoryDashboard.types';
import type { Transaction } from '@/feature/transactions/types/transaction.types';
import {
  getTransactionEditRouteParams,
  isSharedTransaction,
} from '@/feature/transactions/utils/transactionRouteParams.utils';
import { ApiError } from '@/services/api';
import { useAuthStore } from '@/store/auth.store';
import { useServerDataInvalidationStore } from '@/store/serverDataInvalidation.store';
import { fallbackCurrencies, getCurrencyById } from '@/utils/currency';

const emptyDashboardSummary = {
  total_income: 0,
  total_expense: 0,
  total_owed_to_you_cents: 0,
  total_you_owe_cents: 0,
};

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
  const dashboardRequestIdRef = useRef(0);
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
  const [dashboardSummary, setDashboardSummary] = useState(emptyDashboardSummary);
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
  // The app uses a single user-level currency across all accounts.
  const displayCurrencyId = user?.currency_id ?? fallbackCurrencies[0].id;
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
      dashboardRequestIdRef.current += 1;
      setAccounts([]);
      setDashboardSummary(emptyDashboardSummary);
      setCategoryDashboard(null);
      setCategoryDashboardError(null);
      setFriendshipLedgers([]);
      setFriendshipDashboardError(null);
      setError(null);
      setIsLoading(false);
      setIsCategoryDashboardLoading(false);
      setIsFriendshipDashboardLoading(false);
      return;
    }

    const requestId = dashboardRequestIdRef.current + 1;
    dashboardRequestIdRef.current = requestId;
    setIsLoading(true);
    setIsCategoryDashboardLoading(true);
    setIsFriendshipDashboardLoading(true);
    setCategoryDashboardError(null);
    setFriendshipDashboardError(null);
    setError(null);

    try {
      const dashboard = await getDashboardData(token);

      if (dashboardRequestIdRef.current !== requestId) {
        return;
      }

      setAccounts(dashboard.accounts);
      setDashboardSummary(dashboard.summary ?? emptyDashboardSummary);
      setCategoryDashboard(dashboard.categoryDashboard);
      setFriendshipLedgers(dashboard.friendshipLedgers);
      setCurrencies(fallbackCurrencies);
    } catch (requestError) {
      if (dashboardRequestIdRef.current !== requestId) {
        return;
      }

      if (requestError instanceof ApiError && requestError.status === 401) {
        await redirectToLogin();
        return;
      }

      setError(
        requestError instanceof Error
          ? requestError.message
          : 'Could not load dashboard.',
      );
    } finally {
      if (dashboardRequestIdRef.current === requestId) {
        setIsLoading(false);
        setIsCategoryDashboardLoading(false);
        setIsFriendshipDashboardLoading(false);
      }
    }
  }, [
    redirectToLogin,
    setAccounts,
    setCategoryDashboard,
    setCategoryDashboardError,
    setCurrencies,
    setError,
    setFriendshipDashboardError,
    setFriendshipLedgers,
    setIsCategoryDashboardLoading,
    setIsFriendshipDashboardLoading,
    setIsLoading,
    token,
  ]);

  const refreshCategoryDashboard = useCallback(async () => {
    await refreshAccounts();
  }, [refreshAccounts]);

  const refreshFriendshipDashboard = useCallback(async () => {
    await refreshAccounts();
  }, [refreshAccounts]);

  const refreshOverview = useCallback(() => {
    void refreshAccounts();
  }, [refreshAccounts]);

  useEffect(() => {
    void refreshAccounts();
  }, [accountsDataVersion, friendshipDataVersion, refreshAccounts]);

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
    dashboardSummary,
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
