import { useRouter } from 'expo-router';
import { useCallback, useEffect, useMemo, useState } from 'react';

import { ROUTES } from '@/config/routes';
import { createGroup, listGroups } from '@/feature/groups/api/groups.api';
import type { Group, GroupUser } from '@/feature/groups/types/group.types';
import type { GroupsViewModel } from '@/feature/groups/types/groupsScreen.types';
import { getGroupUsers } from '@/feature/groups/utils/groupMembers.utils';
import { ApiError } from '@/services/api';
import { useAuthStore } from '@/store/auth.store';

const useGroups = (): GroupsViewModel => {
  const router = useRouter();
  const token = useAuthStore((state) => state.token);
  const user = useAuthStore((state) => state.user);
  const clearSession = useAuthStore((state) => state.clearSession);
  const [customGroups, setCustomGroups] = useState<Group[]>([]);
  const [friends, setFriends] = useState<GroupUser[]>([]);
  const [createError, setCreateError] = useState('');
  const [createGroupName, setCreateGroupName] = useState('');
  const [error, setError] = useState('');
  const [isCreateModalVisible, setIsCreateModalVisible] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedFriendIds, setSelectedFriendIds] = useState<number[]>([]);

  const isCreateDisabled = useMemo(
    () =>
      isCreating ||
      createGroupName.trim().length === 0 ||
      selectedFriendIds.length === 0,
    [createGroupName, isCreating, selectedFriendIds.length],
  );

  const redirectToLogin = useCallback(async () => {
    await clearSession();
    router.replace(ROUTES.AUTH_LOGIN);
  }, [clearSession, router]);

  const loadGroups = useCallback(async () => {
    if (!token) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const [nextCustomGroups, nextFriendGroups] = await Promise.all([
        listGroups(token, 'custom'),
        listGroups(token, 'friends'),
      ]);

      setCustomGroups(nextCustomGroups);
      setFriends(getGroupUsers(nextFriendGroups[0], user?.id));
    } catch (nextError) {
      if (nextError instanceof ApiError && nextError.status === 401) {
        await redirectToLogin();
        return;
      }

      setError(
        nextError instanceof Error
          ? nextError.message
          : 'Could not load groups.',
      );
    } finally {
      setIsLoading(false);
    }
  }, [redirectToLogin, token, user?.id]);

  useEffect(() => {
    void loadGroups();
  }, [loadGroups]);

  const openCreateModal = useCallback(() => {
    setCreateError('');
    setCreateGroupName('');
    setSelectedFriendIds([]);
    setIsCreateModalVisible(true);
  }, []);

  const closeCreateModal = useCallback(() => {
    setCreateError('');
    setIsCreateModalVisible(false);
  }, []);

  const toggleFriend = useCallback((userId: number) => {
    setSelectedFriendIds((currentIds) =>
      currentIds.includes(userId)
        ? currentIds.filter((currentId) => currentId !== userId)
        : [...currentIds, userId],
    );
    setCreateError('');
  }, []);

  const handleCreateGroup = useCallback(async () => {
    if (!token) {
      setCreateError('Please sign in again to create a group.');
      return;
    }

    const trimmedName = createGroupName.trim();

    if (!trimmedName) {
      setCreateError('Enter a group name.');
      return;
    }

    if (selectedFriendIds.length === 0) {
      setCreateError('Select at least one friend.');
      return;
    }

    setIsCreating(true);
    setCreateError('');

    try {
      await createGroup(token, {
        kind: 'custom',
        name: trimmedName,
        user_ids: selectedFriendIds,
      });

      await loadGroups();
      closeCreateModal();
    } catch (nextError) {
      if (nextError instanceof ApiError && nextError.status === 401) {
        await redirectToLogin();
        return;
      }

      setCreateError(
        nextError instanceof ApiError
          ? nextError.fieldErrors.base || nextError.message
          : 'Could not create this group.',
      );
    } finally {
      setIsCreating(false);
    }
  }, [
    closeCreateModal,
    createGroupName,
    loadGroups,
    redirectToLogin,
    selectedFriendIds,
    token,
  ]);

  return {
    createError,
    createGroupName,
    customGroups,
    error,
    friends,
    isCreateDisabled,
    isCreateModalVisible,
    isCreating,
    isLoading,
    onChangeCreateGroupName: setCreateGroupName,
    onCloseCreateModal: closeCreateModal,
    onCreateGroup: handleCreateGroup,
    onOpenCreateModal: openCreateModal,
    onRefresh: loadGroups,
    onToggleFriend: toggleFriend,
    selectedFriendIds,
  };
};

export default useGroups;
