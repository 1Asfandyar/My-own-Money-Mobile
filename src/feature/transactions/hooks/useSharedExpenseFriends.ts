import { useCallback } from 'react';

import {
  addGroupMembers,
  listGroups,
  searchUsersByEmail,
} from '@/feature/groups/api/groups.api';
import type { Group } from '@/feature/groups/types/group.types';
import { getGroupUsers } from '@/feature/groups/utils/groupMembers.utils';
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
  const friendsGroup = useAddTransactionRecordStore(
    (state) => state.friendsGroup,
  );
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
  const setFriendsGroup = useAddTransactionRecordStore(
    (state) => state.setFriendsGroup,
  );
  const setIsAddingFriend = useAddTransactionRecordStore(
    (state) => state.setIsAddingFriend,
  );
  const setIsSearchingFriend = useAddTransactionRecordStore(
    (state) => state.setIsSearchingFriend,
  );

  const applyFriendsGroup = useCallback(
    (groups: Group[]) => {
      const nextFriendsGroup = groups[0] ?? null;

      setFriendsGroup(nextFriendsGroup);
      setFriends(getGroupUsers(nextFriendsGroup, currentUserId));
    },
    [currentUserId, setFriends, setFriendsGroup],
  );

  const loadFriendsGroup = useCallback(async () => {
    if (!token) {
      return;
    }

    const groups = await listGroups(token, 'friends');
    applyFriendsGroup(groups);
  }, [applyFriendsGroup, token]);

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

      if (!friendsGroup?.id) {
        setFriendSearchError('Your friends group is not available yet.');
        return;
      }

      setIsAddingFriend(true);
      setFriendSearchError('');

      try {
        await addGroupMembers(token, friendsGroup.id, [friendUserId]);

        if (!selectedUserIds.includes(friendUserId)) {
          onSelectionChange([...selectedUserIds, friendUserId]);
        }

        await loadFriendsGroup();
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
      friendsGroup?.id,
      loadFriendsGroup,
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
    friendsGroupId: friendsGroup?.id ?? null,
    isAddFriendModalVisible,
    isAddingFriend,
    isSearchingFriend,
    loadFriendsGroup,
    openAddFriendModal,
    searchFriendByEmail,
    setFriendEmailQuery,
    toggleSharedUser,
  };
};

export default useSharedExpenseFriends;
