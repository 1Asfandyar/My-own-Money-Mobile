import { useCallback } from 'react';

import { searchUsersByEmail } from '@/feature/groups/api/groups.api';
import {
  createFriendships,
  listFriendships,
} from '@/feature/friendships/api/friendships.api';
import { friendshipUserToGroupUser } from '@/feature/friendships/utils/friendshipDisplay.utils';
import { useAddTransactionRecordStore } from '@/feature/transactions/store/addTransactionRecord.store';
import { ApiError } from '@/services/api';

type UseSharedExpenseFriendsParams = {
  currentUserId?: number | null;
  onSelectionChange: (userIds: number[]) => void;
  selectedUserIds: number[];
  token: string | null;
};

const useSharedExpenseFriends = ({
  currentUserId,
  onSelectionChange,
  selectedUserIds,
  token,
}: UseSharedExpenseFriendsParams) => {
  const closeAddFriendModal = useAddTransactionRecordStore(
    (state) => state.closeAddFriendModal,
  );
  const friendEmailQuery = useAddTransactionRecordStore(
    (state) => state.friendEmailQuery,
  );
  const friendSearchError = useAddTransactionRecordStore(
    (state) => state.friendSearchError,
  );
  const friendSearchResults = useAddTransactionRecordStore(
    (state) => state.friendSearchResults,
  );
  const friends = useAddTransactionRecordStore((state) => state.friends);
  const isAddFriendModalVisible = useAddTransactionRecordStore(
    (state) => state.isAddFriendModalVisible,
  );
  const isAddingFriend = useAddTransactionRecordStore(
    (state) => state.isAddingFriend,
  );
  const isSearchingFriend = useAddTransactionRecordStore(
    (state) => state.isSearchingFriend,
  );
  const openAddFriendModal = useAddTransactionRecordStore(
    (state) => state.openAddFriendModal,
  );
  const setFriendEmailQuery = useAddTransactionRecordStore(
    (state) => state.setFriendEmailQuery,
  );
  const setFriendSearchError = useAddTransactionRecordStore(
    (state) => state.setFriendSearchError,
  );
  const setFriendSearchResults = useAddTransactionRecordStore(
    (state) => state.setFriendSearchResults,
  );
  const setFriends = useAddTransactionRecordStore((state) => state.setFriends);
  const setIsAddingFriend = useAddTransactionRecordStore(
    (state) => state.setIsAddingFriend,
  );
  const setIsSearchingFriend = useAddTransactionRecordStore(
    (state) => state.setIsSearchingFriend,
  );

  const loadFriends = useCallback(async () => {
    if (!token) {
      return;
    }

    const friendships = await listFriendships(token);
    const nextFriends = friendships
      .map((friendship) => friendshipUserToGroupUser(friendship.friend))
      .filter((friend) => friend.id !== currentUserId)
      .sort((first, second) =>
        (first.full_name ?? '').localeCompare(second.full_name ?? ''),
      );

    setFriends(nextFriends);
  }, [currentUserId, setFriends, token]);

  const toggleSharedUser = useCallback(
    (userId: number) => {
      const nextSharedUserIds = selectedUserIds.includes(userId)
        ? selectedUserIds.filter((selectedUserId) => selectedUserId !== userId)
        : [...selectedUserIds, userId];

      onSelectionChange(nextSharedUserIds);
    },
    [onSelectionChange, selectedUserIds],
  );

  const searchFriendByEmail = useCallback(async () => {
    if (!token) {
      setFriendSearchError('Please sign in again to add a friend.');
      return;
    }

    const email = friendEmailQuery.trim();

    if (!email) {
      setFriendSearchError('Enter an email address to search.');
      return;
    }

    setIsSearchingFriend(true);
    setFriendSearchError('');
    setFriendSearchResults([]);

    try {
      const users = await searchUsersByEmail(token, email);
      const usersById = new Map(
        users
          .filter((searchUser) => searchUser.id !== currentUserId)
          .map((searchUser) => [searchUser.id, searchUser]),
      );
      const nextResults = Array.from(usersById.values());

      setFriendSearchResults(nextResults);

      if (nextResults.length === 0) {
        setFriendSearchError('No user found for that email.');
      }
    } catch (error) {
      setFriendSearchError(
        error instanceof Error ? error.message : 'Could not search by email.',
      );
    } finally {
      setIsSearchingFriend(false);
    }
  }, [
    currentUserId,
    friendEmailQuery,
    setFriendSearchError,
    setFriendSearchResults,
    setIsSearchingFriend,
    token,
  ]);

  const addFriend = useCallback(
    async (friendUserId: number) => {
      if (!token) {
        setFriendSearchError('Please sign in again to add a friend.');
        return;
      }

      setIsAddingFriend(true);
      setFriendSearchError('');

      try {
        await createFriendships(token, [friendUserId]);
        await loadFriends();

        const isAcceptedFriend = friends.some(
          (friend) => friend.id === friendUserId,
        );

        if (isAcceptedFriend && !selectedUserIds.includes(friendUserId)) {
          onSelectionChange([...selectedUserIds, friendUserId]);
        }

        closeAddFriendModal();
      } catch (error) {
        setFriendSearchError(
          error instanceof ApiError
            ? error.fieldErrors.base || error.message
            : 'Could not add this friend.',
        );
      } finally {
        setIsAddingFriend(false);
      }
    },
    [
      closeAddFriendModal,
      friends,
      loadFriends,
      onSelectionChange,
      selectedUserIds,
      setFriendSearchError,
      setIsAddingFriend,
      token,
    ],
  );

  return {
    addFriend,
    closeAddFriendModal,
    friendEmailQuery,
    friendSearchError,
    friendSearchResults,
    friends,
    isAddFriendModalVisible,
    isAddingFriend,
    isSearchingFriend,
    loadFriends,
    openAddFriendModal,
    searchFriendByEmail,
    setFriendEmailQuery,
    toggleSharedUser,
  };
};

export default useSharedExpenseFriends;
