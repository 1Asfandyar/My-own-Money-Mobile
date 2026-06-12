import type { Currency } from '@/types/currency.types';
import type { GroupUser } from '@/feature/groups/types/group.types';
import type { ApiTransaction, TransactionListItem } from '@/feature/transactions/types/transaction.types';

export type FriendshipStatus = 'pending' | 'accepted' | 'blocked';

export type FriendshipManagementAction = 'block' | 'cancel' | 'reject';

export type FriendshipBalanceType = 'owes_you' | 'you_owe' | 'settled_up';

export type FriendshipUser = {
  avatar_url?: string | null;
  email?: string | null;
  full_name?: string | null;
  id: number;
  mobile_number?: string | null;
  photo_url?: string | null;
  profile_image_url?: string | null;
  profile_photo_url?: string | null;
  role?: string | null;
  created_at?: string;
  updated_at?: string;
};

export type Friendship = {
  id: number;
  status: FriendshipStatus;
  requested_by_id: number;
  friend: FriendshipUser;
  created_at: string;
  updated_at: string;
};

export type FriendshipBalance = {
  type: FriendshipBalanceType;
  amount_cents: number;
};

export type FriendshipLedger = Friendship & {
  balance?: FriendshipBalance;
  balance_summary: FriendshipBalance;
};

export type GroupBalance = {
  group_id: number;
  group_name: string;
  balance: FriendshipBalance;
};

export type FriendshipDetail = Friendship & {
  balance?: FriendshipBalance;
  balance_summary: FriendshipBalance;
  group_balances: GroupBalance[];
  transactions: ApiTransaction[];
};

export type ListFriendshipsParams = {
  filter?: 'incoming' | 'outgoing';
  status?: FriendshipStatus;
};

export type SharedFriendshipDashboardProps = {
  currencies: Currency[];
  displayCurrency: Currency;
  error: string | null;
  isLoading: boolean;
  ledgers: FriendshipLedger[];
  onSelectFriendship: (friendshipId: number) => void;
  onRetry: () => void;
};

export type SharedFriendshipRowProps = {
  currencies: Currency[];
  displayCurrency: Currency;
  ledger: FriendshipLedger;
  onPress: (friendshipId: number) => void;
};

export type FriendshipDetailViewModel = {
  balanceAmountLabel: string;
  balanceLabel: string;
  balanceColor: string;
  canSettleUp: boolean;
  error: string | null;
  friend: FriendshipUser | null;
  friendship: FriendshipDetail | null;
  isLoading: boolean;
  onBack: () => void;
  onRetry: () => void;
  onSelectTransaction: (transaction: ApiTransaction) => void;
  onSettleUp: () => void;
  transactions: TransactionListItem[];
};

export type FriendshipDetailViewProps = {
  detail: FriendshipDetailViewModel;
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

export type FriendshipManagementCardProps = {
  currentUserId?: number | null;
  friendship: FriendshipLedger;
  isUpdating: boolean;
  onAction: (friendship: FriendshipLedger) => void;
};

export type ManageFriendsViewModel = {
  addFriend: (userId: number) => void;
  closeAddModal: () => void;
  emailQuery: string;
  error: string;
  existingFriendIds: number[];
  friendError: string;
  friendships: FriendshipLedger[];
  isAddModalVisible: boolean;
  isAdding: boolean;
  isLoading: boolean;
  isSearching: boolean;
  onBack: () => void;
  onFriendshipAction: (friendship: FriendshipLedger) => void;
  onOpenAddModal: () => void;
  onRefresh: () => void;
  results: GroupUser[];
  searchByEmail: () => void;
  setEmailQuery: (query: string) => void;
  updatingFriendshipId: number | null;
  userId?: number | null;
};

export type ManageFriendsViewProps = {
  manager: ManageFriendsViewModel;
};
