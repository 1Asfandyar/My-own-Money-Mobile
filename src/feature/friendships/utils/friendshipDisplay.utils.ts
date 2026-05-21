import type { GroupUser } from '@/feature/groups/types/group.types';
import type {
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

export const friendshipUserToGroupUser = (
  user: FriendshipUser,
): GroupUser => ({
  avatar_url: user.avatar_url,
  email: user.email,
  full_name: getFriendshipUserLabel(user),
  id: user.id,
  mobile_number: user.mobile_number,
  photo_url: user.photo_url,
  profile_image_url: user.profile_image_url,
  profile_photo_url: user.profile_photo_url,
});
