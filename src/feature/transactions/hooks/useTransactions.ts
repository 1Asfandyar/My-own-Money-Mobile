import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { ROUTES } from '@/config/routes';
import { listAccounts } from '@/feature/accounts/api/accounts.api';
import { useAccountsOverviewStore } from '@/feature/accounts/store/accountsOverview.store';
import { listCategories } from '@/feature/categories/api/categories.api';
import type { Category } from '@/feature/categories/types/category.types';
import { listCurrencies } from '@/feature/currencies/api/currencies.api';
import {
  CATEGORY_COLOR_FALLBACK,
  CATEGORY_ICON_FALLBACK,
  CATEGORY_SUMMARY_ICONS,
  CATEGORY_TYPE_LABELS,
} from '@/feature/categories/constants/categoryDashboard.constants';
import { EMPTY_TRANSACTION_DATE_FILTERS } from '@/feature/transactions/constants/transactionDateFilter.constants';
import { listAccountTransactions } from '@/feature/transactions/api/transactions.api';
import { useTransactionsStore } from '@/feature/transactions/store/transactions.store';
import type {
  Transaction,
  TransactionListItem,
  TransactionsSummaryMetric,
  TransactionsViewModel,
} from '@/feature/transactions/types/transaction.types';
import type { TransactionDateFilters } from '@/feature/transactions/types/transactionDateFilter.types';
import {
  getSignedTransactionAmountCents,
  getTransactionAmountCents,
} from '@/feature/transactions/utils/transactionAmount.utils';
import { ApiError } from '@/services/api';
import { useAuthStore } from '@/store/auth.store';
import type { Currency } from '@/types/currency.types';
import {
  fallbackCurrencies,
  formatCents,
  getCurrencyById,
} from '@/utils/currency';

const getSoftColor = (color: string) =>
  /^#[0-9a-f]{6}$/i.test(color) ? `${color}1A` : '#F3F4F6';

const getTransactionTimestamp = (transaction: Transaction) => {
  const date = new Date(transaction.transaction_date);

  if (!Number.isNaN(date.getTime())) {
    return date.getTime();
  }

  return transaction.id;
};

const formatTransactionDate = (value: string) => {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return 'No date';

  return date.toLocaleDateString(undefined, {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
};

const formatSignedCents = (
  cents: number,
  currencyId: number,
  currencies: Currency[],
) => {
  const sign = cents >= 0 ? '+' : '-';

  return `${sign}${formatCents(Math.abs(cents), currencyId, currencies)}`;
};

const getTransactionIcon = (
  transaction: Transaction,
  category?: Category,
): keyof typeof Ionicons.glyphMap => {
  if (category?.icon && category.icon in Ionicons.glyphMap) {
    return category.icon as keyof typeof Ionicons.glyphMap;
  }

  return CATEGORY_ICON_FALLBACK[transaction.transaction_type];
};

const getTransactionListItem = (
  transaction: Transaction,
  category: Category | undefined,
  displayCurrency: Currency,
  currencies: Currency[],
): TransactionListItem => {
  const color =
    category?.color ?? CATEGORY_COLOR_FALLBACK[transaction.transaction_type];
  const categoryLabel = category?.name ?? `Category #${transaction.category_id}`;
  const typeLabel = CATEGORY_TYPE_LABELS[transaction.transaction_type];

  return {
    amountLabel: formatSignedCents(
      getSignedTransactionAmountCents(transaction),
      transaction.currency_id ?? displayCurrency.id,
      currencies,
    ),
    categoryLabel,
    color,
    dateLabel: formatTransactionDate(transaction.transaction_date),
    iconName: getTransactionIcon(transaction, category),
    id: transaction.id,
    note: transaction.note?.trim() || undefined,
    softColor: getSoftColor(color),
    title: transaction.title || categoryLabel || typeLabel,
    typeLabel,
  };
};

const getSummaryMetric = (
  type: Transaction['transaction_type'],
  amountCents: number,
  displayCurrency: Currency,
  currencies: Currency[],
): TransactionsSummaryMetric => {
  const color = CATEGORY_COLOR_FALLBACK[type];
  const signedAmount = type === 'income' ? amountCents : -amountCents;

  return {
    amountLabel: formatSignedCents(signedAmount, displayCurrency.id, currencies),
    color,
    iconName: CATEGORY_SUMMARY_ICONS[type],
    label: CATEGORY_TYPE_LABELS[type],
    softColor: getSoftColor(color),
    type,
  };
};

const getSummaryMetrics = (
  transactions: Transaction[],
  displayCurrency: Currency,
  currencies: Currency[],
) => {
  const totals = transactions.reduce(
    (nextTotals, transaction) => {
      const amount = Math.abs(getTransactionAmountCents(transaction));

      if (transaction.transaction_type === 'income') {
        return {
          ...nextTotals,
          income: nextTotals.income + amount,
        };
      }

      return {
        ...nextTotals,
        expense: nextTotals.expense + amount,
      };
    },
    { expense: 0, income: 0 },
  );

  return [
    getSummaryMetric('income', totals.income, displayCurrency, currencies),
    getSummaryMetric('expense', totals.expense, displayCurrency, currencies),
  ];
};

export const useTransactions = (): TransactionsViewModel => {
  const router = useRouter();
  const transactionRequestIdRef = useRef(0);
  const [dateFilters, setDateFilters] = useState<TransactionDateFilters>(
    EMPTY_TRANSACTION_DATE_FILTERS,
  );
  const [isTransactionAccountPickerVisible, setIsTransactionAccountPickerVisible] =
    useState(false);
  const [hasLoadedTransactions, setHasLoadedTransactions] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('');
  const token = useAuthStore((state) => state.token);
  const user = useAuthStore((state) => state.user);
  const clearSession = useAuthStore((state) => state.clearSession);
  const accounts = useAccountsOverviewStore((state) => state.accounts);
  const currencies = useAccountsOverviewStore((state) => state.currencies);
  const selectedAccountId = useAccountsOverviewStore(
    (state) => state.selectedAccountId,
  );
  const setAccounts = useAccountsOverviewStore((state) => state.setAccounts);
  const setCurrencies = useAccountsOverviewStore((state) => state.setCurrencies);
  const setSelectedAccountId = useAccountsOverviewStore(
    (state) => state.setSelectedAccountId,
  );
  const categories = useTransactionsStore((state) => state.categories);
  const error = useTransactionsStore((state) => state.error);
  const isAccountContextLoading = useTransactionsStore(
    (state) => state.isAccountContextLoading,
  );
  const isLoading = useTransactionsStore((state) => state.isLoading);
  const setCategories = useTransactionsStore((state) => state.setCategories);
  const setError = useTransactionsStore((state) => state.setError);
  const setIsAccountContextLoading = useTransactionsStore(
    (state) => state.setIsAccountContextLoading,
  );
  const setIsLoading = useTransactionsStore((state) => state.setIsLoading);
  const setTransactions = useTransactionsStore(
    (state) => state.setTransactions,
  );
  const transactions = useTransactionsStore((state) => state.transactions);

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
  const displayCurrency = getCurrencyById(
    selectedAccount?.currency_id ?? user?.currency_id,
    currencies,
  );
  const accountBalanceLabel = formatCents(
    selectedAccount?.current_balance_cents ?? 0,
    displayCurrency.id,
    currencies,
  );
  const sortedTransactions = useMemo(
    () =>
      [...transactions].sort(
        (first, second) =>
          getTransactionTimestamp(second) - getTransactionTimestamp(first),
      ),
    [transactions],
  );
  const categoryById = useMemo(
    () => new Map(categories.map((category) => [category.id, category])),
    [categories],
  );
  const transactionItems = useMemo(
    () =>
      sortedTransactions.map((transaction) =>
        getTransactionListItem(
          transaction,
          categoryById.get(transaction.category_id),
          displayCurrency,
          currencies,
        ),
      ),
    [categoryById, currencies, displayCurrency, sortedTransactions],
  );
  const summaryMetrics = useMemo(
    () => getSummaryMetrics(sortedTransactions, displayCurrency, currencies),
    [currencies, displayCurrency, sortedTransactions],
  );
  const hasActiveSearch = searchQuery.trim().length > 0;
  const hasActiveDateFilter = Boolean(dateFilters.fromDate || dateFilters.toDate);
  const hasActiveFilters = hasActiveSearch || hasActiveDateFilter;

  const updateSearchQuery = useCallback((query: string) => {
    setSearchQuery(query);
  }, []);

  const applyDateFilters = useCallback((filters: TransactionDateFilters) => {
    setDateFilters({
      fromDate: filters.fromDate,
      toDate: filters.toDate,
    });
  }, []);

  const clearDateFilters = useCallback(() => {
    setDateFilters({ ...EMPTY_TRANSACTION_DATE_FILTERS });
  }, []);

  const clearSearchQuery = useCallback(() => {
    setSearchQuery('');
  }, []);

  const openAccountPicker = useCallback(() => {
    if (activeAccounts.length > 0) {
      setIsTransactionAccountPickerVisible(true);
    }
  }, [activeAccounts.length]);

  const closeAccountPicker = useCallback(() => {
    setIsTransactionAccountPickerVisible(false);
  }, []);

  const selectAccount = useCallback(
    (accountId: number) => {
      setSelectedAccountId(accountId);
      setIsTransactionAccountPickerVisible(false);
    },
    [setSelectedAccountId],
  );

  const redirectToLogin = useCallback(async () => {
    await clearSession();
    router.replace(ROUTES.AUTH_LOGIN);
  }, [clearSession, router]);

  const loadAccountContext = useCallback(async () => {
    if (!token || accounts.length > 0) {
      return;
    }

    setIsAccountContextLoading(true);
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

      setAccounts(nextAccounts);
      setCurrencies(
        nextCurrencies.length > 0 ? nextCurrencies : fallbackCurrencies,
      );
    } catch (requestError) {
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
      setIsAccountContextLoading(false);
    }
  }, [
    accounts.length,
    redirectToLogin,
    setAccounts,
    setCurrencies,
    setError,
    setIsAccountContextLoading,
    token,
  ]);

  const refreshTransactions = useCallback(async () => {
    if (!token || !selectedAccount?.id) {
      transactionRequestIdRef.current += 1;
      setTransactions([]);
      setHasLoadedTransactions(false);
      return;
    }

    const requestId = transactionRequestIdRef.current + 1;
    transactionRequestIdRef.current = requestId;
    setIsLoading(true);
    setError(null);

    try {
      const shouldLoadCategories = categories.length === 0;
      const [nextTransactions, nextCategories] = await Promise.all([
        listAccountTransactions(token, selectedAccount.id, {
          fromDate: dateFilters.fromDate,
          search: debouncedSearchQuery,
          toDate: dateFilters.toDate,
        }),
        shouldLoadCategories ? listCategories(token) : Promise.resolve(null),
      ]);

      if (transactionRequestIdRef.current !== requestId) {
        return;
      }

      setTransactions(nextTransactions);
      if (nextCategories) {
        setCategories(nextCategories);
      }
      setHasLoadedTransactions(true);
    } catch (requestError) {
      if (transactionRequestIdRef.current !== requestId) {
        return;
      }

      if (requestError instanceof ApiError && requestError.status === 401) {
        await redirectToLogin();
        return;
      }

      setError(
        requestError instanceof Error
          ? requestError.message
          : 'Could not load transactions.',
      );
    } finally {
      if (transactionRequestIdRef.current === requestId) {
        setIsLoading(false);
      }
    }
  }, [
    categories.length,
    dateFilters.fromDate,
    dateFilters.toDate,
    debouncedSearchQuery,
    redirectToLogin,
    selectedAccount?.id,
    setCategories,
    setError,
    setIsLoading,
    setTransactions,
    token,
  ]);

  useEffect(() => {
    void loadAccountContext();
  }, [loadAccountContext]);

  useEffect(() => {
    setHasLoadedTransactions(false);
  }, [selectedAccount?.id]);

  useEffect(() => {
    const timeout = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery.trim());
    }, 300);

    return () => clearTimeout(timeout);
  }, [searchQuery]);

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
    void refreshTransactions();
  }, [refreshTransactions]);

  const refresh = useCallback(() => {
    void loadAccountContext();
    void refreshTransactions();
  }, [loadAccountContext, refreshTransactions]);

  return {
    accountBalanceLabel,
    accountCurrencyCode: displayCurrency.code,
    activeAccounts,
    currencies,
    dateFilters,
    error,
    hasActiveDateFilter,
    hasActiveFilters,
    hasActiveSearch,
    hasAccount: Boolean(selectedAccount),
    hasLoadedTransactions,
    hasTransactions: transactionItems.length > 0,
    isAccountPickerVisible: isTransactionAccountPickerVisible,
    isLoading: isAccountContextLoading || isLoading,
    onApplyDateFilters: applyDateFilters,
    onChangeAccountPress: openAccountPicker,
    onCloseAccountPicker: closeAccountPicker,
    onClearDateFilters: clearDateFilters,
    onClearSearch: clearSearchQuery,
    onRefresh: refresh,
    onSearchQueryChange: updateSearchQuery,
    onSelectAccount: selectAccount,
    searchQuery,
    selectedAccount,
    summaryMetrics,
    transactions: transactionItems,
  };
};
