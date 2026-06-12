import { apiRequest } from '@/services/api';
import type { ApiTransaction } from '@/feature/transactions/types/transaction.types';
import type {
  Friendship,
  FriendshipDetail,
  FriendshipLedger,
  ListFriendshipsParams,
} from '@/feature/friendships/types/friendship.types';

type FriendshipLedgerResponse = FriendshipLedger & {
  balance?: FriendshipLedger['balance_summary'];
};

type FriendshipDetailResponse = Omit<FriendshipDetail, 'transactions'> & {
  balance?: FriendshipDetail['balance_summary'];
  transactions: ApiTransaction[];
};

const normalizeFriendshipLedger = (
  friendship: FriendshipLedgerResponse,
): FriendshipLedger => ({
  ...friendship,
  balance_summary:
    friendship.balance_summary ??
    friendship.balance ?? { amount_cents: 0, type: 'settled_up' },
});

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
    friendships: FriendshipLedgerResponse[];
  }>(endpoint, { token });

  return (result.data.friendships ?? []).map(normalizeFriendshipLedger);
};

export const getFriendship = async (token: string, friendshipId: number) => {
  const result = await apiRequest<{
    success: true;
    friendship: FriendshipDetailResponse;
  }>(`/api/v0/friendships/${friendshipId}`, { token });

  const raw = result.data.friendship;

  return {
    ...raw,
    balance_summary:
      raw.balance_summary ??
      raw.balance ?? { amount_cents: 0, type: 'settled_up' as const },
    group_balances: raw.group_balances ?? [],
    transactions: raw.transactions ?? [],
  } satisfies FriendshipDetail;
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

export const acceptFriendship = async (
  token: string,
  friendshipId: number,
) => {
  const result = await apiRequest<{
    success: true;
    friendship: FriendshipLedgerResponse;
  }>(`/api/v0/friendships/${friendshipId}`, {
    method: 'PATCH',
    token,
    body: { status: 'accepted' },
  });

  return normalizeFriendshipLedger(result.data.friendship);
};

export const deleteFriendship = async (
  token: string,
  friendshipId: number,
) => {
  await apiRequest<{ success: true }>(
    `/api/v0/friendships/${friendshipId}`,
    {
      method: 'DELETE',
      token,
    },
  );
};

export const rejectFriendship = async (
  token: string,
  friendshipId: number,
) => {
  await apiRequest<{ success: true }>(`/api/v0/friendships/${friendshipId}`, {
    method: 'PATCH',
    token,
    body: { status: 'rejected' },
  });
};

export const blockFriendship = async (
  token: string,
  friendshipId: number,
) => {
  await apiRequest<{ success: true; friendship: Friendship }>(
    `/api/v0/friendships/${friendshipId}`,
    {
      method: 'PATCH',
      token,
      body: { status: 'blocked' },
    },
  );
};
