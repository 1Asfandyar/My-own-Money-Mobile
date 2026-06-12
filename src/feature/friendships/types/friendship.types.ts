import type { Currency } from '@/types/currency.types';
import type { ApiTransaction, TransactionListItem } from '@/feature/transactions/types/transaction.types';

export type FriendshipStatus = 'pending' | 'accepted' | 'blocked';

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
  error: string | null;
  friend: FriendshipUser | null;
  friendship: FriendshipDetail | null;
  isLoading: boolean;
  onBack: () => void;
  onRetry: () => void;
  onSelectTransaction: (transaction: ApiTransaction) => void;
  onSettleUp: () => void;
  settleUpDisabled: boolean;
  transactions: TransactionListItem[];
};

export type FriendshipDetailViewProps = {
  detail: FriendshipDetailViewModel;
};
