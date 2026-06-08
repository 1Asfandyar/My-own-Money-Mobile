import { Ionicons } from '@expo/vector-icons';
import { useCallback } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Modal,
  TouchableOpacity,
  View,
} from 'react-native';
import type { ListRenderItem } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import type { FriendshipLedger } from '@/feature/friendships/types/friendship.types';
import {
  friendshipUserToGroupUser,
  getFriendshipUserLabel,
} from '@/feature/friendships/utils/friendshipDisplay.utils';
import type { FriendshipNotificationsModalProps } from '@/feature/main/types/mainHeader.types';
import SharedExpenseAvatar from '@/feature/transactions/components/SharedExpenseAvatar';
import ThemedButton from '@/theme/components/ThemedButton';
import ThemedText from '@/theme/components/ThemedText';
import { themeColors } from '@/theme/utilities';

const keyExtractor = (friendship: FriendshipLedger) => String(friendship.id);

const NotificationEmptyState = ({
  isLoading,
  onRetry,
}: {
  isLoading: boolean;
  onRetry: () => void;
}) => {
  if (isLoading) {
    return (
      <View className="items-center justify-center py-12">
        <ActivityIndicator color={themeColors.primary} />
        <ThemedText className="mt-3 text-sm text-gray-500">
          Loading notifications
        </ThemedText>
      </View>
    );
  }

  return (
    <View className="items-center justify-center rounded-xl border border-dashed border-gray-300 bg-gray-50 px-6 py-10">
      <View className="h-14 w-14 items-center justify-center rounded-full bg-white">
        <Ionicons
          name="notifications-outline"
          size={26}
          color={themeColors.primary}
        />
      </View>
      <ThemedText className="mt-4 text-base text-gray-900" weight="semiBold">
        No notifications
      </ThemedText>
      <ThemedButton
        title="Refresh"
        leftIcon="refresh"
        variant="outline"
        onPress={onRetry}
        containerClassName="mt-5 px-5 py-3"
        textClassName="text-xs"
        iconSize={15}
      />
    </View>
  );
};

const FriendshipRequestRow = ({
  acceptingFriendshipId,
  friendship,
  onAcceptRequest,
}: {
  acceptingFriendshipId: number | null;
  friendship: FriendshipLedger;
  onAcceptRequest: (friendshipId: number) => void;
}) => {
  const friend = friendship.friend;
  const isAccepting = acceptingFriendshipId === friendship.id;
  const isAnotherRequestAccepting =
    acceptingFriendshipId !== null && acceptingFriendshipId !== friendship.id;

  return (
    <View className="mb-3 rounded-xl border border-gray-200 bg-white px-4 py-4">
      <View className="flex-row items-center">
        <SharedExpenseAvatar user={friendshipUserToGroupUser(friend)} size={44} />
        <View className="ml-3 min-w-0 flex-1">
          <ThemedText
            className="text-sm text-gray-900"
            weight="semiBold"
            numberOfLines={1}
          >
            {getFriendshipUserLabel(friend)}
          </ThemedText>
          <ThemedText className="mt-0.5 text-xs text-gray-500" numberOfLines={2}>
            wants to add you as a friend.
          </ThemedText>
        </View>
      </View>

      <ThemedButton
        title="Accept"
        leftIcon="checkmark-circle-outline"
        loading={isAccepting}
        disabled={isAnotherRequestAccepting}
        onPress={() => onAcceptRequest(friendship.id)}
        containerClassName="mt-4 py-3"
        textClassName="text-sm"
        iconSize={16}
      />
    </View>
  );
};

const FriendshipNotificationsModal = ({
  acceptingFriendshipId,
  error,
  isLoading,
  isVisible,
  onAcceptRequest,
  onClose,
  onRetry,
  requests,
}: FriendshipNotificationsModalProps) => {
  const renderRequest = useCallback<ListRenderItem<FriendshipLedger>>(
    ({ item }) => (
      <FriendshipRequestRow
        acceptingFriendshipId={acceptingFriendshipId}
        friendship={item}
        onAcceptRequest={onAcceptRequest}
      />
    ),
    [acceptingFriendshipId, onAcceptRequest],
  );

  return (
    <Modal
      animationType="slide"
      transparent
      visible={isVisible}
      onRequestClose={onClose}
    >
      <View className="flex-1 justify-end bg-black/40">
        <TouchableOpacity
          activeOpacity={1}
          accessibilityRole="button"
          accessibilityLabel="Close notifications"
          className="flex-1"
          onPress={onClose}
        />

        <SafeAreaView edges={['bottom']} className="rounded-t-[28px] bg-white">
          <View className="px-5 pb-5 pt-5">
            <View className="mb-4 flex-row items-center justify-between">
              <View className="min-w-0 flex-1">
                <ThemedText className="text-xl text-gray-900" weight="bold">
                  Notifications
                </ThemedText>
                <ThemedText className="mt-1 text-sm text-gray-500">
                  Friend requests waiting for you.
                </ThemedText>
              </View>

              <TouchableOpacity
                activeOpacity={0.75}
                accessibilityRole="button"
                accessibilityLabel="Close notifications"
                onPress={onClose}
                className="ml-3 h-10 w-10 items-center justify-center rounded-full bg-gray-100"
              >
                <Ionicons name="close" size={22} color={themeColors.gray700} />
              </TouchableOpacity>
            </View>

            {error ? (
              <View className="mb-4 rounded-xl bg-red-50 px-4 py-3">
                <ThemedText className="text-sm text-red-600">{error}</ThemedText>
              </View>
            ) : null}

            <FlatList
              data={requests}
              initialNumToRender={8}
              keyExtractor={keyExtractor}
              ListEmptyComponent={
                <NotificationEmptyState isLoading={isLoading} onRetry={onRetry} />
              }
              maxToRenderPerBatch={8}
              renderItem={renderRequest}
              showsVerticalScrollIndicator={requests.length > 3}
              style={{ maxHeight: 420 }}
              windowSize={5}
            />
          </View>
        </SafeAreaView>
      </View>
    </Modal>
  );
};

export default FriendshipNotificationsModal;
