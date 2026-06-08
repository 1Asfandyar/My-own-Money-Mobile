import { useCallback } from 'react';

import { getGroup, listGroups } from '@/feature/groups/api/groups.api';
import type { Group } from '@/feature/groups/types/group.types';
import { useAddTransactionRecordStore } from '@/feature/transactions/store/addTransactionRecord.store';

type UseSharedExpenseGroupsParams = {
  token: string | null;
};

const sortGroupsByName = (groups: Group[]) =>
  [...groups].sort((first, second) =>
    (first.name?.trim() || 'Group').localeCompare(
      second.name?.trim() || 'Group',
    ),
  );

const hasLoadedMembers = (group: Group | null | undefined) =>
  Array.isArray(group?.members) && group.members.length > 0;

const useSharedExpenseGroups = ({ token }: UseSharedExpenseGroupsParams) => {
  const groups = useAddTransactionRecordStore((state) => state.groups);
  const setGroups = useAddTransactionRecordStore((state) => state.setGroups);

  const loadGroups = useCallback(async () => {
    if (!token) {
      return;
    }

    const nextGroups = await listGroups(token);
    setGroups(sortGroupsByName(nextGroups));
  }, [setGroups, token]);

  const resolveGroup = useCallback(
    async (groupId: number) => {
      const existingGroup = groups.find((group) => group.id === groupId) ?? null;

      if (hasLoadedMembers(existingGroup)) {
        return existingGroup;
      }

      if (!token) {
        return existingGroup;
      }

      const nextGroup = await getGroup(token, groupId);

      if (!nextGroup) {
        return existingGroup;
      }

      setGroups(
        sortGroupsByName([
          ...groups.filter((group) => group.id !== nextGroup.id),
          nextGroup,
        ]),
      );

      return nextGroup;
    },
    [groups, setGroups, token],
  );

  return {
    groups,
    loadGroups,
    resolveGroup,
  };
};

export default useSharedExpenseGroups;
