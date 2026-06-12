import { Ionicons } from '@expo/vector-icons';

import {
  CATEGORY_COLOR_FALLBACK,
  CATEGORY_ICON_FALLBACK,
} from '@/feature/categories/constants/categoryDashboard.constants';
import type {
  ApiTransaction,
  TransactionListItem,
  TransactionRenderAs,
} from '@/feature/transactions/types/transaction.types';
import type { Currency } from '@/types/currency.types';
import { formatCents, getCurrencyByCode } from '@/utils/currency';

export const getSoftColor = (color: string) =>
  /^#[0-9a-f]{6}$/i.test(color) ? `${color}1A` : '#F3F4F6';

export const formatTransactionDate = (value: string) => {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return 'No date';

  return date.toLocaleDateString(undefined, {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
};

export const RENDER_AS_COLORS: Record<TransactionRenderAs, string> = {
  personal_expense: CATEGORY_COLOR_FALLBACK.expense,
  personal_income: CATEGORY_COLOR_FALLBACK.income,
  transfer: CATEGORY_COLOR_FALLBACK.transfer,
  shared_expense_payer: CATEGORY_COLOR_FALLBACK.income,
  shared_expense_participant: CATEGORY_COLOR_FALLBACK.expense,
  settlement_settler: CATEGORY_COLOR_FALLBACK.settlement,
  settlement_settlee: CATEGORY_COLOR_FALLBACK.settlement,
};

export const RENDER_AS_ICONS: Record<TransactionRenderAs, keyof typeof Ionicons.glyphMap> = {
  personal_expense: CATEGORY_ICON_FALLBACK.expense,
  personal_income: CATEGORY_ICON_FALLBACK.income,
  transfer: CATEGORY_ICON_FALLBACK.transfer,
  shared_expense_payer: CATEGORY_ICON_FALLBACK.expense,
  shared_expense_participant: CATEGORY_ICON_FALLBACK.expense,
  settlement_settler: CATEGORY_ICON_FALLBACK.settlement,
  settlement_settlee: CATEGORY_ICON_FALLBACK.settlement,
};

export const getTransactionListItem = (
  transaction: ApiTransaction,
  currencies: Currency[],
): TransactionListItem => {
  const currency = getCurrencyByCode(transaction.currency.code, currencies);
  const color = RENDER_AS_COLORS[transaction.render_as];
  const iconName = RENDER_AS_ICONS[transaction.render_as];
  const dateLabel = formatTransactionDate(transaction.date);

  const summaryAmountLabel = `${transaction.currency.symbol} ${(
    transaction.summary.amount_cents / 100
  ).toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;

  const totalAmountLabel = formatCents(
    transaction.amount_cents,
    currency.id,
    currencies,
  );
  const secondaryLine = `${transaction.summary.paid_by_label} paid ${totalAmountLabel}`;

  return {
    color,
    dateLabel,
    iconName,
    id: transaction.id,
    note: transaction.note?.trim() || undefined,
    secondaryLine,
    softColor: getSoftColor(color),
    sourceTransaction: transaction,
    summaryAmountLabel,
    summaryLabel: transaction.summary.label,
    title: transaction.title,
  };
};
