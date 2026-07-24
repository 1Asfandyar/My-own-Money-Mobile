import type { Href } from 'expo-router';
import { useRouter } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';
import { Share } from 'react-native';

import { ENV } from '@/config/env';
import { ROUTES } from '@/config/routes';
import useFriendshipNotifications from '@/feature/friendships/hooks/useFriendshipNotifications';
import type {
  MainHeaderViewProps,
  MainSideMenuItem,
} from '@/feature/main/types/mainHeader.types';

const inviteMessage =
  'Join me on My Own Money to track expenses, groups, and shared balances together.';

const MENU_HEADER_VARIANTS = {
  appIdentity: {
    subtitle: 'Personal finance workspace',
    title: ENV.APP_NAME,
  },
  quickActions: {
    subtitle: 'Quick actions',
    title: 'Manage and connect',
  },
  support: {
    subtitle: 'Need help?',
    title: 'Support and information',
  },
} as const;

const SELECTED_MENU_HEADER_VARIANT: keyof typeof MENU_HEADER_VARIANTS =
  'appIdentity';

const getInviteMessage = () => {
  if (ENV.APP_SHARE_URL) {
    return `${inviteMessage}\n\nGet the app: ${ENV.APP_SHARE_URL}`;
  }

  return inviteMessage;
};

export const useMainHeader = (): MainHeaderViewProps => {
  const router = useRouter();
  const [isMenuVisible, setIsMenuVisible] = useState(false);
  const menuHeaderContent = useMemo(
    () => MENU_HEADER_VARIANTS[SELECTED_MENU_HEADER_VARIANT],
    [],
  );
  const {
    acceptingFriendshipId,
    error: notificationsError,
    incomingRequests,
    isLoading: isNotificationsLoading,
    isVisible: isNotificationsVisible,
    notificationCount,
    onAcceptRequest,
    onClose: closeNotifications,
    onOpen: openNotificationsSheet,
    onRetry: retryNotifications,
  } = useFriendshipNotifications();

  const openNotifications = useCallback(() => {
    setIsMenuVisible(false);
    openNotificationsSheet();
  }, [openNotificationsSheet]);

  const shareInvite = useCallback(async () => {
    setIsMenuVisible(false);
    await Share.share({ message: getInviteMessage() });
  }, []);

  const navigateFromMenu = useCallback(
    (href: Href) => {
      setIsMenuVisible(false);
      router.push(href);
    },
    [router],
  );

  const primaryMenuItems = useMemo<MainSideMenuItem[]>(
    () => [
      {
        icon: 'wallet-outline',
        label: 'Manage accounts',
        onPress: () => navigateFromMenu(ROUTES.MANAGE_ACCOUNTS),
        subtitle: 'View balances and add or remove accounts',
      },
      {
        icon: 'people-outline',
        label: 'Manage friends',
        onPress: () => navigateFromMenu(ROUTES.MANAGE_FRIENDS),
        subtitle: 'Review friends, requests, and shared balances',
      },
      {
        icon: 'pricetags-outline',
        label: 'Manage categories',
        onPress: () => navigateFromMenu(ROUTES.MANAGE_CATEGORIES),
        subtitle: 'View, add, and remove transaction categories',
      },
      {
        icon: 'send-outline',
        label: 'Send app invite',
        onPress: shareInvite,
        subtitle: 'Invite people to join the app',
      },
      {
        icon: 'notifications-outline',
        label: 'Notifications',
        onPress: openNotifications,
        subtitle:
          notificationCount > 0
            ? `${notificationCount} friend request${
                notificationCount === 1 ? '' : 's'
              } waiting`
            : 'View recent alerts and updates',
      },
    ],
    [
      navigateFromMenu,
      notificationCount,
      openNotifications,
      shareInvite,
    ],
  );
  const secondaryMenuItems = useMemo<MainSideMenuItem[]>(
    () => [
      {
        icon: 'person-circle-outline',
        label: 'Profile',
        onPress: () => navigateFromMenu('/(main)/(tabs)/profile'),
        subtitle: 'Open your profile tab',
      },
      {
        icon: 'settings-outline',
        label: 'Settings',
        onPress: () => navigateFromMenu('/(main)/(tabs)/settings'),
        subtitle: 'Manage app preferences',
      },
      {
        icon: 'information-circle-outline',
        label: 'Information',
        onPress: () => navigateFromMenu('/(main)/(tabs)/information'),
        subtitle: 'App details and help',
      },
    ],
    [navigateFromMenu],
  );

  return {
    menuHeaderSubtitle: menuHeaderContent.subtitle,
    menuHeaderTitle: menuHeaderContent.title,
    isMenuVisible,
    notificationCount,
    notificationsModal: {
      acceptingFriendshipId,
      error: notificationsError,
      isLoading: isNotificationsLoading,
      isVisible: isNotificationsVisible,
      onAcceptRequest,
      onClose: closeNotifications,
      onRetry: retryNotifications,
      requests: incomingRequests,
    },
    onCloseMenu: () => setIsMenuVisible(false),
    onNotificationsPress: openNotifications,
    onOpenMenu: () => setIsMenuVisible(true),
    primaryMenuItems,
    secondaryMenuItems,
  };
};
