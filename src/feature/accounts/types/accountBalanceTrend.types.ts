import type { Currency } from '@/types/currency.types';

export type BalanceTrendDirection = 'up' | 'down' | 'flat';

export type BalanceTrend = {
  direction: BalanceTrendDirection;
  differenceLabel: string;
  percentLabel: string | null;
  points: number[];
  summary: string;
};

export type GetBalanceTrendParams = {
  currencies: Currency[];
  currentBalanceCents: number;
  displayCurrencyId: number;
  initialBalanceCents: number;
};

export type AccountBalanceTrendGraphProps = {
  accentColor: string;
  isBalanceVisible: boolean;
  trend: BalanceTrend;
};