import { apiRequest } from '@/services/api';
import type {
  Friendship,
  FriendshipLedger,
  ListFriendshipsParams,
} from '@/feature/friendships/types/friendship.types';

export const listFriendships = async (
  token: string,
  params: ListFriendshipsParams = {},
) => {
  const query = new URLSearchParams();

  if (params.filter) {
    query.set('filter', params.filter);
  }

  if (params.status) {
    query.set('status', params.status);
  }

  const endpoint = query.toString()
    ? `/api/v0/friendships?${query.toString()}`
    : '/api/v0/friendships';
  const result = await apiRequest<{
    success: true;
    friendships: Friendship[];
  }>(endpoint, { token });

  return result.data.friendships ?? [];
};

export const getFriendshipLedger = async (
  token: string,
  friendshipId: number,
) => {
  const result = await apiRequest<{
    success: true;
    friendship: FriendshipLedger;
  }>(`/api/v0/friendships/${friendshipId}`, { token });

  return result.data.friendship;
};

export const createFriendships = async (
  token: string,
  userIds: number[],
) => {
  const result = await apiRequest<{
    success: true;
    friendships: Friendship[];
  }>('/api/v0/friendships', {
    method: 'POST',
    token,
    body: { user_ids: userIds },
  });

  return result.data.friendships ?? [];
};
