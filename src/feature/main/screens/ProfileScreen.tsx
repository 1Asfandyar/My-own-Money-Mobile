import { useProfileSettings } from '@/feature/profile/hooks/useProfileSettings';
import ProfileView from '@/feature/profile/views/ProfileView';

const ProfileScreen = () => {
  const profile = useProfileSettings();

  return <ProfileView profile={profile} />;
};

export default ProfileScreen;
