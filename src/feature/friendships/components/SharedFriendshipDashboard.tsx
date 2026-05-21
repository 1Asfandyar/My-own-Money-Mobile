import { Ionicons } from '@expo/vector-icons';
import { ActivityIndicator, ScrollView, TouchableOpacity, View } from 'react-native';

import SharedExpenseAvatar from '@/feature/transactions/components/SharedExpenseAvatar';
import type {
  FriendshipLedger,
  SharedFriendshipDashboardProps,
  SharedFriendshipRowProps,
} from '@/feature/friendships/types/friendship.types';
import {
  friendshipUserToGroupUser,
  getFriendshipBalanceColor,
  getFriendshipBalanceLabel,
  getFriendshipBalanceSoftColor,
  getFriendshipUserLabel,
} from '@/feature/friendships/utils/friendshipDisplay.utils';
import ThemedButton from '@/theme/components/ThemedButton';
import ThemedText from '@/theme/components/ThemedText';
import { themeColors } from '@/theme/utilities';
import { formatCents } from '@/utils/currency';

const getSortedLedgers = (ledgers: FriendshipLedger[]) =>
  [...ledgers].sort((first, second) => {
    const firstSettled = first.balance_summary.type === 'settled_up';
    const secondSettled = second.balance_summary.type === 'settled_up';

    if (firstSettled !== secondSettled) {
      return firstSettled ? 1 : -1;
    }

    const amountDifference =
      Math.abs(second.balance_summary.amount_cents) -
      Math.abs(first.balance_summary.amount_cents);

    if (amountDifference !== 0) {
      return amountDifference;
    }

    return getFriendshipUserLabel(first.friend).localeCompare(
      getFriendshipUserLabel(second.friend),
    );
  });

const SharedFriendshipRow = ({
  currencies,
  displayCurrency,
  ledger,
  onPress,
}: SharedFriendshipRowProps) => {
  const balance = ledger.balance_summary;
  const color = getFriendshipBalanceColor(balance.type);
  const softColor = getFriendshipBalanceSoftColor(balance.type);
  const amountLabel = formatCents(
    Math.abs(balance.amount_cents),
    displayCurrency.id,
    currencies,
  );

  return (
    <TouchableOpacity
      activeOpacity={0.82}
      accessibilityRole="button"
      accessibilityLabel={`Open ${getFriendshipUserLabel(ledger.friend)} ledger`}
      className="mt-2 flex-row items-center rounded-2xl border border-gray-100 bg-white p-3"
      onPress={() => onPress(ledger.id)}
    >
      <SharedExpenseAvatar user={friendshipUserToGroupUser(ledger.friend)} size={44} />

      <View className="ml-3 min-w-0 flex-1">
        <ThemedText
          className="text-base text-gray-900"
          numberOfLines={1}
          weight="semiBold"
        >
          {getFriendshipUserLabel(ledger.friend)}
        </ThemedText>
        {ledger.friend.email ? (
          <ThemedText className="mt-1 text-xs text-gray-500" numberOfLines={1}>
            {ledger.friend.email}
          </ThemedText>
        ) : null}
        <View
          className="mt-2 self-start rounded-full px-2 py-1"
          style={{ backgroundColor: softColor }}
        >
          <ThemedText className="text-xs" style={{ color }} weight="semiBold">
            {getFriendshipBalanceLabel(balance.type)}
          </ThemedText>
        </View>
      </View>

      <View className="ml-3 flex-row items-center">
        <ThemedText
          adjustsFontSizeToFit
          className="text-base"
          numberOfLines={1}
          style={{ color, maxWidth: 98 }}
          weight="bold"
        >
          {amountLabel}
        </ThemedText>
        <Ionicons
          name="chevron-forward"
          size={19}
          color={themeColors.gray400}
          style={{ marginLeft: 4 }}
        />
      </View>
    </TouchableOpacity>
  );
};

const SharedFriendshipDashboard = ({
  currencies,
  displayCurrency,
  error,
  isLoading,
  ledgers,
  onRetry,
  onSelectFriendship,
}: SharedFriendshipDashboardProps) => {
  if (isLoading) {
    return (
      <View className="items-center py-7">
        <ActivityIndicator color={themeColors.primary} />
        <ThemedText className="mt-3 text-sm text-gray-500">
          Loading shared balances
        </ThemedText>
      </View>
    );
  }

  if (error) {
    return (
      <View className="rounded-2xl border border-gray-200 bg-white px-4 py-5">
        <ThemedText className="text-base text-gray-900" weight="semiBold">
          Shared balances unavailable
        </ThemedText>
        <ThemedText className="mt-2 text-sm leading-5 text-gray-500">
          {error}
        </ThemedText>
        <ThemedButton
          title="Try again"
          onPress={onRetry}
          variant="outline"
          containerClassName="mt-4"
        />
      </View>
    );
  }

  if (ledgers.length === 0) {
    return (
      <View className="mt-4 items-center rounded-2xl border border-dashed border-gray-200 bg-white px-4 py-7">
        <View className="h-12 w-12 items-center justify-center rounded-full bg-lightBlue">
          <Ionicons
            name="people-outline"
            size={24}
            color={themeColors.primary}
          />
        </View>
        <ThemedText className="mt-4 text-base text-gray-900" weight="semiBold">
          No shared balances yet
        </ThemedText>
        <ThemedText className="mt-2 text-center text-sm leading-5 text-gray-500">
          Shared expenses with accepted friends will appear here.
        </ThemedText>
      </View>
    );
  }

  return (
    <ScrollView
      nestedScrollEnabled
      showsVerticalScrollIndicator={ledgers.length > 4}
      style={{ maxHeight: 420 }}
    >
      {getSortedLedgers(ledgers).map((ledger) => (
        <SharedFriendshipRow
          key={ledger.id}
          currencies={currencies}
          displayCurrency={displayCurrency}
          ledger={ledger}
          onPress={onSelectFriendship}
        />
      ))}
    </ScrollView>
  );
};

export default SharedFriendshipDashboard;
