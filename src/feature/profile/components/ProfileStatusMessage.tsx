import type { ProfileStatusMessageProps } from '@/feature/profile/types/profile.types';
import ThemedText from '@/theme/components/ThemedText';
import { View } from 'react-native';

const ProfileStatusMessage = ({ message, tone }: ProfileStatusMessageProps) => {
  if (!message) return null;

  const isSuccess = tone === 'success';

  return (
    <View
      className={`mb-4 rounded-xl px-4 py-3 ${
        isSuccess ? 'bg-primary/10' : 'bg-red-50'
      }`}
    >
      <ThemedText
        className={`text-sm ${isSuccess ? 'text-primary' : 'text-red-600'}`}
      >
        {message}
      </ThemedText>
    </View>
  );
};

export default ProfileStatusMessage;
