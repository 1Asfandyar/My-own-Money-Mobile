import { StyleSheet, View } from 'react-native';

import type { ReportOverview } from '@/feature/reports/types/report.types';
import ThemedText from '@/theme/components/ThemedText';
import { themeColors } from '@/theme/utilities';
import { formatAmount } from '@/utils/currency';

interface OverviewCardProps {
  overview: ReportOverview;
  period: string;
  currencySymbol: string;
}

const OverviewCard = ({ overview, period, currencySymbol }: OverviewCardProps) => {
  const isOverspent = overview.net_cents < 0;
  const savingsPositive = overview.savings_rate_percent >= 0;

  return (
    <View className="mx-4 rounded-3xl bg-secondary px-5 py-5">
      <ThemedText className="mb-4 text-xs uppercase tracking-wide text-white/50">
        {period}
      </ThemedText>

      <View className="flex-row justify-between">
        <View className="flex-1">
          <ThemedText className="text-xs uppercase tracking-wide text-white/60">
            Income
          </ThemedText>
          <ThemedText className="mt-1 text-xl text-white" weight="bold" numberOfLines={1} adjustsFontSizeToFit>
            {formatAmount(overview.total_income_cents, currencySymbol, { useAbsoluteValue: true })}
          </ThemedText>
        </View>

        <View className="flex-1 items-end">
          <ThemedText className="text-xs uppercase tracking-wide text-white/60">
            Expenses
          </ThemedText>
          <ThemedText className="mt-1 text-xl text-white" weight="bold" numberOfLines={1} adjustsFontSizeToFit>
            {formatAmount(overview.total_expenses_cents, currencySymbol, { useAbsoluteValue: true })}
          </ThemedText>
        </View>
      </View>

      <View className="my-4" style={styles.divider} />

      <View className="flex-row justify-between">
        <View className="flex-1">
          <ThemedText className="text-xs uppercase tracking-wide text-white/60">
            {isOverspent ? 'Overspent' : 'Saved'}
          </ThemedText>
          <ThemedText
            className="mt-1 text-xl"
            weight="bold"
            numberOfLines={1}
            adjustsFontSizeToFit
            style={{ color: isOverspent ? '#FCA5A5' : themeColors.accent }}
          >
            {formatAmount(overview.net_cents, currencySymbol, { useAbsoluteValue: true })}
          </ThemedText>
        </View>

        <View className="w-px bg-white/15 mx-4" />

        <View className="flex-1 items-end">
          <ThemedText className="text-xs uppercase tracking-wide text-white/60">
            Savings Rate
          </ThemedText>
          <ThemedText
            className="mt-1 text-xl"
            weight="bold"
            style={{ color: savingsPositive ? themeColors.primary : '#FCA5A5' }}
          >
            {overview.savings_rate_percent}%
          </ThemedText>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
});

export default OverviewCard;
