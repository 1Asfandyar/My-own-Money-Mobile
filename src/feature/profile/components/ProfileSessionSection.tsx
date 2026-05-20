import type { ProfileSessionSectionProps } from '@/feature/profile/types/profile.types';
import ThemedButton from '@/theme/components/ThemedButton';
import ThemedText from '@/theme/components/ThemedText';
import { View } from 'react-native';

const ProfileSessionSection = ({ onSignOut }: ProfileSessionSectionProps) => (
  <View className="rounded-2xl border border-gray-100 bg-white px-4 py-5">
    <ThemedText className="text-lg text-gray-900" weight="bold">
      Session
    </ThemedText>
    <ThemedText className="mt-1 text-xs text-gray-500">
      Sign out of this device.
    </ThemedText>

    <ThemedButton
      title="Sign out"
      leftIcon="log-out-outline"
      variant="outline"
      onPress={onSignOut}
      containerClassName="mt-4"
    />
  </View>
);

export default ProfileSessionSection;
