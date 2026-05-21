import type { Group, GroupUser } from '@/feature/groups/types/group.types';

export type GroupsViewModel = {
  createError: string;
  createGroupName: string;
  customGroups: Group[];
  error: string;
  friends: GroupUser[];
  isCreateDisabled: boolean;
  isCreateModalVisible: boolean;
  isCreating: boolean;
  isLoading: boolean;
  onChangeCreateGroupName: (name: string) => void;
  onCloseCreateModal: () => void;
  onCreateGroup: () => void;
  onOpenCreateModal: () => void;
  onRefresh: () => void;
  onToggleFriend: (userId: number) => void;
  selectedFriendIds: number[];
};

export type GroupsViewProps = {
  groups: GroupsViewModel;
};

export type GroupCardProps = {
  group: Group;
  onPress?: () => void;
};

export type GroupFriendOptionRowProps = {
  friend: GroupUser;
  isSelected: boolean;
  onToggleFriend: (userId: number) => void;
};

export type GroupListItemProps = {
  group: Group;
  onOpenGroup: (groupId: number) => void;
};

export type CreateGroupModalProps = {
  error: string;
  friends: GroupUser[];
  groupName: string;
  isCreating: boolean;
  isDisabled: boolean;
  isVisible: boolean;
  onChangeGroupName: (name: string) => void;
  onClose: () => void;
  onCreate: () => void;
  onToggleFriend: (userId: number) => void;
  selectedFriendIds: number[];
};
