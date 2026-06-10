import type { Account } from '@/types/account.types';
import type { Category } from '@/feature/categories/types/category.types';

export type TransactionDateFilters = {
  fromDate: string;
  toDate: string;
};

export type TransactionFilters = TransactionDateFilters & {
  accountId: number | null;
  categoryId: number | null;
};

export type TransactionDateFilterField = keyof TransactionDateFilters;

export type TransactionDateFilterCalendarDay = {
  dayLabel: string;
  isInMonth: boolean;
  isToday: boolean;
  value: string;
};

export type TransactionDateFilterModalProps = {
  accounts: Account[];
  categories: Category[];
  filters: TransactionFilters;
  isVisible: boolean;
  onApplyFilters: (filters: TransactionFilters) => void;
  onClearFilters: () => void;
  onClose: () => void;
};

export type TransactionDateFilterModalViewProps = {
  accounts: Account[];
  activeField: TransactionDateFilterField;
  calendarDays: TransactionDateFilterCalendarDay[];
  categories: Category[];
  draftFilters: TransactionFilters;
  isVisible: boolean;
  monthLabel: string;
  onApply: () => void;
  onChangeMonth: (months: number) => void;
  onClear: () => void;
  onClose: () => void;
  onSelectAccount: (accountId: number | null) => void;
  onSelectCategory: (categoryId: number | null) => void;
  onSelectDate: (value: string) => void;
  onSelectField: (field: TransactionDateFilterField) => void;
};

export type UseTransactionDateFilterModalParams =
  TransactionDateFilterModalProps;
