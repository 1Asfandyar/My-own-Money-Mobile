import useGroups from '@/feature/groups/hooks/useGroups';
import GroupsView from '@/feature/groups/views/GroupsView';

const GroupsScreen = () => {
  const groups = useGroups();

  return <GroupsView groups={groups} />;
};

export default GroupsScreen;
