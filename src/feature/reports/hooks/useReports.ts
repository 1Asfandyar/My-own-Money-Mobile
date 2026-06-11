import { useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useEffect, useRef, useState } from 'react';

import { getReportSummary } from '@/feature/reports/api/reports.api';
import type {
  CategoryChartTab,
  Report,
  ReportsViewModel,
} from '@/feature/reports/types/report.types';
import { ApiError } from '@/services/api';
import { useAuthStore } from '@/store/auth.store';
import { fallbackCurrencies, getCurrencyByCode, getCurrencyById } from '@/utils/currency';
import { ROUTES } from '@/config/routes';

const getCurrentMonthKey = (): string => {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
};

const shiftMonth = (key: string, delta: number): string => {
  const [year, month] = key.split('-').map(Number);
  const d = new Date(year, month - 1 + delta, 1);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
};

const isValidMonthKey = (value: unknown): value is string =>
  typeof value === 'string' && /^\d{4}-\d{2}$/.test(value);

export const useReports = (): ReportsViewModel => {
  const router = useRouter();
  const params = useLocalSearchParams<{ month?: string }>();
  const token = useAuthStore((state) => state.token);
  const user = useAuthStore((state) => state.user);
  const clearSession = useAuthStore((state) => state.clearSession);

  const currentMonthKey = getCurrentMonthKey();
  const paramMonth = isValidMonthKey(params.month) ? params.month : null;

  const [selectedMonthKey, setSelectedMonthKey] = useState<string>(
    paramMonth ?? currentMonthKey,
  );
  const [report, setReport] = useState<Report | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [categoryChartTab, setCategoryChartTab] = useState<CategoryChartTab>('bar');

  const requestIdRef = useRef(0);

  const redirectToLogin = useCallback(async () => {
    await clearSession();
    router.replace(ROUTES.AUTH_LOGIN);
  }, [clearSession, router]);

  const fetchReport = useCallback(async (monthKey: string) => {
    if (!token) return;

    const requestId = requestIdRef.current + 1;
    requestIdRef.current = requestId;
    setIsLoading(true);
    setError(null);

    try {
      const isCurrentMonth = monthKey === getCurrentMonthKey();
      const nextReport = await getReportSummary(
        token,
        isCurrentMonth ? undefined : monthKey,
      );

      if (requestIdRef.current !== requestId) return;
      setReport(nextReport);
    } catch (err) {
      if (requestIdRef.current !== requestId) return;

      if (err instanceof ApiError && err.status === 401) {
        await redirectToLogin();
        return;
      }

      setError(err instanceof Error ? err.message : 'Could not load report.');
    } finally {
      if (requestIdRef.current === requestId) {
        setIsLoading(false);
      }
    }
  }, [token, redirectToLogin]);

  useEffect(() => {
    void fetchReport(selectedMonthKey);
  }, [fetchReport, selectedMonthKey]);

  const navigateToMonth = useCallback((monthKey: string) => {
    setSelectedMonthKey(monthKey);
    setReport(null);
    router.setParams({ month: monthKey });
  }, [router]);

  const onPreviousMonth = useCallback(() => {
    navigateToMonth(shiftMonth(selectedMonthKey, -1));
  }, [navigateToMonth, selectedMonthKey]);

  const onNextMonth = useCallback(() => {
    const next = shiftMonth(selectedMonthKey, 1);
    if (next <= currentMonthKey) {
      navigateToMonth(next);
    }
  }, [navigateToMonth, selectedMonthKey, currentMonthKey]);

  const onTrendMonthPress = useCallback((monthKey: string) => {
    navigateToMonth(monthKey);
  }, [navigateToMonth]);

  const onRetry = useCallback(() => {
    void fetchReport(selectedMonthKey);
  }, [fetchReport, selectedMonthKey]);

  const currencySymbol = (() => {
    if (report?.accounts[0]?.currency_code) {
      return getCurrencyByCode(report.accounts[0].currency_code, fallbackCurrencies).symbol;
    }
    return getCurrencyById(user?.currency_id, fallbackCurrencies).symbol;
  })();

  return {
    report,
    isLoading,
    error,
    selectedMonthKey,
    canGoForward: shiftMonth(selectedMonthKey, 1) <= currentMonthKey,
    categoryChartTab,
    currencySymbol,
    onPreviousMonth,
    onNextMonth,
    onRetry,
    onCategoryChartTabChange: setCategoryChartTab,
    onTrendMonthPress,
  };
};
