import type {
  Group,
  GroupMember,
  GroupUser,
} from '@/feature/groups/types/group.types';

const isPresentNumber = (value: unknown): value is number =>
  typeof value === 'number' && Number.isFinite(value);

const getDisplayName = (user: GroupUser) =>
  user.full_name?.trim() || user.email?.trim() || `User #${user.id}`;

export const getUserAvatarUrl = (user: GroupUser) =>
  user.profile_photo_url?.trim() ||
  user.profile_image_url?.trim() ||
  user.avatar_url?.trim() ||
  user.photo_url?.trim() ||
  null;

export const getGroupMemberUser = (member: GroupMember): GroupUser | null => {
  const nestedUser = member.user ?? null;
  const userId =
    (nestedUser && isPresentNumber(nestedUser.id) ? nestedUser.id : null) ??
    (isPresentNumber(member.user_id) ? member.user_id : null) ??
    (isPresentNumber(member.id) ? member.id : null);

  if (!isPresentNumber(userId)) {
    return null;
  }

  const email = nestedUser?.email ?? member.email ?? null;
  const fullName = nestedUser?.full_name ?? member.full_name ?? null;
  const mobileNumber = nestedUser?.mobile_number ?? member.mobile_number ?? null;
  const profilePhotoUrl =
    nestedUser?.profile_photo_url ?? member.profile_photo_url ?? null;
  const profileImageUrl =
    nestedUser?.profile_image_url ?? member.profile_image_url ?? null;
  const avatarUrl = nestedUser?.avatar_url ?? member.avatar_url ?? null;
  const photoUrl = nestedUser?.photo_url ?? member.photo_url ?? null;

  return {
    avatar_url: avatarUrl,
    email,
    full_name: fullName,
    id: userId,
    mobile_number: mobileNumber,
    photo_url: photoUrl,
    profile_image_url: profileImageUrl,
    profile_photo_url: profilePhotoUrl,
  };
};

export const getGroupUsers = (
  group: Group | null | undefined,
  currentUserId?: number | null,
) => {
  const usersById = new Map<number, GroupUser>();

  group?.members?.forEach((member) => {
    const user = getGroupMemberUser(member);

    if (!user || user.id === currentUserId) {
      return;
    }

    usersById.set(user.id, {
      ...user,
      full_name: getDisplayName(user),
    });
  });

  return Array.from(usersById.values()).sort((first, second) =>
    getDisplayName(first).localeCompare(getDisplayName(second)),
  );
};

export const getUserLabel = (user: GroupUser) => getDisplayName(user);

export const getUserInitial = (user: GroupUser) =>
  getDisplayName(user).charAt(0).toUpperCase();
