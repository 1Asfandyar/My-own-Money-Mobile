import type { Ionicons } from '@expo/vector-icons';

import type { FriendshipLedger } from '@/feature/friendships/types/friendship.types';

export type MainSideMenuItem = {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  onPress: () => void;
  subtitle: string;
};

export type MainSideMenuModalProps = {
  menuHeaderSubtitle: string;
  menuHeaderTitle: string;
  isVisible: boolean;
  onClose: () => void;
  primaryItems: MainSideMenuItem[];
  secondaryItems: MainSideMenuItem[];
};

export type MainHeaderViewProps = {
  menuHeaderSubtitle: string;
  menuHeaderTitle: string;
  isMenuVisible: boolean;
  notificationCount: number;
  notificationsModal: FriendshipNotificationsModalProps;
  onCloseMenu: () => void;
  onNotificationsPress: () => void;
  onOpenMenu: () => void;
  primaryMenuItems: MainSideMenuItem[];
  screenTitle: string;
  secondaryMenuItems: MainSideMenuItem[];
};

export type FriendshipNotificationsModalProps = {
  acceptingFriendshipId: number | null;
  error: string;
  isLoading: boolean;
  isVisible: boolean;
  onAcceptRequest: (friendshipId: number) => void;
  onClose: () => void;
  onRetry: () => void;
  requests: FriendshipLedger[];
};
