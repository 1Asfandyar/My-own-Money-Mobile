import { Ionicons } from '@expo/vector-icons';

import type { Category } from '@/feature/categories/types/category.types';
import type { Group, GroupUser } from '@/feature/groups/types/group.types';
import type {
  SharedExpenseSplitMethod,
  SharedExpenseSplitValueMap,
} from '@/feature/transactions/types/sharedExpenseSplit.types';
import type { TransactionType } from '@/feature/transactions/types/transaction.types';
import type { Account } from '@/types/account.types';

export type AddTransactionRecordKind = 'personal' | 'shared';

export type AddTransactionRecordContent = {
  iconName: keyof typeof Ionicons.glyphMap;
  submitLabel: string;
  subtitle: string;
  title: string;
};

export type AddTransactionRecordFormField =
  | 'accountId'
  | 'amount'
  | 'categoryId'
  | 'note'
  | 'splitValues'
  | 'sharedUserIds'
  | 'transactionType';

export type AddTransactionRecordTextField =
  | 'accountId'
  | 'amount'
  | 'categoryId'
  | 'note';

export type AddTransactionRecordFormValues = {
  accountId: string;
  amount: string;
  categoryId: string;
  note: string;
  splitMethod: SharedExpenseSplitMethod;
  splitValues: SharedExpenseSplitValueMap;
  sharedUserIds: number[];
  transactionType: TransactionType;
};

export type AddTransactionRecordScreenProps = {
  recordKind: AddTransactionRecordKind;
};

export type AddTransactionRecordOpenDropdown = 'account' | null;

export type TransactionTypeTabConfig = {
  value: TransactionType;
  label: string;
  iconName: keyof typeof Ionicons.glyphMap;
};

export type TransactionTypeTabsProps = {
  selectedType: TransactionType;
  onSelectType: (type: TransactionType) => void;
};

export type AddTransactionRecordDropdownOption = {
  id: number;
  label: string;
  iconName?: keyof typeof Ionicons.glyphMap;
  iconColor?: string;
  supportingLabel?: string;
};

export type SearchableDropdownOptionRowProps = {
  isSelected: boolean;
  onSelect: (id: number) => void;
  option: AddTransactionRecordDropdownOption;
};

export type SearchableDropdownProps = {
  error?: string;
  iconName: keyof typeof Ionicons.glyphMap;
  inlineLabel?: string;
  isOpen: boolean;
  isProminent?: boolean;
  label?: string;
  onBlur?: () => void;
  onClose: () => void;
  onOpen: () => void;
  onQueryChange: (query: string) => void;
  onSelect: (id: number) => void;
  options: AddTransactionRecordDropdownOption[];
  placeholder: string;
  query: string;
  selectedId: number | null;
};

export type CategoryOptionRowProps = {
  isSelected: boolean;
  onSelect: (id: number) => void;
  option: AddTransactionRecordDropdownOption;
};

export type CategoryPickerModalProps = {
  isVisible: boolean;
  onClose: () => void;
  onQueryChange: (query: string) => void;
  onSelect: (id: number) => void;
  options: AddTransactionRecordDropdownOption[];
  query: string;
  selectedId: number | null;
};

export type SharedExpenseParticipantsProps = {
  currentUserId?: number | null;
  error?: string;
  friends: GroupUser[];
  friendsGroupId: number | null;
  groups: Group[];
  query: string;
  onAddFriendPress: () => void;
  onQueryChange: (query: string) => void;
  onToggleGroup: (group: Group) => void;
  onToggleFriend: (id: number) => void;
  selectedFriends: GroupUser[];
  selectedUserIds: number[];
};

export type SharedExpenseAvatarProps = {
  className?: string;
  size?: number;
  user: GroupUser;
};

export type SharedExpenseSplitSummaryProps = {
  methodLabel: string;
  onOpenSplitSheet: () => void;
  participantCount: number;
};

export type SharedExpenseSplitSheetProps = {
  currencyId?: number | null;
  error?: string;
  isVisible: boolean;
  method: SharedExpenseSplitMethod;
  onChangeMethod: (method: SharedExpenseSplitMethod) => void;
  onChangeValue: (userId: number, value: string) => void;
  onClose: () => void;
  participants: GroupUser[];
  totalAmountCents: number;
  values: SharedExpenseSplitValueMap;
};

export type SplitParticipantRowProps = {
  currencyId?: number | null;
  index: number;
  method: SharedExpenseSplitMethod;
  onChangeValue: (userId: number, value: string) => void;
  participant: GroupUser;
  participantCount: number;
  totalAmountCents: number;
  totalShares: number;
  value: string;
};

export type SharedTransactionRecordFormProps = {
  form: AddTransactionRecordViewModel;
};

export type AddFriendModalProps = {
  emailQuery: string;
  error: string;
  existingFriendIds: number[];
  isAdding: boolean;
  isSearching: boolean;
  isVisible: boolean;
  onAddUser: (id: number) => void;
  onChangeEmail: (query: string) => void;
  onClose: () => void;
  onSearch: () => void;
  results: GroupUser[];
};

export type FriendSearchResultRowProps = {
  isAdding: boolean;
  isAlreadyFriend: boolean;
  isSearching: boolean;
  onAddUser: (id: number) => void;
  user: GroupUser;
};

export type AddTransactionRecordFormData = {
  accounts: Account[];
  categories: Category[];
};

export type AddTransactionRecordState = {
  accountDropdownQuery: string;
  accounts: Account[];
  categories: Category[];
  categoryPickerQuery: string;
  friendEmailQuery: string;
  friendSearchError: string;
  friendSearchResults: GroupUser[];
  friends: GroupUser[];
  friendsGroup: Group | null;
  formError: string;
  isAddFriendModalVisible: boolean;
  isAddingFriend: boolean;
  isCategoryPickerVisible: boolean;
  isLoadingOptions: boolean;
  isSearchingFriend: boolean;
  openDropdown: AddTransactionRecordOpenDropdown;
};

export type AddTransactionRecordActions = {
  closeAddFriendModal: () => void;
  closeCategoryPicker: () => void;
  closeDropdown: () => void;
  openAddFriendModal: () => void;
  openAccountDropdown: () => void;
  openCategoryPicker: () => void;
  resetAddTransactionRecord: () => void;
  setAccountDropdownQuery: (query: string) => void;
  setAccounts: (accounts: Account[]) => void;
  setCategories: (categories: Category[]) => void;
  setCategoryPickerQuery: (query: string) => void;
  setFriendEmailQuery: (query: string) => void;
  setFriendSearchError: (error: string) => void;
  setFriendSearchResults: (users: GroupUser[]) => void;
  setFriends: (friends: GroupUser[]) => void;
  setFriendsGroup: (group: Group | null) => void;
  setFormError: (formError: string) => void;
  setIsAddingFriend: (isAddingFriend: boolean) => void;
  setIsLoadingOptions: (isLoadingOptions: boolean) => void;
  setIsSearchingFriend: (isSearchingFriend: boolean) => void;
};

export type AddTransactionRecordStore = AddTransactionRecordState &
  AddTransactionRecordActions;

export type AddTransactionRecordFieldErrors = Partial<
  Record<AddTransactionRecordFormField, string>
>;

export type AddTransactionRecordViewModel = {
  accountDropdownQuery: string;
  accountOptions: AddTransactionRecordDropdownOption[];
  addFriend: (userId: number) => void;
  cancel: () => void;
  categoryPickerQuery: string;
  categoryOptions: AddTransactionRecordDropdownOption[];
  closeAddFriendModal: () => void;
  closeCategoryPicker: () => void;
  closeDropdown: () => void;
  content: AddTransactionRecordContent;
  fieldErrors: AddTransactionRecordFieldErrors;
  friendEmailQuery: string;
  friendSearchError: string;
  friendSearchResults: GroupUser[];
  friends: GroupUser[];
  friendsGroupId: number | null;
  formError: string;
  currentUserId?: number | null;
  isAddFriendModalVisible: boolean;
  isAddingFriend: boolean;
  isCategoryPickerVisible: boolean;
  isLoadingOptions: boolean;
  isSaving: boolean;
  isSearchingFriend: boolean;
  isSharedRecord: boolean;
  isSubmitDisabled: boolean;
  isSplitSheetVisible: boolean;
  closeSplitSheet: () => void;
  openAddFriendModal: () => void;
  openAccountDropdown: () => void;
  openCategoryPicker: () => void;
  openDropdown: AddTransactionRecordOpenDropdown;
  searchFriendByEmail: () => void;
  selectAccount: (id: number) => void;
  selectCategory: (id: number) => void;
  selectedAccountId: number | null;
  selectedAccountCurrencyId?: number | null;
  selectedCategory?: AddTransactionRecordDropdownOption;
  selectedCategoryId: number | null;
  selectedSharedFriends: GroupUser[];
  selectedSharedUserIds: number[];
  setFriendPickerQuery: (query: string) => void;
  setAccountDropdownQuery: (query: string) => void;
  setCategoryPickerQuery: (query: string) => void;
  setFriendEmailQuery: (query: string) => void;
  splitMethodLabel: string;
  splitParticipants: GroupUser[];
  sharedGroups: Group[];
  friendPickerQuery: string;
  openSplitSheet: () => void;
  submit: () => void;
  toggleSharedGroup: (group: Group) => void;
  toggleSharedUser: (id: number) => void;
  totalAmountCents: number;
  updateSplitMethod: (method: SharedExpenseSplitMethod) => void;
  updateSplitValue: (userId: number, value: string) => void;
  updateField: (
    field: AddTransactionRecordTextField,
    value: string,
  ) => void;
  updateTransactionType: (transactionType: TransactionType) => void;
  validateField: (field: keyof AddTransactionRecordFormValues) => void;
  values: AddTransactionRecordFormValues;
};

export type AddTransactionRecordViewProps = {
  form: AddTransactionRecordViewModel;
};

export type { Category, TransactionType };
