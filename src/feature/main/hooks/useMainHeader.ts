import { useRouter } from 'expo-router';
import type { Href } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';
import { Share } from 'react-native';

import { createAccount } from '@/feature/accounts/api/accounts.api';
import { useAccountsOverviewStore } from '@/feature/accounts/store/accountsOverview.store';
import {
  createFriendships,
  listFriendships,
} from '@/feature/friendships/api/friendships.api';
import useFriendshipNotifications from '@/feature/friendships/hooks/useFriendshipNotifications';
import { searchUsersByEmail } from '@/feature/groups/api/groups.api';
import type { GroupUser } from '@/feature/groups/types/group.types';
import type { MainHeaderViewProps, MainSideMenuItem } from '@/feature/main/types/mainHeader.types';
import { ApiError } from '@/services/api';
import { useAuthStore } from '@/store/auth.store';
import {
  fallbackCurrencies,
  getCurrencyById,
  moneyInputToCents,
} from '@/utils/currency';

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
  const accounts = useAccountsOverviewStore((state) => state.accounts);
  const currencies = useAccountsOverviewStore((state) => state.currencies);
  const selectedAccountId = useAccountsOverviewStore(
    (state) => state.selectedAccountId,
  );
  const setAccounts = useAccountsOverviewStore((state) => state.setAccounts);
  const setSelectedAccountId = useAccountsOverviewStore(
    (state) => state.setSelectedAccountId,
  );
  const token = useAuthStore((state) => state.token);
  const user = useAuthStore((state) => state.user);
  const [accountName, setAccountName] = useState('');
  const [accountBalance, setAccountBalance] = useState('');
  const [accountError, setAccountError] = useState('');
  const [existingFriendIds, setExistingFriendIds] = useState<number[]>([]);
  const [friendEmailQuery, setFriendEmailQuery] = useState('');
  const [friendError, setFriendError] = useState('');
  const [friendResults, setFriendResults] = useState<GroupUser[]>([]);
  const [isAddAccountVisible, setIsAddAccountVisible] = useState(false);
  const [isAddFriendVisible, setIsAddFriendVisible] = useState(false);
  const [isAddingFriend, setIsAddingFriend] = useState(false);
  const [isMenuVisible, setIsMenuVisible] = useState(false);
  const [isSavingAccount, setIsSavingAccount] = useState(false);
  const [isSearchingFriend, setIsSearchingFriend] = useState(false);
  const displayCurrencies = currencies.length > 0 ? currencies : fallbackCurrencies;
  const accountCurrency = getCurrencyById(
    user?.currency_id ?? accounts[0]?.currency_id,
    displayCurrencies,
  );
  const currentDateLabel = useMemo(() => getCurrentDateLabel(), []);
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

  const closeAddAccountModal = useCallback(() => {
    setAccountError('');
    setIsAddAccountVisible(false);
  }, []);

  const openAddAccountModal = useCallback(() => {
    setAccountName('');
    setAccountBalance('');
    setAccountError('');
    setIsMenuVisible(false);
    setIsAddAccountVisible(true);
  }, []);

  const handleCreateAccount = useCallback(async () => {
    if (!token) {
      setAccountError('Please sign in again to add an account.');
      return;
    }

    const trimmedName = accountName.trim();

    if (!trimmedName) {
      setAccountError('Enter an account name.');
      return;
    }

    setIsSavingAccount(true);
    setAccountError('');

    try {
      const openingBalanceCents = moneyInputToCents(accountBalance);
      const nextAccount = await createAccount(token, {
        currency_id: accountCurrency.id,
        current_balance_cents: openingBalanceCents,
        initial_balance_cents: openingBalanceCents,
        name: trimmedName,
      });

      setAccounts([...accounts, nextAccount]);

      if (!selectedAccountId) {
        setSelectedAccountId(nextAccount.id);
      }

      closeAddAccountModal();
    } catch (error) {
      setAccountError(
        error instanceof ApiError
          ? error.fieldErrors.base || error.message
          : 'Could not create this account.',
      );
    } finally {
      setIsSavingAccount(false);
    }
  }, [
    accountBalance,
    accountCurrency.id,
    accountName,
    accounts,
    closeAddAccountModal,
    selectedAccountId,
    setAccounts,
    setSelectedAccountId,
    token,
  ]);

  const closeAddFriendModal = useCallback(() => {
    setFriendError('');
    setIsAddFriendVisible(false);
  }, []);

  const openAddFriendModal = useCallback(async () => {
    setFriendEmailQuery('');
    setFriendError('');
    setFriendResults([]);
    setIsMenuVisible(false);
    setIsAddFriendVisible(true);

    if (!token) {
      return;
    }

    try {
      const friendships = await listFriendships(token);
      setExistingFriendIds(friendships.map((friendship) => friendship.friend.id));
    } catch {
      setExistingFriendIds([]);
    }
  }, [token]);

  const searchFriendByEmail = useCallback(async () => {
    if (!token) {
      setFriendError('Please sign in again to add a friend.');
      return;
    }

    const email = friendEmailQuery.trim();

    if (!email) {
      setFriendError('Enter an email address to search.');
      return;
    }

    setIsSearchingFriend(true);
    setFriendError('');
    setFriendResults([]);

    try {
      const users = await searchUsersByEmail(token, email);
      const nextResults = users.filter((item) => item.id !== user?.id);

      setFriendResults(nextResults);

      if (nextResults.length === 0) {
        setFriendError('No user found for that email.');
      }
    } catch (error) {
      setFriendError(
        error instanceof Error ? error.message : 'Could not search by email.',
      );
    } finally {
      setIsSearchingFriend(false);
    }
  }, [friendEmailQuery, token, user?.id]);

  const addFriend = useCallback(
    async (userId: number) => {
      if (!token) {
        setFriendError('Please sign in again to add a friend.');
        return;
      }

      setIsAddingFriend(true);
      setFriendError('');

      try {
        await createFriendships(token, [userId]);
        setExistingFriendIds((currentIds) =>
          currentIds.includes(userId) ? currentIds : [...currentIds, userId],
        );
        setFriendError('Friend request sent.');
      } catch (error) {
        setFriendError(
          error instanceof ApiError
            ? error.fieldErrors.base || error.message
            : 'Could not add this friend.',
        );
      } finally {
        setIsAddingFriend(false);
      }
    },
    [token],
  );

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
        label: 'Add new account',
        onPress: openAddAccountModal,
        subtitle: 'Create a wallet, bank, or cash account',
      },
      {
        icon: 'person-add-outline',
        label: 'Add friends',
        onPress: openAddFriendModal,
        subtitle: 'Search by email and send a request',
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
      notificationCount,
      openAddAccountModal,
      openAddFriendModal,
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
    addAccountModal: {
      accountName,
      balance: accountBalance,
      currencyCode: accountCurrency.code,
      error: accountError,
      isSaving: isSavingAccount,
      isVisible: isAddAccountVisible,
      onChangeAccountName: setAccountName,
      onChangeBalance: setAccountBalance,
      onClose: closeAddAccountModal,
      onSave: handleCreateAccount,
    },
    addFriendModal: {
      emailQuery: friendEmailQuery,
      error: friendError,
      existingFriendIds,
      isAdding: isAddingFriend,
      isSearching: isSearchingFriend,
      isVisible: isAddFriendVisible,
      onAddUser: addFriend,
      onChangeEmail: setFriendEmailQuery,
      onClose: closeAddFriendModal,
      onSearch: searchFriendByEmail,
      results: friendResults,
    },
    currentDateLabel,
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
