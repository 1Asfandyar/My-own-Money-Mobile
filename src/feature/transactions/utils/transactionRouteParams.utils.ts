import type { Transaction } from '@/feature/transactions/types/transaction.types';

const toRouteParam = (value: number | string | null | undefined) =>
  value === null || value === undefined ? '' : String(value);

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
