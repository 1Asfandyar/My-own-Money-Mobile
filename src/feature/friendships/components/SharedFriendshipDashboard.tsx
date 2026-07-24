import { Ionicons } from '@expo/vector-icons';
import {
    ActivityIndicator,
    ScrollView,
    TouchableOpacity,
    View,
} from 'react-native';

import type {
    FriendshipLedger,
    SharedFriendshipDashboardProps,
    SharedFriendshipRowProps,
} from '@/feature/friendships/types/friendship.types';
import {
    friendshipUserToGroupUser,
    getFriendshipBalanceColor,
    getFriendshipUserLabel,
} from '@/feature/friendships/utils/friendshipDisplay.utils';
import SharedExpenseAvatar from '@/feature/transactions/components/SharedExpenseAvatar';
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
  const amountLabel = formatCents(
    Math.abs(balance.amount_cents),
    displayCurrency.id,
    currencies,
  );

  return (
    <TouchableOpacity
      activeOpacity={0.78}
      accessibilityRole="button"
      accessibilityLabel={`Open ${getFriendshipUserLabel(ledger.friend)} balance`}
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
          <ThemedText className="mt-0.5 text-xs text-gray-500" numberOfLines={1}>
            {ledger.friend.email}
          </ThemedText>
        ) : null}
      </View>

      <View className="ml-3 items-end">
        <View className="flex-row items-center">
          {balance.type !== 'settled_up' ? (
            <Ionicons
              // Matches the income (up) / expense (down) arrow convention
              // used in the Personal tab for faster visual scanning.
              name={balance.type === 'owes_you' ? 'arrow-up' : 'arrow-down'}
              size={12}
              color={color}
              style={{ marginRight: 3 }}
            />
          ) : null}
          <ThemedText className="text-xs text-gray-500">
            {balance.type === 'you_owe'
              ? 'you owe'
              : balance.type === 'owes_you'
                ? 'owes you'
                : 'settled'}
          </ThemedText>
        </View>
        <ThemedText
          adjustsFontSizeToFit
          className="mt-1 text-base"
          numberOfLines={1}
          style={{ color, maxWidth: 98 }}
          weight="bold"
        >
          {amountLabel}
        </ThemedText>
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
  onSelectFriendship,
  onRetry,
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
