import type { FriendshipBalance } from '@/feature/friendships/types/friendship.types';
import type { GroupUser } from '@/feature/groups/types/group.types';
import type { Account } from '@/types/account.types';
import type { Currency } from '@/types/currency.types';

export type SettlementPayload = {
  title: string;
  transaction_type: 'settlement';
  amount_cents: number;
  account_id: number;
  settles_user_id: number;
  transaction_date: string;
  note?: string;
};

export type SettlementValidationErrors = {
  accountId?: string;
  amount?: string;
  form?: string;
};

export type SettlementSubmissionInput = {
  accountId: number | null;
  amount: string;
  balance: FriendshipBalance;
  friendId: number;
  friendName: string;
  note?: string;
  onSubmittingChange: (isSubmitting: boolean) => void;
  token: string;
  transactionDate: string;
};

export type SettlementSubmissionResult =
  | { status: 'success' }
  | { status: 'duplicate' }
  | { status: 'validation_error'; errors: SettlementValidationErrors }
  | {
      status: 'request_error';
      errors: SettlementValidationErrors;
      message: string;
    };

export type CreateSettlementRequest = (
  token: string,
  payload: SettlementPayload,
) => Promise<{ status: number }>;

export type SettlementSubmitterDependencies = {
  createSettlement: CreateSettlementRequest;
  invalidateCaches: () => void;
};

export type RecordPaymentViewModel = {
  account?: Account;
  accounts: Account[];
  amount: string;
  amountError?: string;
  close: () => void;
  closeAccountPicker: () => void;
  currencies: Currency[];
  currentUser: GroupUser;
  error: string;
  friendName: string;
  friendUser: GroupUser;
  isAccountPickerVisible: boolean;
  isLoading: boolean;
  isSaving: boolean;
  isSubmitDisabled: boolean;
  openAccountPicker: () => void;
  selectPaymentAccount: (accountId: number) => void;
  setAmount: (amount: string) => void;
  submit: () => void;
};

export type RecordPaymentViewProps = {
  payment: RecordPaymentViewModel;
};
