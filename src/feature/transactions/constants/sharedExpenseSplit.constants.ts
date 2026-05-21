import type { SharedExpenseSplitMethod } from '@/feature/transactions/types/sharedExpenseSplit.types';

export const sharedExpenseSplitMethods: {
  description: string;
  label: string;
  value: SharedExpenseSplitMethod;
}[] = [
  {
    description: 'Every participant owes the same amount.',
    label: 'Equally',
    value: 'equal',
  },
  {
    description: 'Use share counts, like 1 share or 2 shares each.',
    label: 'Shares',
    value: 'shares',
  },
  {
    description: 'Assign a percentage of the total to each person.',
    label: 'Percentage',
    value: 'percentage',
  },
  {
    description: 'Enter the exact amount each person owes.',
    label: 'Exact amount',
    value: 'exact',
  },
];

export const sharedExpenseSplitMethodLabels: Record<
  SharedExpenseSplitMethod,
  string
> = {
  equal: 'equally',
  exact: 'by exact amount',
  percentage: 'by percentage',
  shares: 'by shares',
};
