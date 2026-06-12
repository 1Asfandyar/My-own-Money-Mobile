import type { ApiTransaction } from '@/feature/transactions/types/transaction.types';

export type GroupUser = {
  avatar_url?: string | null;
  email?: string | null;
  full_name?: string | null;
  id: number;
  mobile_number?: string | null;
  photo_url?: string | null;
  profile_image_url?: string | null;
  profile_photo_url?: string | null;
};

export type GroupMember = GroupUser & {
  user?: GroupUser | null;
  user_id?: number | null;
};

export type GroupApiMember = {
  id: number;
  full_name: string;
  mobile_number: string;
  email: string;
  role: string;
  created_at: string;
  updated_at: string;
};

export type Group = {
  id: number;
  members?: GroupMember[];
  name?: string | null;
};

export type GroupDetailResult = {
  group: Group;
  transactions: ApiTransaction[];
};

export type ListGroupsResponse =
  | Group[]
  | {
      groups?: Group[];
      success?: true;
    };

export type AddGroupMembersPayload = {
  user_ids: number[];
};

export type AddGroupMembersResponse = {
  group?: Group;
  success: true;
};

export type RemoveGroupMemberResponse = {
  group?: Group;
  success: true;
};

export type CreateGroupPayload = {
  name: string;
  user_ids: number[];
};

export type CreateGroupResponse =
  | Group
  | {
      group?: Group;
      success?: true;
    };

export type GetGroupResponse = {
  success: boolean;
  group: {
    id: number;
    name: string;
    description: string | null;
    created_by_id: number;
    created_at: string;
    updated_at: string;
    members: GroupApiMember[];
    transactions: ApiTransaction[];
  };
};

export type UpdateGroupPayload = {
  name?: string;
  user_ids?: number[];
};

export type UpdateGroupResponse =
  | Group
  | {
      group?: Group;
      success?: true;
    };

export type SearchUsersByEmailResponse =
  | GroupUser[]
  | {
      success?: true;
      user?: GroupUser | null;
      users?: GroupUser[];
    };
