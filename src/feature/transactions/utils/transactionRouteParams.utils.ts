import type { SharedExpenseSplitMethod } from '@/feature/transactions/types/sharedExpenseSplit.types';
import type {
  ApiTransaction,
  Transaction,
} from '@/feature/transactions/types/transaction.types';

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

export const getApiPersonalTransactionEditRouteParams = (
  transaction: ApiTransaction,
) => ({
  accountId: String(transaction.account.id),
  amountCents: String(transaction.amount_cents),
  categoryId: String(transaction.category?.id ?? ''),
  note: transaction.note ?? '',
  transactionDate: transaction.date,
  transactionId: String(transaction.id),
  transactionType: transaction.type,
});

export const getApiSharedTransactionEditRouteParams = (
  transaction: ApiTransaction,
) => {
  const splits = transaction.splits ?? [];

  return {
    ...getApiPersonalTransactionEditRouteParams(transaction),
    paidByUserId: String(transaction.paid_by.id),
    sharedUserIds: JSON.stringify(splits.map((split) => split.user.id)),
    splitMethod: transaction.split_method ?? 'equal',
    userShares: JSON.stringify(
      splits.map((split) => ({
        user_id: split.user.id,
        amount_cents: split.owed_amount_cents,
        percentage:
          transaction.split_method === 'percentage'
            ? split.allocation_value
            : null,
        shares:
          transaction.split_method === 'shares' ? split.allocation_value : null,
      })),
    ),
  };
};
