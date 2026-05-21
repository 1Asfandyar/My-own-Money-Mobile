import type {
  TransactionCategoryBreakdown,
  TransactionsByCategoryDashboard,
} from '@/feature/categories/types/categoryDashboard.types';
import type { ExpenseOverviewTab } from '@/feature/transactions/types/expenseOverview.types';
import type {
  SharedExpenseFriendTransactions,
  SharedExpensesDashboard,
} from '@/feature/transactions/types/sharedExpense.types';
import type { Account } from '@/types/account.types';
import type { Currency } from '@/types/currency.types';

export type AccountsOverviewHeaderProps = {
  firstName?: string;
  onRefresh: () => void;
};

export type SelectedAccountBalanceCardProps = {
  selectedAccount?: Account;
  displayCurrency: Currency;
  currencies: Currency[];
  onChangeAccountPress: () => void;
};

export type AccountsOverviewStatusProps = {
  error: string | null;
  hasAccounts: boolean;
  isLoading: boolean;
  onRetry: () => void;
};

export type AccountPickerModalProps = {
  accounts: Account[];
  currencies: Currency[];
  isVisible: boolean;
  selectedAccount?: Account;
  onClose: () => void;
  onSelectAccount: (accountId: number) => void;
};

export type AccountOptionRowProps = {
  account: Account;
  currencies: Currency[];
  isSelected: boolean;
  onSelectAccount: (accountId: number) => void;
};

export type AccountsOverviewCategoryTotals = {
  totalExpenseCents: number;
  totalIncomeCents: number;
};

export type AccountsOverviewViewModel = {
  activeAccounts: Account[];
  categoryBreakdowns: TransactionCategoryBreakdown[];
  categoryDashboard: TransactionsByCategoryDashboard | null;
  categoryDashboardError: string | null;
  categoryTotals: AccountsOverviewCategoryTotals;
  closeAccountPicker: () => void;
  closeDashboardCategory: () => void;
  currencies: Currency[];
  displayCurrency: Currency;
  error: string | null;
  isAccountPickerVisible: boolean;
  isCategoryDashboardLoading: boolean;
  isLoading: boolean;
  isSharedExpensesDashboardLoading: boolean;
  openAccountPicker: () => void;
  refreshAccounts: () => void;
  refreshCategoryDashboard: () => void;
  refreshOverview: () => void;
  refreshSharedExpensesDashboard: () => void;
  selectedAccount?: Account;
  selectedCategoryBreakdown?: TransactionCategoryBreakdown;
  selectedExpenseTab: ExpenseOverviewTab;
  selectAccount: (accountId: number) => void;
  selectDashboardCategory: (categoryId: number) => void;
  setSelectedExpenseTab: (tab: ExpenseOverviewTab) => void;
  sharedExpenseFriends: SharedExpenseFriendTransactions[];
  sharedExpensesDashboard: SharedExpensesDashboard | null;
  sharedExpensesDashboardError: string | null;
  userFirstName?: string;
};

export type AccountsOverviewViewProps = {
  dashboard: AccountsOverviewViewModel;
};

export type AccountsOverviewStoreState = {
  accounts: Account[];
  currencies: Currency[];
  isAccountPickerVisible: boolean;
  isCategoryDashboardLoading: boolean;
  isSharedExpensesDashboardLoading: boolean;
  isLoading: boolean;
  categoryDashboard: TransactionsByCategoryDashboard | null;
  categoryDashboardError: string | null;
  error: string | null;
  sharedExpensesDashboard: SharedExpensesDashboard | null;
  sharedExpensesDashboardError: string | null;
  selectedAccountId: number | null;
  selectedCategoryId: number | null;
  selectedExpenseTab: ExpenseOverviewTab;
};

export type AccountsOverviewStoreActions = {
  closeAccountPicker: () => void;
  openAccountPicker: () => void;
  resetAccountsOverview: () => void;
  setAccounts: (accounts: Account[]) => void;
  setCategoryDashboard: (
    categoryDashboard: TransactionsByCategoryDashboard | null,
  ) => void;
  setCategoryDashboardError: (error: string | null) => void;
  setCurrencies: (currencies: Currency[]) => void;
  setError: (error: string | null) => void;
  setIsCategoryDashboardLoading: (isLoading: boolean) => void;
  setIsSharedExpensesDashboardLoading: (isLoading: boolean) => void;
  setIsLoading: (isLoading: boolean) => void;
  setSelectedAccountId: (accountId: number | null) => void;
  setSelectedCategoryId: (categoryId: number | null) => void;
  setSelectedExpenseTab: (tab: ExpenseOverviewTab) => void;
  setSharedExpensesDashboard: (
    dashboard: SharedExpensesDashboard | null,
  ) => void;
  setSharedExpensesDashboardError: (error: string | null) => void;
};

export type AccountsOverviewStore = AccountsOverviewStoreState &
  AccountsOverviewStoreActions;
