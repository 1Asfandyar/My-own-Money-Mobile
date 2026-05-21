import type { Group, GroupUser } from '@/feature/groups/types/group.types';

export type GroupDetailViewModel = {
  currentUserId?: number | null;
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
  onToggleEditFriend: (userId: number) => void;
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
