import { Ionicons } from '@expo/vector-icons';
import { memo } from 'react';
import { TouchableOpacity, View } from 'react-native';

import type { GroupFriendOptionRowProps } from '@/feature/groups/types/groupsScreen.types';
import {
  getUserInitial,
  getUserLabel,
} from '@/feature/groups/utils/groupMembers.utils';
import ThemedText from '@/theme/components/ThemedText';
import { themeColors } from '@/theme/utilities';

const GroupFriendOptionRow = ({
  friend,
  isSelected,
  onToggleFriend,
}: GroupFriendOptionRowProps) => (
  <TouchableOpacity
    activeOpacity={0.78}
    accessibilityRole="checkbox"
    accessibilityState={{ checked: isSelected }}
    onPress={() => onToggleFriend(friend.id)}
    className={`mb-2 flex-row items-center rounded-xl border px-4 py-4 ${
      isSelected ? 'border-primary bg-primary/10' : 'border-gray-200 bg-white'
    }`}
  >
    <View
      className={`h-10 w-10 items-center justify-center rounded-full ${
        isSelected ? 'bg-primary' : 'bg-gray-100'
      }`}
    >
      <ThemedText
        className={`text-sm ${isSelected ? 'text-white' : 'text-gray-700'}`}
        weight="semiBold"
      >
        {getUserInitial(friend)}
      </ThemedText>
    </View>
    <View className="ml-3 min-w-0 flex-1">
      <ThemedText
        className="text-sm text-gray-900"
        weight="semiBold"
        numberOfLines={1}
      >
        {getUserLabel(friend)}
      </ThemedText>
      {friend.email ? (
        <ThemedText className="mt-0.5 text-xs text-gray-500" numberOfLines={1}>
          {friend.email}
        </ThemedText>
      ) : null}
    </View>
    <Ionicons
      name={isSelected ? 'checkmark-circle' : 'ellipse-outline'}
      size={22}
      color={isSelected ? themeColors.primary : themeColors.gray400}
    />
  </TouchableOpacity>
);

export default memo(GroupFriendOptionRow);
