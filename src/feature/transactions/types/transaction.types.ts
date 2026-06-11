import type { Ionicons } from '@expo/vector-icons';
import type { ReactElement } from 'react';
import type { StyleProp, ViewStyle } from 'react-native';

import type { Category } from '@/feature/categories/types/category.types';
import type {
  SharedExpenseSplitMethod,
  SharedExpenseUserSharePayload,
} from '@/feature/transactions/types/sharedExpenseSplit.types';
import type { TransactionFilters } from '@/feature/transactions/types/transactionDateFilter.types';
import type { Account } from '@/types/account.types';
import type { Currency } from '@/types/currency.types';

export type TransactionType = 'expense' | 'income' | 'transfer' | 'settlement';
export type TransactionFilterType = 'personal' | 'shared' | 'none';
export type TransactionVisibilityType = 'personal' | 'shared';

// ── New unified API response types ──────────────────────────────────────────

export type TransactionRenderAs =
  | 'personal_expense'
  | 'personal_income'
  | 'transfer'
  | 'shared_expense_payer'
  | 'shared_expense_participant'
  | 'settlement_settler'
  | 'settlement_settlee';

export type TransactionViewerRole =
  | 'owner'
  | 'payer'
  | 'participant'
  | 'settler'
  | 'settlee';

export type ApiTransactionSplitMethod = 'equal' | 'percentage' | 'shares' | 'exact';

export type ApiTransactionSplit = {
  user: { id: number; name: string; is_you: boolean };
  owed_amount_cents: number;
  allocation_value: number | null;
  category: { id: number; name: string } | null;
};

export type ApiTransaction = {
  id: number;
  type: TransactionType;
  visibility: TransactionVisibilityType;
  title: string;
  note: string | null;
  date: string;
  currency: { code: string; symbol: string };
  amount_cents: number;
  render_as: TransactionRenderAs;
  viewer_role: TransactionViewerRole;
  summary: {
    label: string;
    amount_cents: number;
    paid_by_label: string;
  };
  paid_by: { id: number; name: string; is_you: boolean };
  account: { id: number; name: string };
  transfer_to_account: { id: number; name: string } | null;
  category: { id: number; name: string } | null;
  counterpart: { id: number; name: string } | null;
  split_method: ApiTransactionSplitMethod | null;
  splits: ApiTransactionSplit[] | null;
};

export type TransactionDisplaySplit = {
  user_id: number;
  full_name: string;
  owed_amount_cents: number;
  split_method: string;
  allocation_value: number | null;
};

export type TransactionDisplay = {
  account: { id: number; name: string } | null;
  category: { id: number; name: string; icon: string | null; color: string | null } | null;
  payer: { id: number; full_name: string } | null;
  settles_user: { id: number; full_name: string } | null;
  transfer_to_account: { id: number; name: string } | null;
  splits: TransactionDisplaySplit[];
};

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
  display?: TransactionDisplay;
  id: number;
  note?: string | null;
  split_amount_cents?: number | null;
  transfer_account_id?: number | null;
  user_id?: number;
  visibility_type?: TransactionVisibilityType | TransactionFilterType | string | null;
  created_at?: string;
  updated_at?: string;
};

export type ListAccountTransactionsParams = {
  accountId?: number | null;
  categoryId?: number | null;
  fromDate?: string;
  search?: string;
  toDate?: string;
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
  color: string;
  dateLabel: string;
  iconName: keyof typeof Ionicons.glyphMap;
  id: number;
  note?: string;
  secondaryLine: string;
  softColor: string;
  sourceTransaction: ApiTransaction;
  summaryAmountLabel: string;
  summaryLabel: string;
  title: string;
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
  activeAccounts: Account[];
  categories: Category[];
  currencies: Currency[];
  error: string | null;
  filters: TransactionFilters;
  hasActiveDateFilter: boolean;
  hasActiveFilters: boolean;
  hasActiveSearch: boolean;
  hasAccount: boolean;
  hasLoadedTransactions: boolean;
  hasTransactions: boolean;
  isLoading: boolean;
  onApplyFilters: (filters: TransactionFilters) => void;
  onClearFilters: () => void;
  onClearSearch: () => void;
  onRefresh: () => void;
  onSearchQueryChange: (query: string) => void;
  onSelectTransaction: (transaction: ApiTransaction) => void;
  searchQuery: string;
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
  onSelectTransaction?: (transaction: ApiTransaction) => void;
  transactions: TransactionListItem[];
};

export type TransactionRowProps = {
  onPress?: (transaction: ApiTransaction) => void;
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

export type TransactionDetailViewModel = {
  canDelete: boolean;
  canEdit: boolean;
  error: string | null;
  isDeleting: boolean;
  isLoading: boolean;
  onBack: () => void;
  onDelete: () => void;
  onEdit: () => void;
  onRetry: () => void;
  transaction: ApiTransaction | null;
};

export type TransactionDetailViewProps = {
  detail: TransactionDetailViewModel;
};
