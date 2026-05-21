export type GroupKind = 'friends' | 'custom';

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

export type Group = {
  id: number;
  kind?: GroupKind | string | null;
  members?: GroupMember[];
  name?: string | null;
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
  kind: 'custom';
  name: string;
  user_ids: number[];
};

export type CreateGroupResponse =
  | Group
  | {
      group?: Group;
      success?: true;
    };

export type GetGroupResponse =
  | Group
  | {
      group?: Group;
      success?: true;
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
