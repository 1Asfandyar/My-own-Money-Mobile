import { useMemo } from 'react';

import type { Group, GroupUser } from '@/feature/groups/types/group.types';
import {
  getCurrentUserParticipant,
  getSelectedSharedFriends,
  getSharedUsersById,
  getSplitParticipants,
} from '@/feature/transactions/utils/addTransactionRecord.utils';
import type { AuthUser } from '@/types/auth.types';

type UseSharedExpenseParticipantsParams = {
  friends: GroupUser[];
  groups: Group[];
  selectedUserIds: number[];
  user: AuthUser | null;
};

const useSharedExpenseParticipants = ({
  friends,
  groups,
  selectedUserIds,
  user,
}: UseSharedExpenseParticipantsParams) => {
  const currentUserParticipant = useMemo(
    () => getCurrentUserParticipant(user),
    [user],
  );
  const sharedUsersById = useMemo(
    () =>
      getSharedUsersById({
        currentUserId: user?.id,
        friends,
        groups,
      }),
    [friends, groups, user?.id],
  );
  const selectedSharedFriends = useMemo(
    () => getSelectedSharedFriends(selectedUserIds, sharedUsersById),
    [selectedUserIds, sharedUsersById],
  );
  const splitParticipants = useMemo(
    () => getSplitParticipants(currentUserParticipant, selectedSharedFriends),
    [currentUserParticipant, selectedSharedFriends],
  );
  const splitParticipantIds = useMemo(
    () => splitParticipants.map((participant) => participant.id),
    [splitParticipants],
  );

  return {
    selectedSharedFriends,
    splitParticipantIds,
    splitParticipants,
  };
};

export default useSharedExpenseParticipants;
