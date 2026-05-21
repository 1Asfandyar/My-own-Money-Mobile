import { useRouter } from 'expo-router';
import { useCallback, useEffect, useMemo, useRef } from 'react';

import { ROUTES } from '@/config/routes';
import { listAccounts } from '@/feature/accounts/api/accounts.api';
import { useAccountsOverviewStore } from '@/feature/accounts/store/accountsOverview.store';
import type { AccountsOverviewViewModel } from '@/feature/accounts/types/accountsOverview.types';
import type { TransactionCategoryBreakdown } from '@/feature/categories/types/categoryDashboard.types';
import { listCurrencies } from '@/feature/currencies/api/currencies.api';
import {
  listSharedExpenseTransactions,
  listTransactionsByCategory,
} from '@/feature/transactions/api/transactions.api';
import { ApiError } from '@/services/api';
import { useAuthStore } from '@/store/auth.store';
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
  const sharedDashboardRequestIdRef = useRef(0);
  const token = useAuthStore((state) => state.token);
  const user = useAuthStore((state) => state.user);
  const clearSession = useAuthStore((state) => state.clearSession);
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
  const isAccountPickerVisible = useAccountsOverviewStore(
    (state) => state.isAccountPickerVisible,
  );
  const isCategoryDashboardLoading = useAccountsOverviewStore(
    (state) => state.isCategoryDashboardLoading,
  );
  const isSharedExpensesDashboardLoading = useAccountsOverviewStore(
    (state) => state.isSharedExpensesDashboardLoading,
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
  const sharedExpensesDashboard = useAccountsOverviewStore(
    (state) => state.sharedExpensesDashboard,
  );
  const sharedExpensesDashboardError = useAccountsOverviewStore(
    (state) => state.sharedExpensesDashboardError,
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
  const setIsCategoryDashboardLoading = useAccountsOverviewStore(
    (state) => state.setIsCategoryDashboardLoading,
  );
  const setIsSharedExpensesDashboardLoading = useAccountsOverviewStore(
    (state) => state.setIsSharedExpensesDashboardLoading,
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
  const setSharedExpensesDashboard = useAccountsOverviewStore(
    (state) => state.setSharedExpensesDashboard,
  );
  const setSharedExpensesDashboardError = useAccountsOverviewStore(
    (state) => state.setSharedExpensesDashboardError,
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
  const displayCurrencyId =
    selectedAccount?.currency_id ?? user?.currency_id ?? activeAccounts[0]?.currency_id;
  const displayCurrency = getCurrencyById(displayCurrencyId, currencies);
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
  const sharedExpenseFriends = useMemo(
    () => sharedExpensesDashboard?.friends ?? [],
    [sharedExpensesDashboard],
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
    if (!token || !selectedAccount?.id || selectedExpenseTab !== 'personal') {
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
      const nextDashboard = await listTransactionsByCategory(
        token,
        selectedAccount.id,
      );

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
    redirectToLogin,
    selectedAccount?.id,
    selectedExpenseTab,
    setCategoryDashboard,
    setCategoryDashboardError,
    setIsCategoryDashboardLoading,
    token,
  ]);

  const refreshSharedExpensesDashboard = useCallback(async () => {
    if (!token || !selectedAccount?.id || selectedExpenseTab !== 'shared') {
      sharedDashboardRequestIdRef.current += 1;
      setSharedExpensesDashboard(null);
      setSharedExpensesDashboardError(null);
      setIsSharedExpensesDashboardLoading(false);
      return;
    }

    const requestId = sharedDashboardRequestIdRef.current + 1;
    sharedDashboardRequestIdRef.current = requestId;
    setIsSharedExpensesDashboardLoading(true);
    setSharedExpensesDashboardError(null);

    try {
      const nextDashboard = await listSharedExpenseTransactions(
        token,
        selectedAccount.id,
      );

      if (sharedDashboardRequestIdRef.current !== requestId) {
        return;
      }

      setSharedExpensesDashboard(nextDashboard);
    } catch (requestError) {
      if (sharedDashboardRequestIdRef.current !== requestId) {
        return;
      }

      if (requestError instanceof ApiError && requestError.status === 401) {
        await redirectToLogin();
        return;
      }

      setSharedExpensesDashboardError(
        requestError instanceof Error
          ? requestError.message
          : 'Could not load shared expenses.',
      );
    } finally {
      if (sharedDashboardRequestIdRef.current === requestId) {
        setIsSharedExpensesDashboardLoading(false);
      }
    }
  }, [
    redirectToLogin,
    selectedAccount?.id,
    selectedExpenseTab,
    setIsSharedExpensesDashboardLoading,
    setSharedExpensesDashboard,
    setSharedExpensesDashboardError,
    token,
  ]);

  const refreshOverview = useCallback(() => {
    void refreshAccounts();
    if (selectedExpenseTab === 'shared') {
      void refreshSharedExpensesDashboard();
      return;
    }

    void refreshCategoryDashboard();
  }, [
    refreshAccounts,
    refreshCategoryDashboard,
    refreshSharedExpensesDashboard,
    selectedExpenseTab,
  ]);

  useEffect(() => {
    void refreshAccounts();
  }, [refreshAccounts]);

  useEffect(() => {
    void refreshCategoryDashboard();
  }, [refreshCategoryDashboard]);

  useEffect(() => {
    void refreshSharedExpensesDashboard();
  }, [refreshSharedExpensesDashboard]);

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

  const closeDashboardCategory = useCallback(() => {
    setSelectedCategoryId(null);
  }, [setSelectedCategoryId]);

  return {
    activeAccounts,
    categoryBreakdowns,
    categoryDashboard,
    categoryDashboardError,
    categoryTotals,
    closeAccountPicker: closeStoredAccountPicker,
    closeDashboardCategory,
    currencies,
    displayCurrency,
    error,
    isCategoryDashboardLoading,
    isAccountPickerVisible,
    isSharedExpensesDashboardLoading,
    isLoading,
    openAccountPicker,
    refreshAccounts,
    refreshCategoryDashboard,
    refreshOverview,
    refreshSharedExpensesDashboard,
    selectedAccount,
    selectedCategoryBreakdown,
    selectedExpenseTab,
    selectAccount,
    selectDashboardCategory,
    setSelectedExpenseTab,
    sharedExpenseFriends,
    sharedExpensesDashboard,
    sharedExpensesDashboardError,
    userFirstName,
  };
};
