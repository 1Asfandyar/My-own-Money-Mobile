import type {
  TransactionCategoryBreakdown,
  TransactionsByCategoryDashboard,
} from '@/feature/categories/types/categoryDashboard.types';
import type { FriendshipLedger } from '@/feature/friendships/types/friendship.types';
import type { ExpenseOverviewTab } from '@/feature/transactions/types/expenseOverview.types';
import type { Transaction } from '@/feature/transactions/types/transaction.types';
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
  closeFriendshipLedger: () => void;
  currencies: Currency[];
  displayCurrency: Currency;
  editDashboardCategoryTransaction: (transaction: Transaction) => void;
  error: string | null;
  friendshipDashboardError: string | null;
  friendshipLedgers: FriendshipLedger[];
  isAccountPickerVisible: boolean;
  isCategoryDashboardLoading: boolean;
  isFriendshipDashboardLoading: boolean;
  isLoading: boolean;
  openAccountPicker: () => void;
  refreshAccounts: () => void;
  refreshCategoryDashboard: () => void;
  refreshFriendshipDashboard: () => void;
  refreshOverview: () => void;
  addDashboardCategoryRecord: (categoryId: number) => void;
  selectedAccount?: Account;
  selectedCategoryBreakdown?: TransactionCategoryBreakdown;
  selectedExpenseTab: ExpenseOverviewTab;
  selectedFriendshipLedger?: FriendshipLedger;
  selectAccount: (accountId: number) => void;
  selectDashboardCategory: (categoryId: number) => void;
  selectFriendshipLedger: (friendshipId: number) => void;
  setSelectedExpenseTab: (tab: ExpenseOverviewTab) => void;
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
  isFriendshipDashboardLoading: boolean;
  isLoading: boolean;
  categoryDashboard: TransactionsByCategoryDashboard | null;
  categoryDashboardError: string | null;
  error: string | null;
  friendshipDashboardError: string | null;
  friendshipLedgers: FriendshipLedger[];
  selectedAccountId: number | null;
  selectedCategoryId: number | null;
  selectedExpenseTab: ExpenseOverviewTab;
  selectedFriendshipId: number | null;
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
  setFriendshipDashboardError: (error: string | null) => void;
  setFriendshipLedgers: (ledgers: FriendshipLedger[]) => void;
  setIsCategoryDashboardLoading: (isLoading: boolean) => void;
  setIsFriendshipDashboardLoading: (isLoading: boolean) => void;
  setIsLoading: (isLoading: boolean) => void;
  setSelectedAccountId: (accountId: number | null) => void;
  setSelectedCategoryId: (categoryId: number | null) => void;
  setSelectedExpenseTab: (tab: ExpenseOverviewTab) => void;
  setSelectedFriendshipId: (friendshipId: number | null) => void;
};

export type AccountsOverviewStore = AccountsOverviewStoreState &
  AccountsOverviewStoreActions;
