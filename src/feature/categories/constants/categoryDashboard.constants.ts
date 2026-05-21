import type { Ionicons } from '@expo/vector-icons';

import type { TransactionType } from '@/feature/transactions/types/transaction.types';

export const CATEGORY_ICON_FALLBACK: Record<
  TransactionType,
  keyof typeof Ionicons.glyphMap
> = {
  expense: 'trending-down-outline',
  income: 'trending-up-outline',
};

export const CATEGORY_COLOR_FALLBACK: Record<TransactionType, string> = {
  expense: '#DC2626',
  income: '#16A34A',
};

export const CATEGORY_AMOUNT_TEXT_COLORS: Record<TransactionType, string> = {
  expense: '#B91C1C',
  income: '#15803D',
};

export const CATEGORY_SUMMARY_ICONS: Record<
  TransactionType,
  keyof typeof Ionicons.glyphMap
> = {
  expense: 'arrow-down-outline',
  income: 'arrow-up-outline',
};

export const CATEGORY_TYPE_LABELS: Record<TransactionType, string> = {
  expense: 'Expense',
  income: 'Income',
};

const PROGRESS_SEGMENT_COUNT = 24;
export const PROGRESS_DOT_SIZE = 4;
export const PROGRESS_SIZE = 76;
const PROGRESS_RADIUS = 34;

export const CATEGORY_PROGRESS_SEGMENTS = Array.from(
  { length: PROGRESS_SEGMENT_COUNT },
  (_, index) => {
    const angle = (index / PROGRESS_SEGMENT_COUNT) * Math.PI * 2 - Math.PI / 2;

    return {
      id: index,
      left:
        PROGRESS_SIZE / 2 +
        Math.cos(angle) * PROGRESS_RADIUS -
        PROGRESS_DOT_SIZE / 2,
      top:
        PROGRESS_SIZE / 2 +
        Math.sin(angle) * PROGRESS_RADIUS -
        PROGRESS_DOT_SIZE / 2,
    };
  },
);

export const CATEGORY_PROGRESS_SEGMENT_COUNT =
  CATEGORY_PROGRESS_SEGMENTS.length;

export const CATEGORY_DASHBOARD_VISIBLE_ITEM_COUNT = 4;
export const CATEGORY_DASHBOARD_ROW_HEIGHT = 108;
