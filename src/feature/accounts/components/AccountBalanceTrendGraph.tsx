import { Ionicons } from '@expo/vector-icons';
import { View } from 'react-native';

import type { AccountBalanceTrendGraphProps } from '@/feature/accounts/types/accountBalanceTrend.types';
import ThemedText from '@/theme/components/ThemedText';

// A legible, single-line delta replaces the previous unlabeled bar chart,
// which had no axis, values, or dates for users to interpret.
const AccountBalanceTrendGraph = ({
  accentColor,
  isBalanceVisible,
  trend,
}: AccountBalanceTrendGraphProps) => {
  return (
    <View
      className="mt-5 flex-row items-center justify-between rounded-3xl border border-white/10 bg-white/10 px-4 py-3"
      accessibilityLabel={`Account balance trend: ${trend.summary}`}
    >
      <View className="flex-1 pr-3">
        <ThemedText className="text-xs uppercase tracking-wide text-white/50">
          Money trend
        </ThemedText>
        <ThemedText
          className="mt-1 text-sm text-white"
          numberOfLines={1}
          weight="semiBold"
        >
          {isBalanceVisible ? trend.summary : 'Balance hidden'}
        </ThemedText>
      </View>

      <View className="flex-row items-center rounded-full bg-white/15 px-3 py-1">
        <Ionicons
          name={
            trend.direction === 'down'
              ? 'trending-down-outline'
              : trend.direction === 'up'
                ? 'trending-up-outline'
                : 'remove-outline'
          }
          size={16}
          color={accentColor}
        />
        <ThemedText
          className="ml-1 text-xs text-white"
          weight="semiBold"
          numberOfLines={1}
        >
          {isBalanceVisible ? (trend.percentLabel ?? 'New') : 'Hidden'}
        </ThemedText>
      </View>
    </View>
  );
};

export default AccountBalanceTrendGraph;
