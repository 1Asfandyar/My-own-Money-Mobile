import type {
  TransactionDateFilterField,
  TransactionDateFilters,
  TransactionFilters,
} from '@/feature/transactions/types/transactionDateFilter.types';

export const TRANSACTION_DATE_FILTER_CALENDAR_DAY_COUNT = 42;

export const TRANSACTION_DATE_FILTER_WEEKDAY_LABELS = [
  'S',
  'M',
  'T',
  'W',
  'T',
  'F',
  'S',
] as const;

export const TRANSACTION_DATE_FILTER_FIELD_LABELS: Record<
  TransactionDateFilterField,
  string
> = {
  fromDate: 'From',
  toDate: 'To',
};

export const EMPTY_TRANSACTION_DATE_FILTERS: TransactionDateFilters = {
  fromDate: '',
  toDate: '',
};

export const EMPTY_TRANSACTION_FILTERS: TransactionFilters = {
  fromDate: '',
  toDate: '',
  accountId: null,
  categoryId: null,
};
