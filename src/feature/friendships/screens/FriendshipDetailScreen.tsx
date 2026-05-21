import useFriendshipDetail from '@/feature/friendships/hooks/useFriendshipDetail';
import FriendshipDetailView from '@/feature/friendships/views/FriendshipDetailView';

const FriendshipDetailScreen = () => {
  const detail = useFriendshipDetail();

  return <FriendshipDetailView detail={detail} />;
};

export default FriendshipDetailScreen;
