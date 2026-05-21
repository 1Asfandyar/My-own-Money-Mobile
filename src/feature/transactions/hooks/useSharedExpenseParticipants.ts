import { useMemo } from 'react';

import type { GroupUser } from '@/feature/groups/types/group.types';
import {
  getCurrentUserParticipant,
  getSelectedSharedFriends,
  getSplitParticipants,
} from '@/feature/transactions/utils/addTransactionRecord.utils';
import type { AuthUser } from '@/types/auth.types';

type UseSharedExpenseParticipantsParams = {
  friends: GroupUser[];
  selectedUserIds: number[];
  user: AuthUser | null;
};

const useSharedExpenseParticipants = ({
  friends,
  selectedUserIds,
  user,
}: UseSharedExpenseParticipantsParams) => {
  const currentUserParticipant = useMemo(
    () => getCurrentUserParticipant(user),
    [user],
  );
  const sharedUsersById = useMemo(
    () => new Map(friends.map((friend) => [friend.id, friend])),
    [friends],
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
