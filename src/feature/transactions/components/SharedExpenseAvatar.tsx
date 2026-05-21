import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { View } from 'react-native';

import { sharedExpenseAvatarStyles } from '@/feature/transactions/components/SharedExpenseAvatar.styles';
import type { SharedExpenseAvatarProps } from '@/feature/transactions/types/addTransactionRecord.types';
import {
  getUserAvatarUrl,
  getUserInitial,
} from '@/feature/groups/utils/groupMembers.utils';
import ThemedText from '@/theme/components/ThemedText';
import { themeColors } from '@/theme/utilities';

const SharedExpenseAvatar = ({
  className = '',
  size = 38,
  user,
}: SharedExpenseAvatarProps) => {
  const avatarUrl = getUserAvatarUrl(user);

  if (avatarUrl) {
    return (
      <View
        className={`overflow-hidden rounded-full bg-gray-100 ${className}`}
        style={{ height: size, width: size }}
      >
        <Image
          source={{ uri: avatarUrl }}
          contentFit="cover"
          style={sharedExpenseAvatarStyles.image}
        />
      </View>
    );
  }

  return (
    <View
      className={`items-center justify-center rounded-full bg-primary/10 ${className}`}
      style={{ height: size, width: size }}
    >
      {getUserInitial(user) ? (
        <ThemedText className="text-primary" weight="semiBold">
          {getUserInitial(user)}
        </ThemedText>
      ) : (
        <Ionicons name="person" size={size * 0.48} color={themeColors.primary} />
      )}
    </View>
  );
};

export default SharedExpenseAvatar;
