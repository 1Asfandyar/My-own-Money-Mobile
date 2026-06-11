import { useCallback, useEffect, useMemo, useState } from 'react';

import { EMPTY_TRANSACTION_FILTERS } from '@/feature/transactions/constants/transactionDateFilter.constants';
import type {
  TransactionDateFilterField,
  TransactionFilters,
  UseTransactionDateFilterModalParams,
} from '@/feature/transactions/types/transactionDateFilter.types';
import {
  addDateFilterMonths,
  formatDateFilterMonth,
  getDateFilterCalendarDays,
  getDateFilterMonthStart,
  parseDateFilterValue,
} from '@/feature/transactions/utils/transactionDateFilter.utils';

const useTransactionDateFilterModal = ({
  filters,
  isVisible,
  onApplyFilters,
  onClearFilters,
  onClose,
}: UseTransactionDateFilterModalParams) => {
  const [activeField, setActiveField] =
    useState<TransactionDateFilterField>('fromDate');
  const [draftFilters, setDraftFilters] =
    useState<TransactionFilters>(filters);
  const [visibleMonth, setVisibleMonth] = useState(() =>
    getDateFilterMonthStart(new Date()),
  );

  const calendarDays = useMemo(
    () => getDateFilterCalendarDays(visibleMonth),
    [visibleMonth],
  );
  const monthLabel = useMemo(
    () => formatDateFilterMonth(visibleMonth),
    [visibleMonth],
  );

  useEffect(() => {
    if (!isVisible) return;

    const initialDate =
      parseDateFilterValue(filters.fromDate) ??
      parseDateFilterValue(filters.toDate) ??
      new Date();

    setDraftFilters(filters);
    setActiveField('fromDate');
    setVisibleMonth(getDateFilterMonthStart(initialDate));
  }, [filters, isVisible]);

  const selectField = useCallback(
    (field: TransactionDateFilterField) => {
      const selectedDate =
        parseDateFilterValue(draftFilters[field]) ?? new Date();

      setActiveField(field);
      setVisibleMonth(getDateFilterMonthStart(selectedDate));
    },
    [draftFilters],
  );

  const changeMonth = useCallback((months: number) => {
    setVisibleMonth((currentMonth) =>
      addDateFilterMonths(currentMonth, months),
    );
  }, []);

  const selectDate = useCallback(
    (value: string) => {
      setDraftFilters((currentFilters) => {
        const nextFilters = { ...currentFilters, [activeField]: value };

        if (
          activeField === 'fromDate' &&
          nextFilters.toDate &&
          value > nextFilters.toDate
        ) {
          nextFilters.toDate = '';
        }

        if (
          activeField === 'toDate' &&
          nextFilters.fromDate &&
          value < nextFilters.fromDate
        ) {
          nextFilters.fromDate = '';
        }

        return nextFilters;
      });

      if (activeField === 'fromDate') {
        setActiveField('toDate');
      }
    },
    [activeField],
  );

  const selectAccount = useCallback((accountId: number | null) => {
    setDraftFilters((current) => ({ ...current, accountId }));
  }, []);

  const selectCategory = useCallback((categoryId: number | null) => {
    setDraftFilters((current) => ({ ...current, categoryId }));
  }, []);

  const applyFilters = useCallback(() => {
    onApplyFilters(draftFilters);
    onClose();
  }, [draftFilters, onApplyFilters, onClose]);

  const clearFilters = useCallback(() => {
    setDraftFilters({ ...EMPTY_TRANSACTION_FILTERS });
    onClearFilters();
    onClose();
  }, [onClearFilters, onClose]);

  return {
    activeField,
    calendarDays,
    draftFilters,
    monthLabel,
    onApply: applyFilters,
    onChangeMonth: changeMonth,
    onClear: clearFilters,
    onSelectAccount: selectAccount,
    onSelectCategory: selectCategory,
    onSelectDate: selectDate,
    onSelectField: selectField,
  };
};

export default useTransactionDateFilterModal;
