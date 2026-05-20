import { Ionicons } from '@expo/vector-icons';
import { View } from 'react-native';

import type {
  ProfileInfoItem,
  ProfileInfoListProps,
} from '@/feature/profile/types/profile.types';
import ThemedText from '@/theme/components/ThemedText';
import { themeColors } from '@/theme/utilities';

const ProfileInfoRow = ({ iconName, label, value }: ProfileInfoItem) => (
  <View className="flex-row items-center border-b border-gray-100 py-3 last:border-b-0">
    <View className="h-10 w-10 items-center justify-center rounded-full bg-gray-100">
      <Ionicons name={iconName} size={18} color={themeColors.primary} />
    </View>
    <View className="ml-3 min-w-0 flex-1">
      <ThemedText className="text-xs text-gray-500">{label}</ThemedText>
      <ThemedText
        className="mt-0.5 text-sm text-gray-900"
        numberOfLines={1}
        weight="medium"
      >
        {value}
      </ThemedText>
    </View>
  </View>
);

const ProfileInfoList = ({ items }: ProfileInfoListProps) => (
  <View className="mb-5 rounded-2xl border border-gray-100 bg-white px-4 py-2">
    {items.map((item) => (
      <ProfileInfoRow key={item.label} {...item} />
    ))}
  </View>
);

export default ProfileInfoList;
