import type { GroupUser } from '@/feature/groups/types/group.types';
import type { Transaction } from '@/feature/transactions/types/transaction.types';

export type SharedExpenseFriend = GroupUser & {
  created_at?: string;
  onboarding_completed?: boolean;
  role?: string;
  updated_at?: string;
};

export type SharedExpenseTransaction = Omit<Transaction, 'amount_cents'> & {
  amount_cents?: number | null;
  split_amount_cents?: number | null;
  transfer_account_id?: number | null;
};

export type SharedExpenseFriendTransactions = {
  friend: SharedExpenseFriend;
  transactions: SharedExpenseTransaction[];
};

export type SharedExpensesDashboard = {
  friends: SharedExpenseFriendTransactions[];
};

export type SharedExpensesResponse = {
  friends?: SharedExpenseFriendTransactions[];
  success: true;
};
