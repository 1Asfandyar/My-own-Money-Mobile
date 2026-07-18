import { useRouter } from 'expo-router';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Alert } from 'react-native';

import { ROUTES } from '@/config/routes';
import { useAccountsOverviewStore } from '@/feature/accounts/store/accountsOverview.store';
import {
  blockFriendship,
  createFriendships,
  deleteFriendship,
  listFriendships,
  rejectFriendship,
} from '@/feature/friendships/api/friendships.api';
import type {
  FriendshipLedger,
  ManageFriendsViewModel,
} from '@/feature/friendships/types/friendship.types';
import {
  getFriendshipManagementAction,
  getFriendshipUserLabel,
} from '@/feature/friendships/utils/friendshipDisplay.utils';
import { searchUsersByEmail } from '@/feature/groups/api/groups.api';
import type { GroupUser } from '@/feature/groups/types/group.types';
import { ApiError } from '@/services/api';
import { useAuthStore } from '@/store/auth.store';
import { useServerDataInvalidationStore } from '@/store/serverDataInvalidation.store';
import { getRequestError } from '@/utils/errors';

const useManageFriends = (): ManageFriendsViewModel => {
  const router = useRouter();
  const token = useAuthStore((state) => state.token);
  const user = useAuthStore((state) => state.user);
  const clearSession = useAuthStore((state) => state.clearSession);
  const friendshipDataVersion = useServerDataInvalidationStore(
    (state) => state.friendships,
  );
  const setStoredFriendships = useAccountsOverviewStore(
    (state) => state.setFriendshipLedgers,
  );
  const [friendships, setFriendships] = useState<FriendshipLedger[]>([]);
  const [emailQuery, setEmailQuery] = useState('');
  const [error, setError] = useState('');
  const [friendError, setFriendError] = useState('');
  const [isAddModalVisible, setIsAddModalVisible] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSearching, setIsSearching] = useState(false);
  const [updatingFriendshipId, setUpdatingFriendshipId] = useState<number | null>(
    null,
  );
  const [results, setResults] = useState<GroupUser[]>([]);
  const existingFriendIds = useMemo(
    () => friendships.map((friendship) => friendship.friend.id),
    [friendships],
  );

  const redirectToLogin = useCallback(async () => {
    await clearSession();
    router.replace(ROUTES.AUTH_LOGIN);
  }, [clearSession, router]);

  const loadFriendships = useCallback(async () => {
    if (!token) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const [acceptedFriendships, pendingFriendships, blockedFriendships] =
        await Promise.all([
          listFriendships(token),
          listFriendships(token, { status: 'pending' }),
          listFriendships(token, { status: 'blocked' }),
        ]);
      const nextFriendships = Array.from(
        new Map(
          [
            ...acceptedFriendships,
            ...pendingFriendships,
            ...blockedFriendships,
          ].map((friendship) => [friendship.id, friendship]),
        ).values(),
      ).sort((first, second) => {
        const statusOrder = { accepted: 0, pending: 1, blocked: 2 };

        return (
          statusOrder[first.status] - statusOrder[second.status] ||
          getFriendshipUserLabel(first.friend).localeCompare(
            getFriendshipUserLabel(second.friend),
          )
        );
      });

      setFriendships(nextFriendships);
      setStoredFriendships(acceptedFriendships);
    } catch (requestError) {
      if (requestError instanceof ApiError && requestError.status === 401) {
        await redirectToLogin();
        return;
      }

      setError(getRequestError(requestError, 'Could not load friends.'));
    } finally {
      setIsLoading(false);
    }
  }, [redirectToLogin, setStoredFriendships, token]);

  useEffect(() => {
    void loadFriendships();
  }, [friendshipDataVersion, loadFriendships]);

  const openAddModal = useCallback(() => {
    setEmailQuery('');
    setFriendError('');
    setResults([]);
    setIsAddModalVisible(true);
  }, []);

  const closeAddModal = useCallback(() => {
    if (!isAdding && !isSearching) {
      setFriendError('');
      setIsAddModalVisible(false);
    }
  }, [isAdding, isSearching]);

  const searchByEmail = useCallback(async () => {
    if (!token) {
      setFriendError('Please sign in again to add a friend.');
      return;
    }

    const email = emailQuery.trim();

    if (!email) {
      setFriendError('Enter an email address to search.');
      return;
    }

    setIsSearching(true);
    setFriendError('');
    setResults([]);

    try {
      const users = await searchUsersByEmail(token, email);
      const nextResults = users.filter((item) => item.id !== user?.id);

      setResults(nextResults);

      if (nextResults.length === 0) {
        setFriendError('No user found for that email.');
      }
    } catch (requestError) {
      setFriendError(getRequestError(requestError, 'Could not search by email.'));
    } finally {
      setIsSearching(false);
    }
  }, [emailQuery, token, user?.id]);

  const addFriend = useCallback(
    async (friendUserId: number) => {
      if (!token) {
        setFriendError('Please sign in again to add a friend.');
        return;
      }

      setIsAdding(true);
      setFriendError('');

      try {
        await createFriendships(token, [friendUserId]);
        await loadFriendships();
        setIsAddModalVisible(false);
      } catch (requestError) {
        setFriendError(
          getRequestError(requestError, 'Could not send this friend request.'),
        );
      } finally {
        setIsAdding(false);
      }
    },
    [loadFriendships, token],
  );

  const handleFriendshipAction = useCallback(
    (friendship: FriendshipLedger) => {
      const friendName = getFriendshipUserLabel(friendship.friend);
      const action = getFriendshipManagementAction(friendship, user?.id);

      if (!action) {
        return;
      }

      const title =
        action === 'cancel'
          ? 'Cancel friend request?'
          : action === 'reject'
            ? 'Decline friend request?'
            : 'Block friend?';
      const message =
        action === 'cancel'
          ? `This will cancel your friend request to ${friendName}.`
          : action === 'reject'
            ? `This will decline the friend request from ${friendName}.`
            : `${friendName} will be removed from your accepted friends and blocked.`;
      const confirmLabel =
        action === 'cancel'
          ? 'Cancel request'
          : action === 'reject'
            ? 'Decline'
            : 'Block';

      Alert.alert(
        title,
        message,
        [
          { style: 'cancel', text: 'Cancel' },
          {
            style: 'destructive',
            text: confirmLabel,
            onPress: async () => {
              if (!token) {
                setError('Please sign in again to update this friendship.');
                return;
              }

              setUpdatingFriendshipId(friendship.id);
              setError('');

              try {
                if (action === 'cancel') {
                  await deleteFriendship(token, friendship.id);
                } else if (action === 'reject') {
                  await rejectFriendship(token, friendship.id);
                } else {
                  await blockFriendship(token, friendship.id);
                }

                await loadFriendships();
              } catch (requestError) {
                setError(
                  getRequestError(
                    requestError,
                    'Could not update this friendship.',
                  ),
                );
              } finally {
                setUpdatingFriendshipId(null);
              }
            },
          },
        ],
      );
    },
    [loadFriendships, token, user?.id],
  );

  return {
    addFriend: (userId) => void addFriend(userId),
    closeAddModal,
    emailQuery,
    error,
    existingFriendIds,
    friendError,
    friendships,
    isAddModalVisible,
    isAdding,
    isLoading,
    isSearching,
    onBack: () => router.back(),
    onFriendshipAction: handleFriendshipAction,
    onOpenAddModal: openAddModal,
    onRefresh: () => void loadFriendships(),
    results,
    searchByEmail: () => void searchByEmail(),
    setEmailQuery,
    updatingFriendshipId,
    userId: user?.id,
  };
};

export default useManageFriends;
