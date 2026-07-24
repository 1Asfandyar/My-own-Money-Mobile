export type AccountBalanceTrend = {
  summary: string;
  direction: 'down' | 'up' | 'neutral';
  percentLabel?: string;
};

export type AccountBalanceTrendGraphProps = {
  accentColor: string;
  isBalanceVisible: boolean;
  trend: AccountBalanceTrend;
};
