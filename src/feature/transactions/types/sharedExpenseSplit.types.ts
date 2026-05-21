export type SharedExpenseSplitMethod = 'equal' | 'shares' | 'percentage' | 'exact';

export type SharedExpenseSplitValueMap = Record<string, string>;

export type SharedExpenseUserSharePayload = {
  user_id: number;
  amount_cents?: number;
  percentage?: number;
  shares?: number;
};
