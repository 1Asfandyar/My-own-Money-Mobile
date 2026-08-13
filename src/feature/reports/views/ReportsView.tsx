import { Ionicons } from '@expo/vector-icons';
import { ActivityIndicator, ScrollView, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import AccountBalancesList from '@/feature/reports/components/AccountBalancesList';
import MonthNavigator from '@/feature/reports/components/MonthNavigator';
import MonthlyTrend from '@/feature/reports/components/MonthlyTrend';
import NetWorthSection from '@/feature/reports/components/NetWorthSection';
import OverviewCard from '@/feature/reports/components/OverviewCard';
import SharedMoneySection from '@/feature/reports/components/SharedMoneySection';
import SpendingByCategory from '@/feature/reports/components/SpendingByCategory';
import type { ReportsViewModel } from '@/feature/reports/types/report.types';
import ThemedText from '@/theme/components/ThemedText';
import { themeColors } from '@/theme/utilities';

interface ReportsViewProps {
  vm: ReportsViewModel;
}

const ReportsView = ({ vm }: ReportsViewProps) => {
  const {
    report,
    isLoading,
    error,
    selectedMonthKey,
    canGoForward,
    categoryChartTab,
    currencySymbol,
    onPreviousMonth,
    onNextMonth,
    onRetry,
    onCategoryChartTabChange,
    onTrendMonthPress,
  } = vm;

  const monthLabel = (() => {
    const [year, month] = selectedMonthKey.split('-').map(Number);
    return new Date(year, month - 1, 1).toLocaleDateString('en-US', {
      month: 'long',
      year: 'numeric',
    });
  })();

  return (
    <SafeAreaView className="flex-1 bg-gray-50" edges={['top']}>
      <MonthNavigator
        selectedMonthKey={selectedMonthKey}
        canGoForward={canGoForward}
        isLoading={isLoading && !report}
        onPreviousMonth={onPreviousMonth}
        onNextMonth={onNextMonth}
      />

      {error && !report ? (
        <View className="flex-1 items-center justify-center px-8">
          <Ionicons name="cloud-offline-outline" size={48} color={themeColors.gray300} />
          <ThemedText className="mt-4 text-center text-base text-gray-500">
            {error}
          </ThemedText>
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={onRetry}
            className="mt-5 rounded-full bg-primary px-6 py-3"
          >
            <ThemedText className="text-sm text-white" weight="semiBold">
              Try Again
            </ThemedText>
          </TouchableOpacity>
        </View>
      ) : isLoading && !report ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color={themeColors.primary} />
        </View>
      ) : (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 144 }}
        >
          {report ? (
            <>
              <OverviewCard
                overview={report.overview}
                period={report.period}
                currencySymbol={currencySymbol}
              />

              {report.overview.total_income_cents === 0 &&
                report.overview.total_expenses_cents === 0 && (
                  <View className="mx-4 mt-3 items-center rounded-2xl border border-dashed border-gray-200 bg-white px-4 py-5">
                    <Ionicons name="receipt-outline" size={24} color={themeColors.gray300} />
                    <ThemedText className="mt-2 text-center text-sm text-gray-400">
                      No activity in {monthLabel}
                    </ThemedText>
                  </View>
                )}

              <View className="mt-5">
                <NetWorthSection
                  netWorth={report.net_worth}
                />
              </View>

              <View className="mt-5 px-4">
                <ThemedText className="mb-3 text-base text-gray-900" weight="semiBold">
                  Accounts
                </ThemedText>
              </View>
              <AccountBalancesList
                accounts={report.accounts}
                totalBalanceCents={report.total_balance_cents}
                currencySymbol={currencySymbol}
              />

              <View className="mx-4 mt-5 border-t border-gray-100 pt-5">
                <SharedMoneySection
                  sharedMoney={report.shared_money}
                />
              </View>

              {report.spending_by_category.length > 0 && (
                <SpendingByCategory
                  categories={report.spending_by_category}
                  activeTab={categoryChartTab}
                  currencySymbol={currencySymbol}
                  onTabChange={onCategoryChartTabChange}
                />
              )}

              {report.trend.length > 0 && (
                <MonthlyTrend
                  trend={report.trend}
                  onMonthPress={onTrendMonthPress}
                />
              )}
            </>
          ) : null}
        </ScrollView>
      )}
    </SafeAreaView>
  );
};

export default ReportsView;
