import { Ionicons } from '@expo/vector-icons';
import { Modal, Pressable, ScrollView, View } from 'react-native';

import SharedExpenseAvatar from '@/feature/transactions/components/SharedExpenseAvatar';
import type {
  FriendshipActivityItem,
  FriendshipGroupBalance,
  FriendshipLedgerModalProps,
} from '@/feature/friendships/types/friendship.types';
import {
  friendshipUserToGroupUser,
  getFriendshipActivityImpactColor,
  getFriendshipActivityImpactLabel,
  getFriendshipBalanceColor,
  getFriendshipBalanceLabel,
  getFriendshipBalanceSoftColor,
  getFriendshipDateLabel,
  getFriendshipUserLabel,
} from '@/feature/friendships/utils/friendshipDisplay.utils';
import ThemedText from '@/theme/components/ThemedText';
import { themeColors } from '@/theme/utilities';
import { formatCents } from '@/utils/currency';

const getAmountLabel = (
  cents: number,
  currencyId: number,
  currencies: FriendshipLedgerModalProps['currencies'],
) => formatCents(Math.abs(cents), currencyId, currencies);

const GroupBalanceRow = ({
  currencies,
  displayCurrencyId,
  item,
}: {
  currencies: FriendshipLedgerModalProps['currencies'];
  displayCurrencyId: number;
  item: FriendshipGroupBalance;
}) => {
  const color = getFriendshipBalanceColor(item.balance.type);
  const softColor = getFriendshipBalanceSoftColor(item.balance.type);

  return (
    <View className="mt-2 flex-row items-center rounded-2xl border border-gray-100 px-4 py-3">
      <View
        className="h-10 w-10 items-center justify-center rounded-full"
        style={{ backgroundColor: softColor }}
      >
        <Ionicons name="people-outline" size={19} color={color} />
      </View>

      <View className="ml-3 min-w-0 flex-1">
        <ThemedText
          className="text-sm text-gray-900"
          numberOfLines={1}
          weight="semiBold"
        >
          {item.group_name}
        </ThemedText>
        <ThemedText className="mt-1 text-xs text-gray-500">
          {getFriendshipBalanceLabel(item.balance.type)}
        </ThemedText>
      </View>

      <ThemedText
        adjustsFontSizeToFit
        className="ml-3 text-sm"
        numberOfLines={1}
        style={{ color, maxWidth: 96 }}
        weight="bold"
      >
        {getAmountLabel(item.balance.amount_cents, displayCurrencyId, currencies)}
      </ThemedText>
    </View>
  );
};

const ActivityRow = ({
  currencies,
  displayCurrencyId,
  item,
}: {
  currencies: FriendshipLedgerModalProps['currencies'];
  displayCurrencyId: number;
  item: FriendshipActivityItem;
}) => {
  const impactColor = getFriendshipActivityImpactColor(
    item.balance_impact.type,
  );
  const groupLabel = item.group?.name ?? 'Direct expense';

  return (
    <View className="mt-2 rounded-2xl border border-gray-100 px-4 py-3">
      <View className="flex-row items-start">
        <View className="h-10 w-10 items-center justify-center rounded-full bg-gray-100">
          <Ionicons name="receipt-outline" size={19} color={themeColors.gray700} />
        </View>

        <View className="ml-3 min-w-0 flex-1">
          <ThemedText
            className="text-sm text-gray-900"
            numberOfLines={1}
            weight="semiBold"
          >
            {item.title || 'Shared expense'}
          </ThemedText>
          <ThemedText className="mt-1 text-xs text-gray-500" numberOfLines={1}>
            {groupLabel} - Paid by {getFriendshipUserLabel(item.payer)}
          </ThemedText>
          <ThemedText className="mt-1 text-xs text-gray-400">
            {getFriendshipDateLabel(item.transaction_date)}
          </ThemedText>
        </View>

        <View className="ml-3 items-end">
          <ThemedText
            adjustsFontSizeToFit
            className="text-sm text-gray-900"
            numberOfLines={1}
            style={{ maxWidth: 90 }}
            weight="bold"
          >
            {getAmountLabel(item.amount_cents, displayCurrencyId, currencies)}
          </ThemedText>
          <ThemedText
            className="mt-1 text-xs"
            style={{ color: impactColor }}
            weight="semiBold"
          >
            {getFriendshipActivityImpactLabel(item.balance_impact.type)}
          </ThemedText>
          {item.balance_impact.amount_cents > 0 ? (
            <ThemedText className="mt-0.5 text-xs" style={{ color: impactColor }}>
              {getAmountLabel(
                item.balance_impact.amount_cents,
                displayCurrencyId,
                currencies,
              )}
            </ThemedText>
          ) : null}
        </View>
      </View>
    </View>
  );
};

const FriendshipLedgerModal = ({
  currencies,
  displayCurrency,
  isVisible,
  ledger,
  onClose,
}: FriendshipLedgerModalProps) => {
  if (!ledger) {
    return null;
  }

  const balance = ledger.balance_summary;
  const balanceColor = getFriendshipBalanceColor(balance.type);
  const balanceSoftColor = getFriendshipBalanceSoftColor(balance.type);

  return (
    <Modal
      animationType="slide"
      onRequestClose={onClose}
      transparent
      visible={isVisible}
    >
      <View className="flex-1 justify-end">
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Close friendship ledger"
          onPress={onClose}
          className="absolute inset-0 bg-black/40"
        />

        <View className="max-h-[84%] rounded-t-3xl bg-white px-5 pb-6 pt-4">
          <View className="mb-4 h-1.5 w-12 self-center rounded-full bg-gray-200" />

          <View className="flex-row items-start justify-between">
            <View className="min-w-0 flex-1 flex-row items-center pr-4">
              <SharedExpenseAvatar
                user={friendshipUserToGroupUser(ledger.friend)}
                size={46}
              />
              <View className="ml-3 min-w-0 flex-1">
                <ThemedText
                  className="text-xl text-gray-900"
                  numberOfLines={1}
                  weight="bold"
                >
                  {getFriendshipUserLabel(ledger.friend)}
                </ThemedText>
                {ledger.friend.email ? (
                  <ThemedText className="mt-1 text-sm text-gray-500" numberOfLines={1}>
                    {ledger.friend.email}
                  </ThemedText>
                ) : null}
              </View>
            </View>

            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Close friendship ledger"
              onPress={onClose}
              className="h-10 w-10 items-center justify-center rounded-full bg-gray-100"
            >
              <Ionicons name="close" size={22} color={themeColors.gray700} />
            </Pressable>
          </View>

          <View
            className="mt-4 rounded-2xl px-4 py-3"
            style={{ backgroundColor: balanceSoftColor }}
          >
            <ThemedText className="text-sm" style={{ color: balanceColor }}>
              {getFriendshipBalanceLabel(balance.type)}
            </ThemedText>
            <ThemedText
              className="mt-1 text-2xl"
              style={{ color: balanceColor }}
              weight="bold"
            >
              {getAmountLabel(balance.amount_cents, displayCurrency.id, currencies)}
            </ThemedText>
          </View>

          <ScrollView
            className="mt-2"
            nestedScrollEnabled
            showsVerticalScrollIndicator
          >
            {ledger.group_balances.length > 0 ? (
              <View className="mt-3">
                <ThemedText className="text-base text-gray-900" weight="semiBold">
                  Groups
                </ThemedText>
                {ledger.group_balances.map((item) => (
                  <GroupBalanceRow
                    key={item.group_id}
                    currencies={currencies}
                    displayCurrencyId={displayCurrency.id}
                    item={item}
                  />
                ))}
              </View>
            ) : null}

            <View className="mt-4">
              <ThemedText className="text-base text-gray-900" weight="semiBold">
                Activity
              </ThemedText>
              {ledger.activity.length > 0 ? (
                ledger.activity.map((item) => (
                  <ActivityRow
                    key={item.transaction_id}
                    currencies={currencies}
                    displayCurrencyId={displayCurrency.id}
                    item={item}
                  />
                ))
              ) : (
                <View className="mt-3 items-center rounded-2xl border border-dashed border-gray-200 px-4 py-7">
                  <Ionicons
                    name="receipt-outline"
                    size={28}
                    color={themeColors.gray400}
                  />
                  <ThemedText className="mt-3 text-center text-sm leading-5 text-gray-500">
                    No shared activity with this friend yet.
                  </ThemedText>
                </View>
              )}
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

export default FriendshipLedgerModal;
