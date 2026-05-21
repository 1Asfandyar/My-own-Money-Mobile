import type { Account } from '@/types/account.types';
import type { Currency } from '@/types/currency.types';
import type { SharedExpenseFriendTransactions } from '@/feature/transactions/types/sharedExpense.types';

export type SharedExpenseDashboardProps = {
  currencies: Currency[];
  displayCurrency: Currency;
  error: string | null;
  friends: SharedExpenseFriendTransactions[];
  isLoading: boolean;
  onRetry: () => void;
  selectedAccount?: Account;
};

export type UseSharedExpenseDashboardParams = {
  currencies: Currency[];
  displayCurrency: Currency;
  friends: SharedExpenseFriendTransactions[];
};

export type SharedExpenseDashboardTransactionItem = {
  amountLabel: string;
  dateLabel: string;
  id: number;
  note?: string;
  title: string;
};

export type SharedExpenseDashboardFriendItem = {
  amountLabel: string;
  email?: string;
  hiddenTransactionCount: number;
  id: number;
  initial: string;
  name: string;
  totalAmountCents: number;
  transactionCountLabel: string;
  transactions: SharedExpenseDashboardTransactionItem[];
};

export type SharedTransactionRowProps = {
  transaction: SharedExpenseDashboardTransactionItem;
};

export type SharedExpenseFriendCardProps = {
  item: SharedExpenseDashboardFriendItem;
};

export type SharedExpenseDashboardSummary = {
  amountLabel: string;
  friendCountLabel: string;
  splitCountLabel: string;
};

export type SharedExpenseDashboardViewModel = {
  hasFriends: boolean;
  items: SharedExpenseDashboardFriendItem[];
  summary: SharedExpenseDashboardSummary;
};

export type SharedExpenseDashboardErrorStateProps = {
  error: string;
  onRetry: () => void;
};
