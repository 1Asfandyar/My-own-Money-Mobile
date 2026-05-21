import type { Currency } from '@/types/currency.types';

export type FriendshipStatus = 'pending' | 'accepted' | 'blocked';

export type FriendshipBalanceType = 'owes_you' | 'you_owe' | 'settled_up';

export type FriendshipActivityImpactType =
  | 'you_lent'
  | 'you_borrowed'
  | 'no_balance';

export type FriendshipUser = {
  email?: string | null;
  full_name?: string | null;
  id: number;
  mobile_number?: string | null;
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

export type FriendshipGroupBalance = {
  group_id: number;
  group_name: string;
  balance: FriendshipBalance;
};

export type FriendshipActivityItem = {
  transaction_id: number;
  title: string;
  amount_cents: number;
  transaction_date: string;
  payer: FriendshipUser;
  group: { id: number; name: string } | null;
  balance_impact: {
    type: FriendshipActivityImpactType;
    amount_cents: number;
  };
};

export type FriendshipLedger = Friendship & {
  balance_summary: FriendshipBalance;
  group_balances: FriendshipGroupBalance[];
  activity: FriendshipActivityItem[];
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
  onRetry: () => void;
  onSelectFriendship: (friendshipId: number) => void;
};

export type SharedFriendshipRowProps = {
  currencies: Currency[];
  displayCurrency: Currency;
  ledger: FriendshipLedger;
  onPress: (friendshipId: number) => void;
};

export type FriendshipLedgerModalProps = {
  currencies: Currency[];
  displayCurrency: Currency;
  isVisible: boolean;
  ledger?: FriendshipLedger;
  onClose: () => void;
};
