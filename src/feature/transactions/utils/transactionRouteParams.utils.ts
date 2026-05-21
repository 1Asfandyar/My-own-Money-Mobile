import type { SharedExpenseSplitMethod } from '@/feature/transactions/types/sharedExpenseSplit.types';
import type { Transaction } from '@/feature/transactions/types/transaction.types';

const toRouteParam = (value: number | string | null | undefined) =>
  value === null || value === undefined ? '' : String(value);

const sharedSplitMethods: SharedExpenseSplitMethod[] = [
  'equal',
  'exact',
  'percentage',
  'shares',
];

const getSharedParticipantIds = (transaction: Transaction) =>
  Array.from(
    new Set([
      ...(transaction.shared_by ?? []),
      ...(transaction.user_shares ?? []).map((share) => share.user_id),
      transaction.paid_by,
    ].filter((userId): userId is number => Boolean(userId))),
  );

export const isSharedTransaction = (transaction: Transaction) =>
  transaction.visibility_type === 'shared' ||
  Boolean(transaction.paid_by) ||
  Boolean(transaction.shared_by?.length) ||
  Boolean(transaction.user_shares?.length);

export const getTransactionEditRouteParams = (transaction: Transaction) => ({
  accountId: toRouteParam(transaction.account_id),
  amountCents: toRouteParam(Math.abs(transaction.amount_cents)),
  categoryId: toRouteParam(transaction.category_id),
  currencyId: toRouteParam(transaction.currency_id),
  note: transaction.note ?? '',
  transactionDate: transaction.transaction_date,
  transactionId: toRouteParam(transaction.id),
  transactionType: transaction.transaction_type,
});

export const getSharedTransactionDetailRouteParams = (
  transaction: Transaction,
) => ({
  transactionId: toRouteParam(transaction.id),
});

export const getSharedTransactionEditRouteParams = (
  transaction: Transaction,
) => ({
  ...getTransactionEditRouteParams(transaction),
  paidByUserId: toRouteParam(transaction.paid_by),
  sharedUserIds: JSON.stringify(getSharedParticipantIds(transaction)),
  splitMethod: sharedSplitMethods.includes(
    transaction.split_method as SharedExpenseSplitMethod,
  )
    ? transaction.split_method
    : 'equal',
  userShares: JSON.stringify(transaction.user_shares ?? []),
});
