import type { Ionicons } from '@expo/vector-icons';

import type { AddFriendModalProps } from '@/feature/transactions/types/addTransactionRecord.types';

export type MainSideMenuItem = {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  onPress: () => void;
  subtitle: string;
};

export type MainSideMenuModalProps = {
  currentDateLabel: string;
  isVisible: boolean;
  onClose: () => void;
  primaryItems: MainSideMenuItem[];
  secondaryItems: MainSideMenuItem[];
};

export type QuickAddAccountModalProps = {
  accountName: string;
  balance: string;
  currencyCode: string;
  error: string;
  isSaving: boolean;
  isVisible: boolean;
  onChangeAccountName: (value: string) => void;
  onChangeBalance: (value: string) => void;
  onClose: () => void;
  onSave: () => void;
};

export type MainHeaderViewProps = {
  addAccountModal: QuickAddAccountModalProps;
  addFriendModal: AddFriendModalProps;
  currentDateLabel: string;
  isMenuVisible: boolean;
  onCloseMenu: () => void;
  onNotificationsPress: () => void;
  onOpenMenu: () => void;
  primaryMenuItems: MainSideMenuItem[];
  secondaryMenuItems: MainSideMenuItem[];
};
