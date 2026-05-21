import type { GroupUser } from '@/feature/groups/types/group.types';
import type {
  FriendshipActivityImpactType,
  FriendshipBalanceType,
  FriendshipUser,
} from '@/feature/friendships/types/friendship.types';
import { themeColors } from '@/theme/utilities';

export const debtColor = '#DC2626';

export const getFriendshipUserLabel = (user: FriendshipUser) =>
  user.full_name?.trim() || user.email?.trim() || `User #${user.id}`;

export const getFriendshipBalanceLabel = (type: FriendshipBalanceType) => {
  if (type === 'owes_you') return 'Owes you';
  if (type === 'you_owe') return 'You owe';

  return 'Settled up';
};

export const getFriendshipBalanceColor = (type: FriendshipBalanceType) => {
  if (type === 'owes_you') return themeColors.primary;
  if (type === 'you_owe') return debtColor;

  return themeColors.gray500;
};

export const getFriendshipBalanceSoftColor = (type: FriendshipBalanceType) => {
  if (type === 'owes_you') return '#EAF7F3';
  if (type === 'you_owe') return '#FEE2E2';

  return themeColors.gray100;
};

export const getFriendshipActivityImpactLabel = (
  type: FriendshipActivityImpactType,
) => {
  if (type === 'you_lent') return 'You lent';
  if (type === 'you_borrowed') return 'You borrowed';

  return 'No balance impact';
};

export const getFriendshipActivityImpactColor = (
  type: FriendshipActivityImpactType,
) => {
  if (type === 'you_lent') return themeColors.primary;
  if (type === 'you_borrowed') return debtColor;

  return themeColors.gray500;
};

export const getFriendshipDateLabel = (value: string) => {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return 'No date';

  return date.toLocaleDateString(undefined, {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
};

export const friendshipUserToGroupUser = (
  user: FriendshipUser,
): GroupUser => ({
  email: user.email,
  full_name: getFriendshipUserLabel(user),
  id: user.id,
  mobile_number: user.mobile_number,
});
