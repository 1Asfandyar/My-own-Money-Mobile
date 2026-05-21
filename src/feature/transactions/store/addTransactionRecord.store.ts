import { create } from 'zustand';

import type {
  AddTransactionRecordState,
  AddTransactionRecordStore,
} from '@/feature/transactions/types/addTransactionRecord.types';

const initialAddTransactionRecordState: AddTransactionRecordState = {
  accountDropdownQuery: '',
  accounts: [],
  categories: [],
  categoryPickerQuery: '',
  friendEmailQuery: '',
  friendSearchError: '',
  friendSearchResults: [],
  friends: [],
  friendsGroup: null,
  formError: '',
  isAddFriendModalVisible: false,
  isAddingFriend: false,
  isCategoryPickerVisible: false,
  isLoadingOptions: true,
  isSearchingFriend: false,
  openDropdown: null,
};

export const useAddTransactionRecordStore =
  create<AddTransactionRecordStore>((set) => ({
    ...initialAddTransactionRecordState,
    closeAddFriendModal: () =>
      set({
        friendEmailQuery: '',
        friendSearchError: '',
        friendSearchResults: [],
        isAddFriendModalVisible: false,
      }),
    closeCategoryPicker: () =>
      set({ categoryPickerQuery: '', isCategoryPickerVisible: false }),
    closeDropdown: () => set({ accountDropdownQuery: '', openDropdown: null }),
    openAddFriendModal: () =>
      set({
        friendEmailQuery: '',
        friendSearchError: '',
        friendSearchResults: [],
        isAddFriendModalVisible: true,
        openDropdown: null,
      }),
    openAccountDropdown: () => set({ openDropdown: 'account' }),
    openCategoryPicker: () =>
      set({
        accountDropdownQuery: '',
        categoryPickerQuery: '',
        isCategoryPickerVisible: true,
        openDropdown: null,
      }),
    resetAddTransactionRecord: () => set(initialAddTransactionRecordState),
    setAccountDropdownQuery: (accountDropdownQuery) =>
      set({ accountDropdownQuery }),
    setAccounts: (accounts) => set({ accounts }),
    setCategories: (categories) => set({ categories }),
    setCategoryPickerQuery: (categoryPickerQuery) =>
      set({ categoryPickerQuery }),
    setFriendEmailQuery: (friendEmailQuery) =>
      set({ friendEmailQuery, friendSearchError: '' }),
    setFriendSearchError: (friendSearchError) => set({ friendSearchError }),
    setFriendSearchResults: (friendSearchResults) =>
      set({ friendSearchResults }),
    setFriends: (friends) => set({ friends }),
    setFriendsGroup: (friendsGroup) => set({ friendsGroup }),
    setFormError: (formError) => set({ formError }),
    setIsAddingFriend: (isAddingFriend) => set({ isAddingFriend }),
    setIsLoadingOptions: (isLoadingOptions) => set({ isLoadingOptions }),
    setIsSearchingFriend: (isSearchingFriend) =>
      set({ isSearchingFriend }),
  }));
