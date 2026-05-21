import type { Account } from '@/types/account.types';
import type { Currency } from '@/types/currency.types';
import type { Ionicons } from '@expo/vector-icons';
import type {
  Transaction,
  TransactionType,
} from '@/feature/transactions/types/transaction.types';

export type TransactionCategorySummary = {
  id: number;
  name: string;
  category_type: TransactionType;
  icon?: string | null;
  color?: string | null;
};

export type TransactionCategoryBreakdown = {
  category: TransactionCategorySummary;
  amount_cents: number;
  percentage: number;
  transactions: Transaction[];
};

export type TransactionsByCategoryDashboard = {
  total_amount_cents: number;
  total_absolute_amount_cents: number;
  categories: TransactionCategoryBreakdown[];
};

export type PersonalCategoryDashboardProps = {
  categories: TransactionCategoryBreakdown[];
  currencies: Currency[];
  displayCurrency: Currency;
  error: string | null;
  isLoading: boolean;
  onRetry: () => void;
  onSelectCategory: (categoryId: number) => void;
  selectedAccount?: Account;
  totalExpenseCents: number;
  totalIncomeCents: number;
};

export type UsePersonalCategoryDashboardParams = Pick<
  PersonalCategoryDashboardProps,
  | 'categories'
  | 'currencies'
  | 'displayCurrency'
  | 'totalExpenseCents'
  | 'totalIncomeCents'
>;

export type CategoryTransactionsModalProps = {
  categoryBreakdown?: TransactionCategoryBreakdown;
  currencies: Currency[];
  displayCurrency: Currency;
  isVisible: boolean;
  onClose: () => void;
};

export type CategoryTransactionRowProps = {
  categoryName: string;
  currencies: Currency[];
  displayCurrencyId: number;
  transaction: Transaction;
};

export type CategoryDashboardErrorStateProps = {
  error: string;
  onRetry: () => void;
};

export type CategoryDashboardMetric = {
  amountLabel: string;
  color: string;
  iconName: keyof typeof Ionicons.glyphMap;
  label: string;
  softColor: string;
  tone: TransactionType;
};

export type CategoryDashboardItem = {
  accessibilityLabel: string;
  activeSegmentCount: number;
  amountLabel: string;
  color: string;
  iconName: keyof typeof Ionicons.glyphMap;
  id: number;
  name: string;
  percentageLabel: string;
  softColor: string;
  typeColor: string;
  typeLabel: string;
};

export type CategoryDashboardSummaryProps = {
  metrics: CategoryDashboardMetric[];
};

export type CategorySummaryMetricProps = {
  metric: CategoryDashboardMetric;
};

export type CategoryBreakdownListProps = {
  items: CategoryDashboardItem[];
  onSelectCategory: (categoryId: number) => void;
};

export type CategoryBreakdownRowProps = {
  item: CategoryDashboardItem;
  onPress: (categoryId: number) => void;
};

export type CategoryProgressIconProps = {
  activeSegmentCount: number;
  color: string;
  iconName: keyof typeof Ionicons.glyphMap;
  softColor: string;
};
