import type { Group, GroupUser, MemberBalances } from '@/feature/groups/types/group.types';
import type { ApiTransaction, TransactionListItem } from '@/feature/transactions/types/transaction.types';

export type GroupDetailViewModel = {
  currentUserId?: number | null;
  displayCurrencyId: number | undefined;
  memberBalances: MemberBalances | null;
  editError: string;
  editFriends: GroupUser[];
  editGroupName: string;
  editSelectedFriendIds: number[];
  error: string;
  group: Group | null;
  isEditDisabled: boolean;
  isEditModalVisible: boolean;
  isLoading: boolean;
  isSaving: boolean;
  members: GroupUser[];
  onBack: () => void;
  onChangeEditGroupName: (name: string) => void;
  onCloseEditModal: () => void;
  onOpenEditModal: () => void;
  onRefresh: () => void;
  onSaveGroup: () => void;
  onSelectTransaction: (transaction: ApiTransaction) => void;
  onToggleEditFriend: (userId: number) => void;
  transactions: TransactionListItem[];
};

export type GroupDetailViewProps = {
  detail: GroupDetailViewModel;
};

export type EditGroupModalProps = {
  error: string;
  friends: GroupUser[];
  groupName: string;
  isDisabled: boolean;
  isSaving: boolean;
  isVisible: boolean;
  onChangeGroupName: (name: string) => void;
  onClose: () => void;
  onSave: () => void;
  onToggleFriend: (userId: number) => void;
  selectedFriendIds: number[];
};
