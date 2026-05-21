import type { TransactionType } from '@/feature/transactions/types/transaction.types';

type TransactionAmountLike = {
  amount_cents?: number | null;
  split_amount_cents?: number | null;
  transaction_type: TransactionType;
};

export const getTransactionAmountCents = (
  transaction: TransactionAmountLike,
) => {
  const amount =
    transaction.amount_cents ?? transaction.split_amount_cents ?? 0;

  return Number.isFinite(amount) ? amount : 0;
};

export const getSignedTransactionAmountCents = (
  transaction: TransactionAmountLike,
) => {
  const amount = Math.abs(getTransactionAmountCents(transaction));

  return transaction.transaction_type === 'income' ? amount : -amount;
};
