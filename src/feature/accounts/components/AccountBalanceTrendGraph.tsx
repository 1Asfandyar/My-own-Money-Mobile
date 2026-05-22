import { Ionicons } from '@expo/vector-icons';
import { View } from 'react-native';

import {
  getTrendBarHeight,
  MIN_TREND_BAR_HEIGHT,
} from '@/feature/accounts/utils/accountBalanceTrend.utils';
import type { AccountBalanceTrendGraphProps } from '@/feature/accounts/types/accountBalanceTrend.types';
import ThemedText from '@/theme/components/ThemedText';

const AccountBalanceTrendGraph = ({
  accentColor,
  isBalanceVisible,
  trend,
}: AccountBalanceTrendGraphProps) => {
  return (
    <View
      className="mt-5 rounded-3xl border border-white/10 bg-white/10 px-4 pb-4 pt-3"
      accessibilityLabel={`Account balance trend: ${trend.summary}`}
    >
      <View className="flex-row items-center justify-between">
        <View>
          <ThemedText className="text-xs uppercase tracking-wide text-white/50">
            Money trend
          </ThemedText>
          <ThemedText className="mt-1 text-sm text-white" weight="semiBold">
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

      <View className="mt-4 h-16 flex-row items-end justify-between">
        {trend.points.map((point, index) => {
          const isLastPoint = index === trend.points.length - 1;
          const barHeight = getTrendBarHeight(point, trend.points);

          return (
            <View
              key={`${point}-${index}`}
              className="h-16 flex-1 items-center justify-end"
            >
              <View
                className="w-5 rounded-full"
                style={{
                  backgroundColor: isLastPoint
                    ? accentColor
                    : 'rgba(255,255,255,0.25)',
                  height: isBalanceVisible
                    ? barHeight
                    : MIN_TREND_BAR_HEIGHT,
                  opacity: isBalanceVisible ? 1 : 0.45,
                }}
              />
            </View>
          );
        })}
      </View>

      <View className="mt-3 flex-row items-center justify-between">
        <ThemedText className="text-xs text-white/50">Opening</ThemedText>
        <ThemedText className="text-xs text-white/50">Current</ThemedText>
      </View>
    </View>
  );
};

export default AccountBalanceTrendGraph;
