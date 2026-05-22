import type {
  BalanceTrend,
  GetBalanceTrendParams,
} from '@/feature/accounts/types/accountBalanceTrend.types';
import { formatCents } from '@/utils/currency';

export const TREND_POINT_COUNT = 8;
export const MIN_TREND_BAR_HEIGHT = 12;
export const MAX_TREND_BAR_HEIGHT = 56;

const getBalanceTrendPoints = (
  initialBalanceCents: number,
  currentBalanceCents: number,
) =>
  Array.from({ length: TREND_POINT_COUNT }, (_, index) => {
    const progress = index / (TREND_POINT_COUNT - 1);

    return Math.round(
      initialBalanceCents +
        (currentBalanceCents - initialBalanceCents) * progress,
    );
  });

export const getTrendBarHeight = (value: number, values: number[]) => {
  const lowestValue = Math.min(...values);
  const highestValue = Math.max(...values);

  if (highestValue === lowestValue) {
    return (MIN_TREND_BAR_HEIGHT + MAX_TREND_BAR_HEIGHT) / 2;
  }

  const normalizedValue = (value - lowestValue) / (highestValue - lowestValue);

  return (
    MIN_TREND_BAR_HEIGHT +
    normalizedValue * (MAX_TREND_BAR_HEIGHT - MIN_TREND_BAR_HEIGHT)
  );
};

export const getBalanceTrend = ({
  currencies,
  currentBalanceCents,
  displayCurrencyId,
  initialBalanceCents,
}: GetBalanceTrendParams): BalanceTrend => {
  const differenceCents = currentBalanceCents - initialBalanceCents;
  const direction =
    differenceCents > 0 ? 'up' : differenceCents < 0 ? 'down' : 'flat';
  const differenceLabel = formatCents(
    Math.abs(differenceCents),
    displayCurrencyId,
    currencies,
  );
  const percent =
    initialBalanceCents === 0
      ? null
      : Math.abs((differenceCents / initialBalanceCents) * 100);
  const summary =
    direction === 'flat'
      ? 'Flat since opening'
      : `${direction === 'up' ? '+' : '-'}${differenceLabel} since opening`;

  return {
    differenceLabel,
    direction,
    percentLabel: percent === null ? null : `${percent.toFixed(1)}%`,
    points: getBalanceTrendPoints(initialBalanceCents, currentBalanceCents),
    summary,
  };
};
