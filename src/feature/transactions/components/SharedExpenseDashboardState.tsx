import { Ionicons } from '@expo/vector-icons';
import { ActivityIndicator, View } from 'react-native';

import type { SharedExpenseDashboardErrorStateProps } from '@/feature/transactions/types/sharedExpenseDashboard.types';
import ThemedButton from '@/theme/components/ThemedButton';
import ThemedText from '@/theme/components/ThemedText';
import { themeColors } from '@/theme/utilities';

export const SharedExpenseDashboardLoadingState = () => (
  <View className="items-center py-7">
    <ActivityIndicator color={themeColors.primary} />
    <ThemedText className="mt-3 text-sm text-gray-500">
      Loading shared expenses
    </ThemedText>
  </View>
);

export const SharedExpenseDashboardErrorState = ({
  error,
  onRetry,
}: SharedExpenseDashboardErrorStateProps) => (
  <View className="rounded-2xl border border-gray-200 bg-white px-4 py-5">
    <ThemedText className="text-base text-gray-900" weight="semiBold">
      Shared expenses unavailable
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

export const SharedExpenseDashboardEmptyState = () => (
  <View className="mt-4 items-center rounded-2xl border border-dashed border-gray-200 bg-white px-4 py-7">
    <View className="h-12 w-12 items-center justify-center rounded-full bg-lightBlue">
      <Ionicons name="people-outline" size={24} color={themeColors.primary} />
    </View>
    <ThemedText className="mt-4 text-base text-gray-900" weight="semiBold">
      No shared expenses yet
    </ThemedText>
    <ThemedText className="mt-2 text-center text-sm leading-5 text-gray-500">
      Shared expenses with friends will appear here once they are added to this
      account.
    </ThemedText>
  </View>
);
