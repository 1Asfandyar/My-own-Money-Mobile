import { CATEGORY_COLOR_FALLBACK } from '@/feature/categories/constants/categoryDashboard.constants';
import type { Transaction } from '@/feature/transactions/types/transaction.types';
import { themeColors } from '@/theme/utilities';
import type { Currency } from '@/types/currency.types';
import { formatCents } from '@/utils/currency';

export const formatCategoryPercentage = (percentage: number) => {
  if (!Number.isFinite(percentage)) return '0%';

  return `${Math.min(100, Math.max(0, percentage)).toFixed(0)}%`;
};

export const getCategorySoftColor = (color: string) =>
  /^#[0-9a-f]{6}$/i.test(color) ? `${color}1A` : themeColors.gray100;

export const getSignedTransactionAmount = (transaction: Transaction) =>
  transaction.transaction_type === 'expense'
    ? -Math.abs(transaction.amount_cents)
    : Math.abs(transaction.amount_cents);

export const getCategoryTypeColor = (
  transactionType: Transaction['transaction_type'],
) => CATEGORY_COLOR_FALLBACK[transactionType];

export const formatSignedCents = (
  cents: number,
  currencyId: number,
  currencies: Currency[],
) => {
  const sign = cents >= 0 ? '+' : '-';

  return `${sign}${formatCents(Math.abs(cents), currencyId, currencies)}`;
};

export const formatCategoryTransactionDate = (value?: string) => {
  if (!value) return 'No date';

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return 'No date';

  return date.toLocaleDateString(undefined, {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
};
