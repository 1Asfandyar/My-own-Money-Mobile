import { StyleSheet, TouchableOpacity, View } from 'react-native';

import type { TrendMonth } from '@/feature/reports/types/report.types';
import ThemedText from '@/theme/components/ThemedText';
import { themeColors } from '@/theme/utilities';

const BAR_MAX_HEIGHT = 80;
const BAR_MIN_HEIGHT = 6;

const getBarHeight = (value: number, maxValue: number): number => {
  if (maxValue === 0) return BAR_MIN_HEIGHT;
  return Math.max(BAR_MIN_HEIGHT, Math.round((value / maxValue) * BAR_MAX_HEIGHT));
};

const shortMonthName = (month: string): string =>
  month.split(' ')[0]?.slice(0, 3) ?? month;

interface TrendBarGroupProps {
  month: TrendMonth;
  maxValue: number;
  onPress: () => void;
}

const TrendBarGroup = ({ month, maxValue, onPress }: TrendBarGroupProps) => {
  const incomeH = getBarHeight(month.income_cents, maxValue);
  const expenseH = getBarHeight(month.expenses_cents, maxValue);

  return (
    <TouchableOpacity
      activeOpacity={0.7}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`View ${month.month}`}
      className="flex-1 items-center"
    >
      <View
        className="flex-row items-end justify-center"
        style={{ height: BAR_MAX_HEIGHT, gap: 4 }}
      >
        <View
          className="w-5 rounded-t-md"
          style={{ height: incomeH, backgroundColor: themeColors.primary }}
        />
        <View
          className="w-5 rounded-t-md"
          style={{ height: expenseH, backgroundColor: '#EF4444' }}
        />
      </View>
      <ThemedText className="mt-2 text-xs text-gray-500">
        {shortMonthName(month.month)}
      </ThemedText>
    </TouchableOpacity>
  );
};

interface MonthlyTrendProps {
  trend: TrendMonth[];
  onMonthPress: (monthKey: string) => void;
}

const MonthlyTrend = ({ trend, onMonthPress }: MonthlyTrendProps) => {
  if (trend.length === 0) return null;

  const maxValue = Math.max(...trend.flatMap((m) => [m.income_cents, m.expenses_cents]));

  return (
    <View className="mx-4 mt-5">
      <ThemedText className="mb-4 text-base text-gray-900" weight="semiBold">
        Last 3 Months
      </ThemedText>

      <View className="rounded-2xl border border-gray-100 bg-white px-4 pt-4 pb-3">
        <View className="flex-row" style={styles.chartRow}>
          {trend.map((month) => (
            <TrendBarGroup
              key={month.month_key}
              month={month}
              maxValue={maxValue}
              onPress={() => onMonthPress(month.month_key)}
            />
          ))}
        </View>

        <View className="mt-3 flex-row justify-center" style={styles.legend}>
          <View className="flex-row items-center">
            <View className="mr-1.5 h-2.5 w-2.5 rounded-full" style={{ backgroundColor: themeColors.primary }} />
            <ThemedText className="text-xs text-gray-500">Income</ThemedText>
          </View>
          <View className="ml-4 flex-row items-center">
            <View className="mr-1.5 h-2.5 w-2.5 rounded-full bg-red-400" />
            <ThemedText className="text-xs text-gray-500">Expenses</ThemedText>
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  chartRow: {
    gap: 16,
  },
  legend: {
    gap: 0,
  },
});

export default MonthlyTrend;
