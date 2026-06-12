import useManageFriends from '@/feature/friendships/hooks/useManageFriends';
import ManageFriendsView from '@/feature/friendships/views/ManageFriendsView';

const ManageFriendsScreen = () => {
  const manager = useManageFriends();

  return <ManageFriendsView manager={manager} />;
};

export default ManageFriendsScreen;
