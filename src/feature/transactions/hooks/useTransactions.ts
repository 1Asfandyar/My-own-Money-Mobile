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
  ApiTransaction,
  TransactionListItem,
  TransactionRenderAs,
  TransactionsSummaryMetric,
  TransactionsViewModel,
} from '@/feature/transactions/types/transaction.types';
import type {
  TransactionFilters,
} from '@/feature/transactions/types/transactionDateFilter.types';
import { ApiError } from '@/services/api';
import { useAuthStore } from '@/store/auth.store';
import type { Currency } from '@/types/currency.types';
import {
  fallbackCurrencies,
  formatCents,
  getCurrencyByCode,
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

const RENDER_AS_COLORS: Record<TransactionRenderAs, string> = {
  personal_expense: CATEGORY_COLOR_FALLBACK.expense,
  personal_income: CATEGORY_COLOR_FALLBACK.income,
  transfer: CATEGORY_COLOR_FALLBACK.transfer,
  shared_expense_payer: CATEGORY_COLOR_FALLBACK.income,
  shared_expense_participant: CATEGORY_COLOR_FALLBACK.expense,
  settlement_settler: CATEGORY_COLOR_FALLBACK.settlement,
  settlement_settlee: CATEGORY_COLOR_FALLBACK.settlement,
};

const RENDER_AS_ICONS: Record<TransactionRenderAs, keyof typeof Ionicons.glyphMap> = {
  personal_expense: CATEGORY_ICON_FALLBACK.expense,
  personal_income: CATEGORY_ICON_FALLBACK.income,
  transfer: CATEGORY_ICON_FALLBACK.transfer,
  shared_expense_payer: CATEGORY_ICON_FALLBACK.expense,
  shared_expense_participant: CATEGORY_ICON_FALLBACK.expense,
  settlement_settler: CATEGORY_ICON_FALLBACK.settlement,
  settlement_settlee: CATEGORY_ICON_FALLBACK.settlement,
};

const getTransactionListItem = (
  transaction: ApiTransaction,
  currencies: Currency[],
): TransactionListItem => {
  const currency = getCurrencyByCode(transaction.currency.code, currencies);
  const color = RENDER_AS_COLORS[transaction.render_as];
  const iconName = RENDER_AS_ICONS[transaction.render_as];
  const dateLabel = formatTransactionDate(transaction.date);

  const summaryAmountLabel = `${transaction.currency.symbol} ${(
    transaction.summary.amount_cents / 100
  ).toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;

  const totalAmountLabel = formatCents(
    transaction.amount_cents,
    currency.id,
    currencies,
  );
  const secondaryLine = `${transaction.summary.paid_by_label} paid ${totalAmountLabel}`;

  return {
    color,
    dateLabel,
    iconName,
    id: transaction.id,
    note: transaction.note?.trim() || undefined,
    secondaryLine,
    softColor: getSoftColor(color),
    sourceTransaction: transaction,
    summaryAmountLabel,
    summaryLabel: transaction.summary.label,
    title: transaction.title,
  };
};

const getSummaryMetric = (
  type: ApiTransaction['type'],
  amountCents: number,
  currencies: Currency[],
  currencyCode: string,
): TransactionsSummaryMetric => {
  const color = CATEGORY_COLOR_FALLBACK[type];
  const currency = getCurrencyByCode(currencyCode, currencies);
  const signedAmount = type === 'income' ? amountCents : -amountCents;
  const sign = signedAmount >= 0 ? '+' : '-';
  const formatted = formatCents(Math.abs(signedAmount), currency.id, currencies);

  return {
    amountLabel: `${sign}${formatted}`,
    color,
    iconName: CATEGORY_SUMMARY_ICONS[type],
    label: CATEGORY_TYPE_LABELS[type],
    softColor: getSoftColor(color),
    type,
  };
};

const getSummaryMetrics = (
  transactions: ApiTransaction[],
  currencies: Currency[],
  currencyCode: string,
): TransactionsSummaryMetric[] => {
  const totals = transactions.reduce(
    (acc, t) => {
      if (t.type === 'income') return { ...acc, income: acc.income + t.amount_cents };
      return { ...acc, expense: acc.expense + t.amount_cents };
    },
    { expense: 0, income: 0 },
  );

  return [
    getSummaryMetric('income', totals.income, currencies, currencyCode),
    getSummaryMetric('expense', totals.expense, currencies, currencyCode),
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
  const [apiTransactions, setApiTransactions] = useState<ApiTransaction[]>([]);
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

  const activeAccounts = useMemo(
    () => accounts.filter((account) => !account.is_archived),
    [accounts],
  );

  const filteredAccount = useMemo(
    () => activeAccounts.find((account) => account.id === filters.accountId),
    [activeAccounts, filters.accountId],
  );

  const displayCurrencyCode: string =
    (filteredAccount
      ? currencies.find((c) => c.id === filteredAccount.currency_id)?.code
      : currencies.find((c) => c.id === user?.currency_id)?.code)
    ?? 'PKR';

  const transactionItems = useMemo(
    () => apiTransactions.map((t) => getTransactionListItem(t, currencies)),
    [apiTransactions, currencies],
  );

  const summaryMetrics = useMemo(
    () => getSummaryMetrics(apiTransactions, currencies, displayCurrencyCode),
    [apiTransactions, currencies, displayCurrencyCode],
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
    (transaction: ApiTransaction) => {
      router.push({
        pathname: ROUTES.TRANSACTION_DETAIL,
        params: { transactionId: String(transaction.id) },
      });
    },
    [router],
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
      setApiTransactions([]);
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

      setApiTransactions(nextTransactions);
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
