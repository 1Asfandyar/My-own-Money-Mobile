import { apiRequest } from '@/services/api';
import type {
  AddGroupMembersResponse,
  CreateGroupPayload,
  CreateGroupResponse,
  GetGroupResponse,
  Group,
  GroupDetailResult,
  GroupMember,
  GroupUser,
  ListGroupsResponse,
  RemoveGroupMemberResponse,
  SearchUsersByEmailResponse,
  UpdateGroupPayload,
  UpdateGroupResponse,
} from '@/feature/groups/types/group.types';

const getUsersFromSearchResponse = (data: SearchUsersByEmailResponse) => {
  if (Array.isArray(data)) {
    return data;
  }

  if (Array.isArray(data.users)) {
    return data.users;
  }

  return data.user ? [data.user] : [];
};

const getGroupsFromResponse = (data: ListGroupsResponse) =>
  Array.isArray(data) ? data : data.groups ?? [];

const isGroup = (
  value: CreateGroupResponse | GetGroupResponse | UpdateGroupResponse,
): value is Group =>
  'id' in value && typeof value.id === 'number';

const getGroupFromResponse = (
  data: CreateGroupResponse | GetGroupResponse | UpdateGroupResponse,
): Group | null =>
  isGroup(data) ? data : data.group ?? null;

export const listGroups = async (token: string) => {
  const result = await apiRequest<ListGroupsResponse>('/api/v0/groups', {
    token,
  });

  return getGroupsFromResponse(result.data);
};

export const addGroupMembers = async (
  token: string,
  groupId: number,
  userIds: number[],
) => {
  const result = await apiRequest<AddGroupMembersResponse>(
    `/api/v0/groups/${groupId}/members`,
    {
      method: 'POST',
      token,
      body: { user_ids: userIds },
    },
  );

  return result.data.group ?? null;
};

export const removeGroupMember = async (
  token: string,
  groupId: number,
  userId: number,
) => {
  const result = await apiRequest<RemoveGroupMemberResponse>(
    `/api/v0/groups/${groupId}/members/${userId}`,
    {
      method: 'DELETE',
      token,
    },
  );

  return result.data.group ?? null;
};

export const createGroup = async (
  token: string,
  payload: CreateGroupPayload,
) => {
  const result = await apiRequest<CreateGroupResponse>('/api/v0/groups', {
    method: 'POST',
    token,
    body: payload,
  });

  return getGroupFromResponse(result.data);
};

export const getGroup = async (
  token: string,
  groupId: number,
): Promise<GroupDetailResult | null> => {
  const result = await apiRequest<GetGroupResponse>(`/api/v0/groups/${groupId}`, {
    token,
  });

  const apiGroup = result.data.group;

  if (!apiGroup) return null;

  const members: GroupMember[] = apiGroup.members.map((m) => ({
    id: m.id,
    full_name: m.full_name,
    email: m.email,
    mobile_number: m.mobile_number,
  }));

  return {
    group: { id: apiGroup.id, name: apiGroup.name, members },
    transactions: apiGroup.transactions ?? [],
  };
};

export const updateGroup = async (
  token: string,
  groupId: number,
  payload: UpdateGroupPayload,
) => {
  const result = await apiRequest<UpdateGroupResponse>(
    `/api/v0/groups/${groupId}`,
    {
      method: 'PATCH',
      token,
      body: payload,
    },
  );

  return getGroupFromResponse(result.data);
};

export const searchUsersByEmail = async (token: string, email: string) => {
  const query = new URLSearchParams({ email: email.trim() });
  const result = await apiRequest<SearchUsersByEmailResponse>(
    `/api/v0/users?${query.toString()}`,
    { token },
  );

  return getUsersFromSearchResponse(result.data).filter(
    (user): user is GroupUser => typeof user.id === 'number',
  );
};

export type { Group };
