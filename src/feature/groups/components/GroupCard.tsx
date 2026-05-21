import { Ionicons } from '@expo/vector-icons';
import { TouchableOpacity, View } from 'react-native';

import type { GroupCardProps } from '@/feature/groups/types/groupsScreen.types';
import {
  getGroupUsers,
  getUserInitial,
  getUserLabel,
} from '@/feature/groups/utils/groupMembers.utils';
import ThemedText from '@/theme/components/ThemedText';
import { themeColors } from '@/theme/utilities';

const GroupCard = ({ group, onPress }: GroupCardProps) => {
  const members = getGroupUsers(group);
  const visibleMembers = members.slice(0, 4);
  const extraMembersCount = Math.max(members.length - visibleMembers.length, 0);

  return (
    <TouchableOpacity
      activeOpacity={0.78}
      accessibilityRole="button"
      accessibilityLabel={`Open ${group.name?.trim() || 'custom group'}`}
      onPress={onPress}
      className="mb-3 rounded-xl border border-gray-200 bg-white px-4 py-4"
    >
      <View className="flex-row items-center">
        <View className="h-11 w-11 items-center justify-center rounded-full bg-primary/10">
          <Ionicons name="people-outline" size={21} color={themeColors.primary} />
        </View>

        <View className="ml-3 min-w-0 flex-1">
          <ThemedText
            className="text-base text-gray-900"
            weight="semiBold"
            numberOfLines={1}
          >
            {group.name?.trim() || 'Custom group'}
          </ThemedText>
          <ThemedText className="mt-0.5 text-xs text-gray-500">
            {members.length} {members.length === 1 ? 'member' : 'members'}
          </ThemedText>
        </View>
      </View>

      {visibleMembers.length > 0 ? (
        <View className="mt-4 flex-row flex-wrap">
          {visibleMembers.map((member) => (
            <View
              key={member.id}
              className="mb-2 mr-2 flex-row items-center rounded-full bg-gray-100 px-2 py-1"
            >
              <View className="h-6 w-6 items-center justify-center rounded-full bg-white">
                <ThemedText className="text-[11px] text-primary" weight="semiBold">
                  {getUserInitial(member)}
                </ThemedText>
              </View>
              <ThemedText
                className="ml-1.5 max-w-28 text-xs text-gray-700"
                numberOfLines={1}
              >
                {getUserLabel(member)}
              </ThemedText>
            </View>
          ))}

          {extraMembersCount > 0 ? (
            <View className="mb-2 mr-2 rounded-full bg-primary/10 px-3 py-1.5">
              <ThemedText className="text-xs text-primary" weight="semiBold">
                +{extraMembersCount}
              </ThemedText>
            </View>
          ) : null}
        </View>
      ) : null}
    </TouchableOpacity>
  );
};

export default GroupCard;
