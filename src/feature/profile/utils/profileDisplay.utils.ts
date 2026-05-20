import type { AuthUser } from '@/types/auth.types';

export const getProfileInitial = (name?: string) =>
  name?.trim().charAt(0).toUpperCase() || 'U';

export const getProfileImageUrl = (user: AuthUser | null) =>
  user?.avatar_url?.trim() ||
  user?.photo_url?.trim() ||
  user?.profile_photo_url?.trim() ||
  user?.profile_image_url?.trim() ||
  null;
