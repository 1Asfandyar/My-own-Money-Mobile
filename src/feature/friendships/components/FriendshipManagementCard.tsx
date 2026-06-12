import { Ionicons } from '@expo/vector-icons';
import { ActivityIndicator, TouchableOpacity, View } from 'react-native';

import type { FriendshipManagementCardProps } from '@/feature/friendships/types/friendship.types';
import {
  friendshipUserToGroupUser,
  getFriendshipManagementAction,
  getFriendshipUserLabel,
} from '@/feature/friendships/utils/friendshipDisplay.utils';
import SharedExpenseAvatar from '@/feature/transactions/components/SharedExpenseAvatar';
import ThemedText from '@/theme/components/ThemedText';

const statusStyles = {
  accepted: {
    container: 'bg-emerald-50',
    text: 'text-emerald-700',
  },
  blocked: {
    container: 'bg-red-50',
    text: 'text-red-700',
  },
  pending: {
    container: 'bg-amber-50',
    text: 'text-amber-700',
  },
} as const;

const FriendshipManagementCard = ({
  currentUserId,
  friendship,
  isUpdating,
  onAction,
}: FriendshipManagementCardProps) => {
  const friend = friendship.friend;
  const action = getFriendshipManagementAction(friendship, currentUserId);
  const actionLabel =
    action === 'cancel'
      ? 'Cancel request'
      : action === 'reject'
        ? 'Decline request'
        : 'Block friend';

  return (
    <View className="mb-3 rounded-2xl border border-gray-200 bg-white px-4 py-4">
      <View className="flex-row items-center">
        <SharedExpenseAvatar user={friendshipUserToGroupUser(friend)} size={48} />
        <View className="ml-3 min-w-0 flex-1">
          <ThemedText
            className="text-base text-gray-900"
            numberOfLines={1}
            weight="semiBold"
          >
            {getFriendshipUserLabel(friend)}
          </ThemedText>
          {friend.email ? (
            <ThemedText className="mt-0.5 text-xs text-gray-500" numberOfLines={1}>
              {friend.email}
            </ThemedText>
          ) : null}
        </View>
        <View
          className={`rounded-full px-3 py-1 ${statusStyles[friendship.status].container}`}
        >
          <ThemedText
            className={`text-xs capitalize ${statusStyles[friendship.status].text}`}
            weight="semiBold"
          >
            {friendship.status}
          </ThemedText>
        </View>
      </View>

      {action ? (
        <TouchableOpacity
          activeOpacity={0.76}
          accessibilityLabel={`${actionLabel} ${getFriendshipUserLabel(friend)}`}
          accessibilityRole="button"
          className="mt-4 flex-row items-center justify-center rounded-xl border border-red-200 bg-red-50 px-4 py-3"
          disabled={isUpdating}
          onPress={() => onAction(friendship)}
        >
          {isUpdating ? (
            <ActivityIndicator color="#DC2626" size="small" />
          ) : (
            <>
              <Ionicons
                name={action === 'block' ? 'ban-outline' : 'person-remove-outline'}
                size={17}
                color="#DC2626"
              />
              <ThemedText className="ml-2 text-sm text-red-600" weight="semiBold">
                {actionLabel}
              </ThemedText>
            </>
          )}
        </TouchableOpacity>
      ) : (
        <ThemedText className="mt-4 text-center text-xs text-gray-400">
          This friendship is blocked.
        </ThemedText>
      )}
    </View>
  );
};

export default FriendshipManagementCard;
