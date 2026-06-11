import { Ionicons } from '@expo/vector-icons';
import { ActivityIndicator, TouchableOpacity, View } from 'react-native';

import ThemedText from '@/theme/components/ThemedText';
import { themeColors } from '@/theme/utilities';

const monthKeyToLabel = (key: string): string => {
  const [year, month] = key.split('-').map(Number);
  return new Date(year, month - 1, 1).toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric',
  });
};

interface MonthNavigatorProps {
  selectedMonthKey: string;
  canGoForward: boolean;
  isLoading: boolean;
  onPreviousMonth: () => void;
  onNextMonth: () => void;
}

const MonthNavigator = ({
  selectedMonthKey,
  canGoForward,
  isLoading,
  onPreviousMonth,
  onNextMonth,
}: MonthNavigatorProps) => (
  <View className="flex-row items-center justify-between px-5 py-3">
    <TouchableOpacity
      activeOpacity={0.7}
      accessibilityRole="button"
      accessibilityLabel="Previous month"
      onPress={onPreviousMonth}
      disabled={isLoading}
      className="h-9 w-9 items-center justify-center rounded-full bg-gray-100"
    >
      {isLoading ? (
        <ActivityIndicator size="small" color={themeColors.gray500} />
      ) : (
        <Ionicons name="chevron-back" size={18} color={themeColors.gray600} />
      )}
    </TouchableOpacity>

    <ThemedText className="text-base text-gray-900" weight="semiBold">
      {monthKeyToLabel(selectedMonthKey)}
    </ThemedText>

    <TouchableOpacity
      activeOpacity={0.7}
      accessibilityRole="button"
      accessibilityLabel="Next month"
      onPress={onNextMonth}
      disabled={isLoading || !canGoForward}
      className="h-9 w-9 items-center justify-center rounded-full bg-gray-100"
    >
      <Ionicons
        name="chevron-forward"
        size={18}
        color={canGoForward ? themeColors.gray600 : themeColors.gray300}
      />
    </TouchableOpacity>
  </View>
);

export default MonthNavigator;
