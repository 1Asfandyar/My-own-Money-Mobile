import { create } from 'zustand';

import type {
  AccountsOverviewStore,
  AccountsOverviewStoreState,
} from '@/feature/accounts/types/accountsOverview.types';
import { fallbackCurrencies } from '@/utils/currency';

const initialAccountsOverviewState: AccountsOverviewStoreState = {
  accounts: [],
  categoryDashboard: null,
  categoryDashboardError: null,
  currencies: fallbackCurrencies,
  error: null,
  friendshipDashboardError: null,
  friendshipLedgers: [],
  isAccountPickerVisible: false,
  isCategoryDashboardLoading: false,
  isFriendshipDashboardLoading: false,
  isLoading: true,
  selectedAccountId: null,
  selectedCategoryId: null,
  selectedExpenseTab: 'personal',
};

export const useAccountsOverviewStore = create<AccountsOverviewStore>((set) => ({
  ...initialAccountsOverviewState,
  closeAccountPicker: () => set({ isAccountPickerVisible: false }),
  openAccountPicker: () => set({ isAccountPickerVisible: true }),
  resetAccountsOverview: () => set(initialAccountsOverviewState),
  setAccounts: (accounts) => set({ accounts }),
  setCategoryDashboard: (categoryDashboard) => set({ categoryDashboard }),
  setCategoryDashboardError: (categoryDashboardError) =>
    set({ categoryDashboardError }),
  setCurrencies: (currencies) => set({ currencies }),
  setError: (error) => set({ error }),
  setFriendshipDashboardError: (friendshipDashboardError) =>
    set({ friendshipDashboardError }),
  setFriendshipLedgers: (friendshipLedgers) => set({ friendshipLedgers }),
  setIsCategoryDashboardLoading: (isCategoryDashboardLoading) =>
    set({ isCategoryDashboardLoading }),
  setIsFriendshipDashboardLoading: (isFriendshipDashboardLoading) =>
    set({ isFriendshipDashboardLoading }),
  setIsLoading: (isLoading) => set({ isLoading }),
  setSelectedAccountId: (selectedAccountId) => set({ selectedAccountId }),
  setSelectedCategoryId: (selectedCategoryId) => set({ selectedCategoryId }),
  setSelectedExpenseTab: (selectedExpenseTab) => set({ selectedExpenseTab }),
}));
