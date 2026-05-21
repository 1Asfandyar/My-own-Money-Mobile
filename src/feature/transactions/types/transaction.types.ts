import type { Ionicons } from '@expo/vector-icons';
import type { ReactElement } from 'react';
import type { StyleProp, ViewStyle } from 'react-native';

import type { Category } from '@/feature/categories/types/category.types';
import type {
  SharedExpenseSplitMethod,
  SharedExpenseUserSharePayload,
} from '@/feature/transactions/types/sharedExpenseSplit.types';
import type { TransactionDateFilters } from '@/feature/transactions/types/transactionDateFilter.types';
import type { Account } from '@/types/account.types';
import type { Currency } from '@/types/currency.types';

export type TransactionType = 'expense' | 'income';
export type TransactionFilterType = 'personal' | 'shared' | 'none';

export type TransactionPayload = {
  title: string;
  transaction_type: TransactionType;
  amount_cents: number;
  account_id: number;
  category_id: number;
  transaction_date: string;
  note: string;
  currency_id: number;
  paid_by?: number;
  shared_by?: number[];
  split_method?: SharedExpenseSplitMethod;
  user_shares?: SharedExpenseUserSharePayload[];
};

export type Transaction = Omit<TransactionPayload, 'note'> & {
  id: number;
  note?: string | null;
  split_amount_cents?: number | null;
  transfer_account_id?: number | null;
  user_id?: number;
  visibility_type?: TransactionFilterType | string | null;
  created_at?: string;
  updated_at?: string;
};

export type ListAccountTransactionsParams = TransactionDateFilters & {
  search?: string;
  type?: TransactionFilterType;
};

export type TransactionsStoreState = {
  categories: Category[];
  error: string | null;
  isAccountContextLoading: boolean;
  isLoading: boolean;
  transactions: Transaction[];
};

export type TransactionsStoreActions = {
  resetTransactions: () => void;
  setCategories: (categories: Category[]) => void;
  setError: (error: string | null) => void;
  setIsAccountContextLoading: (isLoading: boolean) => void;
  setIsLoading: (isLoading: boolean) => void;
  setTransactions: (transactions: Transaction[]) => void;
};

export type TransactionsStore = TransactionsStoreState &
  TransactionsStoreActions;

export type TransactionListItem = {
  amountLabel: string;
  categoryLabel: string;
  color: string;
  dateLabel: string;
  iconName: keyof typeof Ionicons.glyphMap;
  id: number;
  note?: string;
  softColor: string;
  title: string;
  typeLabel: string;
};

export type TransactionsSummaryMetric = {
  amountLabel: string;
  color: string;
  iconName: keyof typeof Ionicons.glyphMap;
  label: string;
  softColor: string;
  type: TransactionType;
};

export type TransactionsViewModel = {
  accountBalanceLabel: string;
  accountCurrencyCode: string;
  activeAccounts: Account[];
  currencies: Currency[];
  dateFilters: TransactionDateFilters;
  error: string | null;
  hasActiveDateFilter: boolean;
  hasActiveFilters: boolean;
  hasActiveSearch: boolean;
  hasAccount: boolean;
  hasLoadedTransactions: boolean;
  hasTransactions: boolean;
  isLoading: boolean;
  isAccountPickerVisible: boolean;
  onApplyDateFilters: (filters: TransactionDateFilters) => void;
  onChangeAccountPress: () => void;
  onCloseAccountPicker: () => void;
  onClearSearch: () => void;
  onClearDateFilters: () => void;
  onRefresh: () => void;
  onSearchQueryChange: (query: string) => void;
  onSelectAccount: (accountId: number) => void;
  searchQuery: string;
  selectedAccount?: Account;
  summaryMetrics: TransactionsSummaryMetric[];
  transactions: TransactionListItem[];
};

export type TransactionsViewProps = {
  transactions: TransactionsViewModel;
};

export type TransactionsAccountCardProps = {
  accountBalanceLabel: string;
  accountCurrencyCode: string;
  onChangeAccountPress: () => void;
  selectedAccount?: Account;
};

export type TransactionsStatusProps = {
  error: string | null;
  hasAccount: boolean;
  isLoading: boolean;
  onRetry: () => void;
};

export type TransactionsSummaryProps = {
  metrics: TransactionsSummaryMetric[];
};

export type TransactionsSummaryMetricProps = {
  metric: TransactionsSummaryMetric;
};

export type TransactionListProps = {
  contentContainerStyle?: StyleProp<ViewStyle>;
  isRefreshing?: boolean;
  ListEmptyComponent?: ReactElement | null;
  ListHeaderComponent?: ReactElement | null;
  onRefresh?: () => void;
  transactions: TransactionListItem[];
};

export type TransactionRowProps = {
  transaction: TransactionListItem;
};
