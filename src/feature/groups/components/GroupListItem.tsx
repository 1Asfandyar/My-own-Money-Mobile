import { memo } from 'react';

import GroupCard from '@/feature/groups/components/GroupCard';
import type { GroupListItemProps } from '@/feature/groups/types/groupsScreen.types';

const GroupListItem = ({ group, onOpenGroup }: GroupListItemProps) => (
  <GroupCard group={group} onPress={() => onOpenGroup(group.id)} />
);

export default memo(GroupListItem);
