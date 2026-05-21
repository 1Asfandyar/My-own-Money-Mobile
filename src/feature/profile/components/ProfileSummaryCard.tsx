import { Image, View } from 'react-native';

import type { ProfileSummaryCardProps } from '@/feature/profile/types/profile.types';
import {
  getProfileImageUrl,
  getProfileInitial,
} from '@/feature/profile/utils/profileDisplay.utils';
import ThemedText from '@/theme/components/ThemedText';

const ProfileSummaryCard = ({ user }: ProfileSummaryCardProps) => {
  const profileImageUrl = getProfileImageUrl(user);
  const displayName = user?.full_name || 'Your profile';

  return (
    <View className="mb-5 rounded-2xl bg-lightBlue px-5 py-5">
      <View className="flex-row items-center">
        <View className="h-20 w-20 items-center justify-center overflow-hidden rounded-full bg-primary">
          {profileImageUrl ? (
            <Image source={{ uri: profileImageUrl }} className="h-full w-full" />
          ) : (
            <ThemedText className="text-3xl text-white" weight="bold">
              {getProfileInitial(displayName)}
            </ThemedText>
          )}
        </View>

        <View className="ml-4 min-w-0 flex-1">
          <ThemedText
            className="text-xl text-gray-900"
            numberOfLines={1}
            weight="bold"
          >
            {displayName}
          </ThemedText>
          <ThemedText className="mt-1 text-sm text-gray-600" numberOfLines={1}>
            {user?.email || 'No email added'}
          </ThemedText>
        </View>
      </View>
    </View>
  );
};

export default ProfileSummaryCard;
