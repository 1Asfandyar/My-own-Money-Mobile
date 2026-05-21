import { useRouter } from 'expo-router';
import { useCallback, useEffect, useMemo, useState } from 'react';

import { ROUTES } from '@/config/routes';
import {
  addGroupMembers,
  getGroup,
  listGroups,
  removeGroupMember,
  updateGroup,
} from '@/feature/groups/api/groups.api';
import type { Group, GroupUser } from '@/feature/groups/types/group.types';
import type { GroupDetailViewModel } from '@/feature/groups/types/groupDetail.types';
import { getGroupUsers } from '@/feature/groups/utils/groupMembers.utils';
import { ApiError } from '@/services/api';
import { useAuthStore } from '@/store/auth.store';

const mergeUsersById = (...userLists: GroupUser[][]) => {
  const usersById = new Map<number, GroupUser>();

  userLists.forEach((users) => {
    users.forEach((user) => {
      usersById.set(user.id, user);
    });
  });

  return Array.from(usersById.values()).sort((first, second) =>
    (first.full_name ?? first.email ?? '').localeCompare(
      second.full_name ?? second.email ?? '',
    ),
  );
};

const useGroupDetail = (
  groupId: number | null,
  onBack: () => void,
): GroupDetailViewModel => {
  const router = useRouter();
  const token = useAuthStore((state) => state.token);
  const user = useAuthStore((state) => state.user);
  const clearSession = useAuthStore((state) => state.clearSession);
  const [editError, setEditError] = useState('');
  const [editGroupName, setEditGroupName] = useState('');
  const [editSelectedFriendIds, setEditSelectedFriendIds] = useState<number[]>(
    [],
  );
  const [error, setError] = useState('');
  const [friends, setFriends] = useState<GroupUser[]>([]);
  const [group, setGroup] = useState<Group | null>(null);
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const members = useMemo(() => getGroupUsers(group), [group]);
  const editableMembers = useMemo(
    () => getGroupUsers(group, user?.id),
    [group, user?.id],
  );
  const editFriends = useMemo(
    () => mergeUsersById(friends, editableMembers),
    [editableMembers, friends],
  );
  const isEditDisabled = useMemo(
    () =>
      isSaving ||
      editGroupName.trim().length === 0 ||
      editSelectedFriendIds.length === 0,
    [editGroupName, editSelectedFriendIds.length, isSaving],
  );

  const redirectToLogin = useCallback(async () => {
    await clearSession();
    router.replace(ROUTES.AUTH_LOGIN);
  }, [clearSession, router]);

  const loadGroup = useCallback(async () => {
    if (!token || !groupId) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const [nextGroup, friendGroups] = await Promise.all([
        getGroup(token, groupId),
        listGroups(token, 'friends'),
      ]);

      if (!nextGroup) {
        setError('Could not find this group.');
        setGroup(null);
        return;
      }

      setGroup(nextGroup);
      setFriends(getGroupUsers(friendGroups[0], user?.id));
    } catch (nextError) {
      if (nextError instanceof ApiError && nextError.status === 401) {
        await redirectToLogin();
        return;
      }

      setError(
        nextError instanceof Error
          ? nextError.message
          : 'Could not load this group.',
      );
    } finally {
      setIsLoading(false);
    }
  }, [groupId, redirectToLogin, token, user?.id]);

  useEffect(() => {
    void loadGroup();
  }, [loadGroup]);

  const openEditModal = useCallback(() => {
    setEditError('');
    setEditGroupName(group?.name?.trim() || '');
    setEditSelectedFriendIds(editableMembers.map((member) => member.id));
    setIsEditModalVisible(true);
  }, [editableMembers, group?.name]);

  const closeEditModal = useCallback(() => {
    if (isSaving) {
      return;
    }

    setEditError('');
    setIsEditModalVisible(false);
  }, [isSaving]);

  const toggleEditFriend = useCallback((userId: number) => {
    setEditSelectedFriendIds((currentIds) =>
      currentIds.includes(userId)
        ? currentIds.filter((currentId) => currentId !== userId)
        : [...currentIds, userId],
    );
    setEditError('');
  }, []);

  const saveGroup = useCallback(async () => {
    if (!token || !group?.id) {
      setEditError('Please sign in again to edit this group.');
      return;
    }

    const trimmedName = editGroupName.trim();

    if (!trimmedName) {
      setEditError('Enter a group name.');
      return;
    }

    if (editSelectedFriendIds.length === 0) {
      setEditError('Select at least one friend.');
      return;
    }

    const currentFriendIds = editableMembers.map((member) => member.id);
    const nextFriendIds = [...new Set(editSelectedFriendIds)];
    const addedFriendIds = nextFriendIds.filter(
      (userId) => !currentFriendIds.includes(userId),
    );
    const removedFriendIds = currentFriendIds.filter(
      (userId) => !nextFriendIds.includes(userId),
    );

    setIsSaving(true);
    setEditError('');

    try {
      await updateGroup(token, group.id, { name: trimmedName });

      if (addedFriendIds.length > 0) {
        await addGroupMembers(token, group.id, addedFriendIds);
      }

      if (removedFriendIds.length > 0) {
        await Promise.all(
          removedFriendIds.map((userId) =>
            removeGroupMember(token, group.id, userId),
          ),
        );
      }

      await loadGroup();
      setIsEditModalVisible(false);
    } catch (nextError) {
      if (nextError instanceof ApiError && nextError.status === 401) {
        await redirectToLogin();
        return;
      }

      setEditError(
        nextError instanceof ApiError
          ? nextError.fieldErrors.base || nextError.message
          : 'Could not save this group.',
      );
    } finally {
      setIsSaving(false);
    }
  }, [
    editGroupName,
    editSelectedFriendIds,
    editableMembers,
    group?.id,
    loadGroup,
    redirectToLogin,
    token,
  ]);

  return {
    currentUserId: user?.id,
    editError,
    editFriends,
    editGroupName,
    editSelectedFriendIds,
    error,
    group,
    isEditDisabled,
    isEditModalVisible,
    isLoading,
    isSaving,
    members,
    onBack,
    onChangeEditGroupName: setEditGroupName,
    onCloseEditModal: closeEditModal,
    onOpenEditModal: openEditModal,
    onRefresh: loadGroup,
    onSaveGroup: saveGroup,
    onToggleEditFriend: toggleEditFriend,
  };
};

export default useGroupDetail;
