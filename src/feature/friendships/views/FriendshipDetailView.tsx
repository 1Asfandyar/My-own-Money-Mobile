import { Ionicons } from '@expo/vector-icons';
import { ActivityIndicator, ScrollView, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import SharedExpenseAvatar from '@/feature/transactions/components/SharedExpenseAvatar';
import type {
  FriendshipActivityItem,
  FriendshipDetailViewProps,
} from '@/feature/friendships/types/friendship.types';
import {
  friendshipUserToGroupUser,
  getFriendshipUserLabel,
} from '@/feature/friendships/utils/friendshipDisplay.utils';
import ThemedButton from '@/theme/components/ThemedButton';
import ThemedText from '@/theme/components/ThemedText';
import { themeColors } from '@/theme/utilities';

const HeaderIconButton = ({
  accessibilityLabel,
  onPress,
}: {
  accessibilityLabel: string;
  onPress: () => void;
}) => (
  <TouchableOpacity
    activeOpacity={0.76}
    accessibilityLabel={accessibilityLabel}
    accessibilityRole="button"
    className="h-11 w-11 items-center justify-center rounded-full bg-gray-100"
    onPress={onPress}
  >
    <Ionicons name="chevron-back" size={24} color={themeColors.gray900} />
  </TouchableOpacity>
);

const getActivityIconName = (
  activity: FriendshipActivityItem,
): keyof typeof Ionicons.glyphMap =>
  activity.group ? 'people-outline' : 'receipt-outline';

const FriendshipDetailView = ({ detail }: FriendshipDetailViewProps) => {
  if (detail.isLoading) {
    return (
      <SafeAreaView
        className="flex-1 items-center justify-center bg-white px-6"
        edges={['top', 'left', 'right', 'bottom']}
      >
        <ActivityIndicator color={themeColors.primary} />
        <ThemedText className="mt-3 text-sm text-gray-500">
          Loading friend
        </ThemedText>
      </SafeAreaView>
    );
  }

  if (detail.error && !detail.friend) {
    return (
      <SafeAreaView
        className="flex-1 bg-white px-5 pt-5"
        edges={['top', 'left', 'right', 'bottom']}
      >
        <HeaderIconButton
          accessibilityLabel="Go back"
          onPress={detail.onBack}
        />
        <View className="flex-1 items-center justify-center">
          <Ionicons
            name="alert-circle-outline"
            size={30}
            color={themeColors.gray400}
          />
          <ThemedText className="mt-3 text-center text-sm text-gray-500">
            {detail.error}
          </ThemedText>
          <ThemedButton
            title="Try again"
            onPress={detail.onRetry}
            containerClassName="mt-5 px-5 py-3"
          />
        </View>
      </SafeAreaView>
    );
  }

  const friend = detail.friend;
  const friendName = friend ? getFriendshipUserLabel(friend) : 'Friend';

  return (
    <SafeAreaView
      className="flex-1 bg-white"
      edges={['top', 'left', 'right', 'bottom']}
    >
      <ScrollView
        className="flex-1"
        contentContainerStyle={{
          paddingBottom: 40,
          paddingHorizontal: 20,
          paddingTop: 16,
        }}
        showsVerticalScrollIndicator={false}
      >
        <View className="mb-5 flex-row items-center justify-between">
          <HeaderIconButton
            accessibilityLabel="Go back"
            onPress={detail.onBack}
          />
          <View className="h-11 w-11" />
        </View>

        {friend ? (
          <View className="items-center rounded-2xl border border-gray-100 bg-white px-5 py-6">
            <SharedExpenseAvatar
              user={friendshipUserToGroupUser(friend)}
              size={76}
            />
            <ThemedText
              className="mt-4 text-2xl text-gray-900"
              numberOfLines={2}
              weight="bold"
            >
              {friendName}
            </ThemedText>
            {friend.email ? (
              <ThemedText className="mt-1 text-sm text-gray-500" numberOfLines={1}>
                {friend.email}
              </ThemedText>
            ) : null}

            <View className="mt-6 w-full rounded-2xl bg-gray-50 px-4 py-4">
              <ThemedText className="text-center text-sm text-gray-500">
                {detail.balanceLabel}
              </ThemedText>
              <ThemedText
                adjustsFontSizeToFit
                className="mt-1 text-center text-4xl"
                numberOfLines={1}
                style={{ color: detail.balanceColor }}
                weight="bold"
              >
                {detail.balanceAmountLabel}
              </ThemedText>
            </View>

            <ThemedButton
              title="Settle up"
              leftIcon="card-outline"
              disabled={detail.settleUpDisabled}
              onPress={detail.onSettleUp}
              containerClassName="mt-5 w-full rounded-full py-4"
            />
          </View>
        ) : null}

        {detail.error ? (
          <ThemedText className="mt-4 text-center text-sm text-red-500">
            {detail.error}
          </ThemedText>
        ) : null}

        <View className="mt-7">
          <ThemedText className="text-base text-gray-900" weight="semiBold">
            Activity
          </ThemedText>

          {detail.activity.length > 0 ? (
            detail.activity.map((activity) => (
              <TouchableOpacity
                key={activity.transaction_id}
                activeOpacity={0.78}
                accessibilityRole="button"
                accessibilityLabel={`Open ${activity.title || 'shared expense'}`}
                className="mt-3 rounded-2xl border px-4 py-4"
                style={{
                  backgroundColor: activity.impactBackgroundColor,
                  borderColor: `${activity.impactColor}1A`,
                }}
                onPress={() => detail.onOpenTransaction(activity.transaction_id)}
              >
                <View className="flex-row items-center">
                  <View className="w-11 items-center rounded-2xl bg-gray-50 py-2">
                    <ThemedText className="text-[10px] uppercase text-gray-400" weight="semiBold">
                      {activity.monthLabel}
                    </ThemedText>
                    <ThemedText className="mt-0.5 text-base text-gray-700" weight="bold">
                      {activity.dayLabel}
                    </ThemedText>
                  </View>

                  <View
                    className="ml-3 h-11 w-11 items-center justify-center rounded-2xl"
                    style={{ backgroundColor: `${activity.impactColor}18` }}
                  >
                    <Ionicons
                      name={getActivityIconName(activity)}
                      size={21}
                      color={activity.impactColor}
                    />
                  </View>

                  <View className="ml-3 min-w-0 flex-1">
                    <ThemedText
                      className="text-base text-gray-900"
                      numberOfLines={1}
                      weight="semiBold"
                    >
                      {activity.title || 'Shared expense'}
                    </ThemedText>
                    <ThemedText className="mt-1 text-xs text-gray-500" numberOfLines={1}>
                      {activity.groupLabel} - paid by{' '}
                      {activity.payer.full_name ?? `User #${activity.payer.id}`}
                    </ThemedText>
                  </View>

                  <View className="ml-3 items-end">
                    <View
                      className="rounded-full px-2.5 py-1"
                      style={{ backgroundColor: `${activity.impactColor}18` }}
                    >
                      <ThemedText
                        className="text-[11px]"
                        style={{ color: activity.impactColor }}
                        weight="semiBold"
                      >
                        {activity.impactLabel}
                      </ThemedText>
                    </View>
                    <ThemedText className="mt-1.5 text-sm text-gray-900" weight="bold">
                      {activity.amountLabel}
                    </ThemedText>
                  </View>

                  <Ionicons
                    name="chevron-forward"
                    size={18}
                    color={themeColors.gray400}
                    style={{ marginLeft: 8 }}
                  />
                </View>
              </TouchableOpacity>
            ))
          ) : (
            <View className="mt-3 items-center rounded-2xl border border-dashed border-gray-200 bg-white px-4 py-8">
              <Ionicons
                name="receipt-outline"
                size={28}
                color={themeColors.gray400}
              />
              <ThemedText className="mt-3 text-center text-sm text-gray-500">
                No activity with this friend yet.
              </ThemedText>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default FriendshipDetailView;
