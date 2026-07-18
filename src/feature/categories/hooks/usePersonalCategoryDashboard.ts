import { Ionicons } from '@expo/vector-icons';
import { useMemo } from 'react';

import {
    CATEGORY_AMOUNT_TEXT_COLORS,
    CATEGORY_COLOR_FALLBACK,
    CATEGORY_ICON_FALLBACK,
    CATEGORY_PROGRESS_SEGMENT_COUNT,
    CATEGORY_SUMMARY_ICONS,
    CATEGORY_TYPE_LABELS,
} from '@/feature/categories/constants/categoryDashboard.constants';
import type {
    CategoryDashboardItem,
    CategoryDashboardMetric,
    TransactionCategoryBreakdown,
    UsePersonalCategoryDashboardParams,
} from '@/feature/categories/types/categoryDashboard.types';
import type { TransactionType } from '@/feature/transactions/types/transaction.types';
import { themeColors } from '@/theme/utilities';
import type { Currency } from '@/types/currency.types';
import { formatCents } from '@/utils/currency';

const clampPercentage = (percentage: number) => {
  if (!Number.isFinite(percentage)) return 0;

  return Math.min(100, Math.max(0, percentage));
};

const getActiveSegmentCount = (percentage: number) => {
  const clampedPercentage = clampPercentage(percentage);

  if (clampedPercentage === 0) return 0;

  return Math.max(
    1,
    Math.round((clampedPercentage / 100) * CATEGORY_PROGRESS_SEGMENT_COUNT),
  );
};

// Spelling out what the percentage is a share of (rather than a bare
// number) avoids the ambiguity of pairing an unlabeled number with the
// progress ring next to it.
const formatPercentage = (percentage: number) => {
  const clamped = clampPercentage(percentage);
  const fractionDigits = clamped < 10 && clamped % 1 !== 0 ? 1 : 0;

  return `${clamped.toFixed(fractionDigits)}% of total activity`;
};

const getSoftColor = (color: string) =>
  /^#[0-9a-f]{6}$/i.test(color) ? `${color}1A` : themeColors.gray100;

const getCategoryIcon = (
  item: TransactionCategoryBreakdown,
): keyof typeof Ionicons.glyphMap => {
  const icon = item.category.icon;

  if (icon && icon in Ionicons.glyphMap) {
    return icon as keyof typeof Ionicons.glyphMap;
  }

  return CATEGORY_ICON_FALLBACK[item.category.category_type];
};

const getCategoryColor = (item: TransactionCategoryBreakdown) =>
  item.category.color ?? CATEGORY_COLOR_FALLBACK[item.category.category_type];

const getSignedCategoryAmount = (item: TransactionCategoryBreakdown) =>
  item.category.category_type === 'expense'
    ? -Math.abs(item.amount_cents)
    : Math.abs(item.amount_cents);

const formatSignedCents = (
  cents: number,
  currencyId: number,
  currencies: Currency[],
) => {
  const sign = cents >= 0 ? '+' : '-';

  return `${sign}${formatCents(Math.abs(cents), currencyId, currencies)}`;
};

const getMetric = (
  tone: TransactionType,
  amountCents: number,
  currencyId: number,
  currencies: Currency[],
): CategoryDashboardMetric => {
  const signedAmount =
    tone === 'income' ? Math.abs(amountCents) : -Math.abs(amountCents);
  const color = CATEGORY_COLOR_FALLBACK[tone];

  return {
    amountLabel: formatSignedCents(signedAmount, currencyId, currencies),
    color,
    iconName: CATEGORY_SUMMARY_ICONS[tone],
    label: CATEGORY_TYPE_LABELS[tone],
    softColor: getSoftColor(color),
    tone,
  };
};

const getDashboardItem = (
  item: TransactionCategoryBreakdown,
  currencyId: number,
  currencies: Currency[],
): CategoryDashboardItem => {
  const type = item.category.category_type;
  const color = getCategoryColor(item);

  return {
    accessibilityLabel: `Open ${item.category.name} transactions`,
    activeSegmentCount: getActiveSegmentCount(item.percentage),
    amountLabel: formatSignedCents(
      getSignedCategoryAmount(item),
      currencyId,
      currencies,
    ),
    color,
    iconName: getCategoryIcon(item),
    id: item.category.id,
    name: item.category.name,
    percentageLabel: formatPercentage(item.percentage),
    softColor: getSoftColor(color),
    typeColor: CATEGORY_AMOUNT_TEXT_COLORS[type],
    typeLabel: CATEGORY_TYPE_LABELS[type],
  };
};

export const usePersonalCategoryDashboard = ({
  categories,
  currencies,
  displayCurrency,
  totalExpenseCents,
  totalIncomeCents,
}: UsePersonalCategoryDashboardParams) => {
  const metrics = useMemo(
    () => [
      getMetric('income', totalIncomeCents, displayCurrency.id, currencies),
      getMetric('expense', totalExpenseCents, displayCurrency.id, currencies),
    ],
    [currencies, displayCurrency.id, totalExpenseCents, totalIncomeCents],
  );
  const items = useMemo(
    () =>
      categories.map((category) =>
        getDashboardItem(category, displayCurrency.id, currencies),
      ),
    [categories, currencies, displayCurrency.id],
  );

  return {
    hasCategories: items.length > 0,
    items,
    metrics,
  };
};
