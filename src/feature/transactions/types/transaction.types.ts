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
  category?: Category | null;
  id: number;
  note?: string | null;
  split_amount_cents?: number | null;
  transfer_account_id?: number | null;
  user_id?: number;
  visibility_type?: TransactionFilterType | string | null;
  created_at?: string;
  updated_at?: string;
};

export type ListAccountTransactionsParams = Partial<TransactionDateFilters> & {
  search?: string;
  type?: TransactionFilterType;
};

export type TransactionsStoreState = {
  error: string | null;
  isAccountContextLoading: boolean;
  isLoading: boolean;
  selectedTransaction: Transaction | null;
  transactions: Transaction[];
};

export type TransactionsStoreActions = {
  resetTransactions: () => void;
  setError: (error: string | null) => void;
  setIsAccountContextLoading: (isLoading: boolean) => void;
  setIsLoading: (isLoading: boolean) => void;
  setSelectedTransaction: (transaction: Transaction | null) => void;
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
  sourceTransaction: Transaction;
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
  onSelectTransaction: (transaction: Transaction) => void;
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
  onSelectTransaction?: (transaction: Transaction) => void;
  transactions: TransactionListItem[];
};

export type TransactionRowProps = {
  onPress?: (transaction: Transaction) => void;
  transaction: TransactionListItem;
};

export type SharedTransactionParticipant = {
  amountCents: number;
  id: number;
  isCurrentUser: boolean;
  isPayer: boolean;
  label: string;
  user: import('@/feature/groups/types/group.types').GroupUser;
};

export type SharedTransactionDetailViewModel = {
  amountLabel: string;
  categoryColor: string;
  categoryIconName: keyof typeof Ionicons.glyphMap;
  categorySoftColor: string;
  createdByLabel: string;
  dateLabel: string;
  error: string | null;
  isDeleting: boolean;
  isLoading: boolean;
  note?: string;
  onBack: () => void;
  onDelete: () => void;
  onEdit: () => void;
  onRetry: () => void;
  paidByLabel: string;
  paidByUser?: import('@/feature/groups/types/group.types').GroupUser;
  participantRows: SharedTransactionParticipant[];
  title: string;
};

export type SharedTransactionDetailViewProps = {
  detail: SharedTransactionDetailViewModel;
};
