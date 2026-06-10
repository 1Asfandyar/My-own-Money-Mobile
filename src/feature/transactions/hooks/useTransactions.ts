import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { ROUTES } from '@/config/routes';
import { listAccounts } from '@/feature/accounts/api/accounts.api';
import { useAccountsOverviewStore } from '@/feature/accounts/store/accountsOverview.store';
import { listCategories } from '@/feature/categories/api/categories.api';
import type { Category } from '@/feature/categories/types/category.types';
import {
  CATEGORY_COLOR_FALLBACK,
  CATEGORY_ICON_FALLBACK,
  CATEGORY_SUMMARY_ICONS,
  CATEGORY_TYPE_LABELS,
} from '@/feature/categories/constants/categoryDashboard.constants';
import { EMPTY_TRANSACTION_FILTERS } from '@/feature/transactions/constants/transactionDateFilter.constants';
import { listAccountTransactions } from '@/feature/transactions/api/transactions.api';
import { useTransactionsStore } from '@/feature/transactions/store/transactions.store';
import type {
  Transaction,
  TransactionListItem,
  TransactionsSummaryMetric,
  TransactionsViewModel,
} from '@/feature/transactions/types/transaction.types';
import type {
  TransactionFilters,
} from '@/feature/transactions/types/transactionDateFilter.types';
import {
  getSignedTransactionAmountCents,
  getTransactionAmountCents,
} from '@/feature/transactions/utils/transactionAmount.utils';
import {
  getSharedTransactionDetailRouteParams,
  getTransactionEditRouteParams,
  isSharedTransaction,
} from '@/feature/transactions/utils/transactionRouteParams.utils';
import { ApiError } from '@/services/api';
import { useAuthStore } from '@/store/auth.store';
import type { Currency } from '@/types/currency.types';
import {
  fallbackCurrencies,
  formatCents,
  getCurrencyById,
} from '@/utils/currency';
import { listCurrencies } from '@/feature/currencies/api/currencies.api';

const getSoftColor = (color: string) =>
  /^#[0-9a-f]{6}$/i.test(color) ? `${color}1A` : '#F3F4F6';

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
): keyof typeof Ionicons.glyphMap => {
  const category = transaction.display?.category ?? transaction.category;

  if (category?.icon && category.icon in Ionicons.glyphMap) {
    return category.icon as keyof typeof Ionicons.glyphMap;
  }

  return CATEGORY_ICON_FALLBACK[transaction.transaction_type];
};

const getTransactionListItem = (
  transaction: Transaction,
  displayCurrency: Currency,
  currencies: Currency[],
  userId?: number,
): TransactionListItem => {
  const display = transaction.display;
  const category = display?.category ?? transaction.category;
  const { transaction_type, visibility_type } = transaction;
  const currencyId = transaction.currency_id ?? displayCurrency.id;
  const dateLabel = formatTransactionDate(transaction.transaction_date);
  const typeLabel = CATEGORY_TYPE_LABELS[transaction_type];

  // Personal transfer
  if (visibility_type === 'personal' && transaction_type === 'transfer') {
    const color = CATEGORY_COLOR_FALLBACK.transfer;
    const from = display?.account?.name ?? 'Unknown';
    const to = display?.transfer_to_account?.name ?? 'Unknown';
    return {
      amountLabel: formatCents(Math.abs(transaction.amount_cents), currencyId, currencies),
      categoryLabel: typeLabel,
      color,
      dateLabel,
      iconName: CATEGORY_ICON_FALLBACK.transfer,
      id: transaction.id,
      note: transaction.note?.trim() || undefined,
      softColor: getSoftColor(color),
      sourceTransaction: transaction,
      subtitleLabel: `${from} → ${to}`,
      title: transaction.title || typeLabel,
      typeLabel,
    };
  }

  // Shared settlement
  if (visibility_type === 'shared' && transaction_type === 'settlement') {
    const color = CATEGORY_COLOR_FALLBACK.settlement;
    const payer = display?.payer?.full_name ?? 'Unknown';
    const settlesUser = display?.settles_user?.full_name ?? 'Unknown';
    return {
      amountLabel: formatCents(Math.abs(transaction.amount_cents), currencyId, currencies),
      categoryLabel: typeLabel,
      color,
      dateLabel,
      iconName: CATEGORY_ICON_FALLBACK.settlement,
      id: transaction.id,
      note: transaction.note?.trim() || undefined,
      softColor: getSoftColor(color),
      sourceTransaction: transaction,
      subtitleLabel: `${payer} paid ${settlesUser}`,
      title: transaction.title || typeLabel,
      typeLabel,
    };
  }

  // Shared expense
  if (visibility_type === 'shared' && transaction_type === 'expense') {
    const color = category?.color ?? CATEGORY_COLOR_FALLBACK.expense;
    const payer = display?.payer?.full_name ?? 'Unknown';
    const userSplit = display?.splits?.find((s) => s.user_id === userId);
    const splitAmountCents = userSplit?.owed_amount_cents ?? transaction.amount_cents;
    const totalLabel = formatCents(Math.abs(transaction.amount_cents), currencyId, currencies);
    return {
      amountLabel: formatSignedCents(-Math.abs(splitAmountCents), currencyId, currencies),
      categoryLabel: category?.name ?? typeLabel,
      color,
      dateLabel,
      iconName: getTransactionIcon(transaction),
      id: transaction.id,
      note: transaction.note?.trim() || undefined,
      softColor: getSoftColor(color),
      sourceTransaction: transaction,
      subtitleLabel: `${payer} paid ${totalLabel}`,
      title: transaction.title || (category?.name ?? typeLabel),
      typeLabel,
    };
  }

  // Personal income / expense
  const color = category?.color ?? CATEGORY_COLOR_FALLBACK[transaction_type];
  const categoryLabel = category?.name ?? `Category #${transaction.category_id}`;

  return {
    amountLabel: formatSignedCents(
      getSignedTransactionAmountCents(transaction),
      currencyId,
      currencies,
    ),
    categoryLabel,
    color,
    dateLabel,
    iconName: getTransactionIcon(transaction),
    id: transaction.id,
    note: transaction.note?.trim() || undefined,
    softColor: getSoftColor(color),
    sourceTransaction: transaction,
    subtitleLabel: `${categoryLabel} - ${dateLabel}`,
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
        return { ...nextTotals, income: nextTotals.income + amount };
      }

      return { ...nextTotals, expense: nextTotals.expense + amount };
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
  const [filters, setFilters] = useState<TransactionFilters>(EMPTY_TRANSACTION_FILTERS);
  const [categories, setCategories] = useState<Category[]>([]);
  const [hasLoadedTransactions, setHasLoadedTransactions] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('');
  const token = useAuthStore((state) => state.token);
  const user = useAuthStore((state) => state.user);
  const clearSession = useAuthStore((state) => state.clearSession);
  const accounts = useAccountsOverviewStore((state) => state.accounts);
  const currencies = useAccountsOverviewStore((state) => state.currencies);
  const setAccounts = useAccountsOverviewStore((state) => state.setAccounts);
  const setCurrencies = useAccountsOverviewStore((state) => state.setCurrencies);
  const error = useTransactionsStore((state) => state.error);
  const isAccountContextLoading = useTransactionsStore(
    (state) => state.isAccountContextLoading,
  );
  const isLoading = useTransactionsStore((state) => state.isLoading);
  const setError = useTransactionsStore((state) => state.setError);
  const setIsAccountContextLoading = useTransactionsStore(
    (state) => state.setIsAccountContextLoading,
  );
  const setIsLoading = useTransactionsStore((state) => state.setIsLoading);
  const setTransactions = useTransactionsStore(
    (state) => state.setTransactions,
  );
  const setSelectedTransaction = useTransactionsStore(
    (state) => state.setSelectedTransaction,
  );
  const transactions = useTransactionsStore((state) => state.transactions);

  const activeAccounts = useMemo(
    () => accounts.filter((account) => !account.is_archived),
    [accounts],
  );

  const filteredAccount = useMemo(
    () => activeAccounts.find((account) => account.id === filters.accountId),
    [activeAccounts, filters.accountId],
  );

  const displayCurrency = getCurrencyById(
    filteredAccount?.currency_id ?? user?.currency_id,
    currencies,
  );

  const transactionItems = useMemo(
    () =>
      transactions.map((transaction) =>
        getTransactionListItem(
          transaction,
          displayCurrency,
          currencies,
          user?.id,
        ),
      ),
    [currencies, displayCurrency, transactions, user?.id],
  );

  const summaryMetrics = useMemo(
    () => getSummaryMetrics(transactions, displayCurrency, currencies),
    [currencies, displayCurrency, transactions],
  );

  const hasActiveSearch = searchQuery.trim().length > 0;
  const hasActiveDateFilter = Boolean(
    filters.fromDate || filters.toDate || filters.accountId || filters.categoryId,
  );
  const hasActiveFilters = hasActiveSearch || hasActiveDateFilter;

  const applyFilters = useCallback((nextFilters: TransactionFilters) => {
    setFilters(nextFilters);
  }, []);

  const clearFilters = useCallback(() => {
    setFilters({ ...EMPTY_TRANSACTION_FILTERS });
  }, []);

  const updateSearchQuery = useCallback((query: string) => {
    setSearchQuery(query);
  }, []);

  const clearSearchQuery = useCallback(() => {
    setSearchQuery('');
  }, []);

  const selectTransaction = useCallback(
    (transaction: Transaction) => {
      setSelectedTransaction(transaction);

      if (isSharedTransaction(transaction)) {
        router.push({
          pathname: ROUTES.SHARED_TRANSACTION_DETAIL,
          params: getSharedTransactionDetailRouteParams(transaction),
        });
        return;
      }

      router.push({
        pathname: ROUTES.ADD_PERSONAL_RECORD,
        params: getTransactionEditRouteParams(transaction),
      });
    },
    [router, setSelectedTransaction],
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
      const [nextAccounts, nextCurrencies, nextCategories] = await Promise.all([
        listAccounts(token),
        listCurrencies(token).catch((err: unknown) => {
          if (err instanceof ApiError && err.status === 401) throw err;
          return fallbackCurrencies;
        }),
        listCategories(token).catch(() => [] as Category[]),
      ]);

      setAccounts(nextAccounts);
      setCurrencies(
        nextCurrencies.length > 0 ? nextCurrencies : fallbackCurrencies,
      );
      setCategories(nextCategories);
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
    if (!token) {
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
      const nextTransactions = await listAccountTransactions(token, {
        accountId: filters.accountId,
        categoryId: filters.categoryId,
        fromDate: filters.fromDate,
        search: debouncedSearchQuery,
        toDate: filters.toDate,
      });

      if (transactionRequestIdRef.current !== requestId) return;

      setTransactions(nextTransactions);
      setHasLoadedTransactions(true);
    } catch (requestError) {
      if (transactionRequestIdRef.current !== requestId) return;

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
    debouncedSearchQuery,
    filters.accountId,
    filters.categoryId,
    filters.fromDate,
    filters.toDate,
    redirectToLogin,
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
  }, [filters.accountId]);

  useEffect(() => {
    const timeout = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery.trim());
    }, 300);

    return () => clearTimeout(timeout);
  }, [searchQuery]);

  useEffect(() => {
    void refreshTransactions();
  }, [refreshTransactions]);

  const refresh = useCallback(() => {
    void loadAccountContext();
    void refreshTransactions();
  }, [loadAccountContext, refreshTransactions]);

  return {
    activeAccounts,
    categories,
    currencies,
    error,
    filters,
    hasActiveDateFilter,
    hasActiveFilters,
    hasActiveSearch,
    hasAccount: activeAccounts.length > 0,
    hasLoadedTransactions,
    hasTransactions: transactionItems.length > 0,
    isLoading: isAccountContextLoading || isLoading,
    onApplyFilters: applyFilters,
    onClearFilters: clearFilters,
    onClearSearch: clearSearchQuery,
    onRefresh: refresh,
    onSearchQueryChange: updateSearchQuery,
    onSelectTransaction: selectTransaction,
    searchQuery,
    summaryMetrics,
    transactions: transactionItems,
  };
};
