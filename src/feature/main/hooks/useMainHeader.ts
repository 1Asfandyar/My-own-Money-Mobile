import type { Href } from 'expo-router';
import { usePathname, useRouter } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';
import { Share } from 'react-native';

import { ROUTES } from '@/config/routes';
import useFriendshipNotifications from '@/feature/friendships/hooks/useFriendshipNotifications';
import type {
    MainHeaderViewProps,
    MainSideMenuItem,
} from '@/feature/main/types/mainHeader.types';
import { getMainHeaderScreenTitle } from '@/feature/main/utils/mainLayout.utils';

const inviteMessage =
  'Join me on My Own Money to track expenses, groups, and shared balances together.';

const getCurrentDateLabel = () =>
  new Intl.DateTimeFormat(undefined, {
    day: 'numeric',
    month: 'long',
    weekday: 'long',
  }).format(new Date());

export const useMainHeader = (): MainHeaderViewProps => {
  const router = useRouter();
  const pathname = usePathname();
  const [isMenuVisible, setIsMenuVisible] = useState(false);
  const currentDateLabel = useMemo(() => getCurrentDateLabel(), []);
  const screenTitle = useMemo(
    () => getMainHeaderScreenTitle(pathname),
    [pathname],
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
    await Share.share({ message: inviteMessage });
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
    currentDateLabel,
    isMenuVisible,
    notificationCount,
    screenTitle,
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
