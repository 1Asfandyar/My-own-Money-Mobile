import { Ionicons } from '@expo/vector-icons';
import { ActivityIndicator, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import SharedExpenseAvatar from '@/feature/transactions/components/SharedExpenseAvatar';
import TransactionList from '@/feature/transactions/components/TransactionList';
import type { FriendshipDetailViewProps } from '@/feature/friendships/types/friendship.types';
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

const EmptyTransactions = () => (
  <View className="mx-5 mt-3 items-center rounded-2xl border border-dashed border-gray-200 bg-white px-4 py-8">
    <Ionicons name="receipt-outline" size={28} color={themeColors.gray400} />
    <ThemedText className="mt-3 text-center text-sm text-gray-500">
      No shared transactions with this friend yet.
    </ThemedText>
  </View>
);

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
        <HeaderIconButton accessibilityLabel="Go back" onPress={detail.onBack} />
        <View className="flex-1 items-center justify-center">
          <Ionicons name="alert-circle-outline" size={30} color={themeColors.gray400} />
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

  const ListHeader = (
    <View className="px-5 pt-4 pb-2">
      <View className="mb-5 flex-row items-center justify-between">
        <HeaderIconButton accessibilityLabel="Go back" onPress={detail.onBack} />
        <View className="h-11 w-11" />
      </View>

      {friend ? (
        <View className="items-center rounded-2xl border border-gray-100 bg-white px-5 py-6">
          <SharedExpenseAvatar user={friendshipUserToGroupUser(friend)} size={76} />
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

      <ThemedText className="mt-7 text-base text-gray-900" weight="semiBold">
        Transactions
      </ThemedText>
    </View>
  );

  return (
    <SafeAreaView
      className="flex-1 bg-gray-50"
      edges={['top', 'left', 'right', 'bottom']}
    >
      <TransactionList
        contentContainerStyle={{ paddingBottom: 40 }}
        ListEmptyComponent={<EmptyTransactions />}
        ListHeaderComponent={ListHeader}
        onSelectTransaction={detail.onSelectTransaction}
        transactions={detail.transactions}
      />
    </SafeAreaView>
  );
};

export default FriendshipDetailView;
