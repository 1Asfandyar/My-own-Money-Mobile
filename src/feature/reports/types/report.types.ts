export interface ReportAccount {
  id: number;
  name: string;
  balance_cents: number;
  currency_symbol: string | null;
}

export interface ReportOverview {
  total_income_cents: number;
  total_expenses_cents: number;
  net_cents: number;
  savings_rate_percent: number;
}

export interface ReportCategorySpending {
  category_id: number;
  category_name: string;
  amount_cents: number;
  percent_of_expenses: number;
  transaction_count: number;
}

export interface SharedMoneyBreakdownItem {
  user_id: number;
  name: string;
  direction: 'owes_you' | 'you_owe';
  amount_cents: number;
}

export interface SharedMoney {
  you_will_receive_cents: number;
  you_owe_cents: number;
  net_cents: number;
  breakdown: SharedMoneyBreakdownItem[];
}

export interface TrendMonth {
  month: string;
  month_key: string;
  income_cents: number;
  expenses_cents: number;
}

export interface NetWorth {
  total_accounts_balance_cents: number;
  total_owed_to_you_cents: number;
  total_you_owe_cents: number;
  net_worth_cents: number;
}

export interface Report {
  period: string;
  overview: ReportOverview;
  accounts: ReportAccount[];
  total_balance_cents: number;
  spending_by_category: ReportCategorySpending[];
  shared_money: SharedMoney;
  net_worth: NetWorth;
  trend: TrendMonth[];
}

export interface ReportApiResponse {
  report: Report;
}

export type CategoryChartTab = 'bar' | 'donut';

export interface ReportsViewModel {
  report: Report | null;
  isLoading: boolean;
  error: string | null;
  selectedMonthKey: string;
  canGoForward: boolean;
  categoryChartTab: CategoryChartTab;
  currencySymbol: string;
  onPreviousMonth: () => void;
  onNextMonth: () => void;
  onRetry: () => void;
  onCategoryChartTabChange: (tab: CategoryChartTab) => void;
  onTrendMonthPress: (monthKey: string) => void;
}
