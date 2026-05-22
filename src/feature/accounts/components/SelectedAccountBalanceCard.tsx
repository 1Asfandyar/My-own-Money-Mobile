import { Ionicons } from '@expo/vector-icons';
import { useMemo, useState } from 'react';
import { TouchableOpacity, View } from 'react-native';

import AccountBalanceTrendGraph from '@/feature/accounts/components/AccountBalanceTrendGraph';
import type { SelectedAccountBalanceCardProps } from '@/feature/accounts/types/accountsOverview.types';
import { getBalanceTrend } from '@/feature/accounts/utils/accountBalanceTrend.utils';
import ThemedText from '@/theme/components/ThemedText';
import { themeColors } from '@/theme/utilities';
import { formatCents } from '@/utils/currency';

const SelectedAccountBalanceCard = ({
  currencies,
  displayCurrency,
  onChangeAccountPress,
  selectedAccount,
}: SelectedAccountBalanceCardProps) => {
  const [isBalanceVisible, setIsBalanceVisible] = useState(true);
  const currentBalanceCents = selectedAccount?.current_balance_cents ?? 0;
  const initialBalanceCents = selectedAccount?.initial_balance_cents ?? 0;
  const trend = useMemo(
    () =>
      getBalanceTrend({
        currencies,
        currentBalanceCents,
        displayCurrencyId: displayCurrency.id,
        initialBalanceCents,
      }),
    [currencies, currentBalanceCents, displayCurrency.id, initialBalanceCents],
  );
  const trendAccentColor =
    trend.direction === 'down' ? '#FCA5A5' : themeColors.accent;
  const balanceLabel = formatCents(
    currentBalanceCents,
    displayCurrency.id,
    currencies,
  );

  return (
    <View className="mt-4 rounded-3xl bg-secondary px-5 py-6">
      <View className="flex-row items-start justify-between">
        <View className="flex-1 pr-4">
          <ThemedText className="text-sm uppercase tracking-wide text-white/60">
            Account
          </ThemedText>
          <ThemedText
            className="pb-2 text-2xl text-white"
            weight="semiBold"
            numberOfLines={1}
          >
            {selectedAccount?.name ?? 'No account selected'}
          </ThemedText>
          <ThemedText className="text-sm text-white/70">
            Current balance in {displayCurrency.code}
          </ThemedText>
          <ThemedText
            className="mt-1 text-3xl text-white"
            weight="bold"
            numberOfLines={1}
          >
            {isBalanceVisible ? balanceLabel : '******'}
          </ThemedText>
        </View>

        <View className="items-center">
          <TouchableOpacity
            activeOpacity={0.8}
            accessibilityRole="button"
            accessibilityLabel="Change account"
            onPress={onChangeAccountPress}
            className="h-12 w-12 items-center justify-center rounded-full bg-white/15"
          >
            <Ionicons
              name="swap-horizontal-outline"
              size={24}
              color={themeColors.white}
            />
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.8}
            accessibilityRole="button"
            accessibilityLabel={
              isBalanceVisible ? 'Hide account balance' : 'Show account balance'
            }
            accessibilityState={{ selected: !isBalanceVisible }}
            onPress={() => setIsBalanceVisible((isVisible) => !isVisible)}
            className="mt-3 h-10 w-10 items-center justify-center rounded-full bg-white/15"
          >
            <Ionicons
              name={isBalanceVisible ? 'eye-outline' : 'eye-off-outline'}
              size={21}
              color={themeColors.white}
            />
          </TouchableOpacity>
        </View>
      </View>

      <AccountBalanceTrendGraph
        accentColor={trendAccentColor}
        isBalanceVisible={isBalanceVisible}
        trend={trend}
      />
    </View>
  );
};

export default SelectedAccountBalanceCard;
