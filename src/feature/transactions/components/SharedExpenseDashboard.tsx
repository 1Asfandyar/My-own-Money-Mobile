import { Ionicons } from '@expo/vector-icons';
import { ScrollView, View } from 'react-native';

import SharedExpenseFriendCard from '@/feature/transactions/components/SharedExpenseFriendCard';
import { sharedExpenseDashboardStyles } from '@/feature/transactions/components/SharedExpenseDashboard.styles';
import {
  SharedExpenseDashboardEmptyState,
  SharedExpenseDashboardErrorState,
  SharedExpenseDashboardLoadingState,
} from '@/feature/transactions/components/SharedExpenseDashboardState';
import { SHARED_EXPENSE_DASHBOARD_VISIBLE_ITEM_COUNT } from '@/feature/transactions/constants/sharedExpenseDashboard.constants';
import { useSharedExpenseDashboard } from '@/feature/transactions/hooks/useSharedExpenseDashboard';
import type { SharedExpenseDashboardProps } from '@/feature/transactions/types/sharedExpenseDashboard.types';
import ThemedText from '@/theme/components/ThemedText';
import { themeColors } from '@/theme/utilities';

const SharedExpenseDashboard = ({
  currencies,
  displayCurrency,
  error,
  friends,
  isLoading,
  onRetry,
  selectedAccount,
}: SharedExpenseDashboardProps) => {
  const dashboard = useSharedExpenseDashboard({
    currencies,
    displayCurrency,
    friends,
  });

  if (isLoading) {
    return <SharedExpenseDashboardLoadingState />;
  }

  if (error) {
    return <SharedExpenseDashboardErrorState error={error} onRetry={onRetry} />;
  }

  if (!selectedAccount) {
    return null;
  }

  if (!dashboard.hasFriends) {
    return <SharedExpenseDashboardEmptyState />;
  }

  return (
    <View>
      <View className="rounded-2xl border border-gray-100 bg-white p-4">
        <View className="flex-row items-center">
          <View className="h-11 w-11 items-center justify-center rounded-full bg-lightBlue">
            <Ionicons
              name="people-outline"
              size={21}
              color={themeColors.primary}
            />
          </View>
          <View className="ml-3 flex-1">
            <ThemedText className="text-sm text-gray-500">
              Shared split total
            </ThemedText>
            <ThemedText className="mt-1 text-xl text-gray-900" weight="bold">
              {dashboard.summary.amountLabel}
            </ThemedText>
          </View>
          <View className="items-end">
            <ThemedText className="text-xs text-gray-500">
              {dashboard.summary.friendCountLabel}
            </ThemedText>
            <ThemedText className="mt-1 text-xs text-gray-500">
              {dashboard.summary.splitCountLabel}
            </ThemedText>
          </View>
        </View>
      </View>

      <ScrollView
        nestedScrollEnabled
        showsVerticalScrollIndicator={
          dashboard.items.length > SHARED_EXPENSE_DASHBOARD_VISIBLE_ITEM_COUNT
        }
        style={sharedExpenseDashboardStyles.friendsList}
      >
        {dashboard.items.map((item) => (
          <SharedExpenseFriendCard key={item.id} item={item} />
        ))}
      </ScrollView>
    </View>
  );
};

export default SharedExpenseDashboard;
