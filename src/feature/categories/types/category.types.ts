import type { TransactionType } from '@/feature/transactions/types/transaction.types';

export type ManageableCategoryType = Extract<
  TransactionType,
  'expense' | 'income'
>;

export type Category = {
  balance_cents: number;
  id: number;
  name: string;
  icon: string | null;
  color: string | null;
  category_type: ManageableCategoryType;
  user_id: number;
  created_at: string;
  updated_at: string;
};

export type CreateCategoryPayload = {
  category_type: ManageableCategoryType;
  color: string;
  icon: string;
  name: string;
};
