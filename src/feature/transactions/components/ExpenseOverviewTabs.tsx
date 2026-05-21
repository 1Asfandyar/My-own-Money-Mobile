import { Ionicons } from '@expo/vector-icons';
import { TouchableOpacity, View } from 'react-native';

import type {
  ExpenseOverviewTabConfig,
  ExpenseOverviewTabsProps,
} from '@/feature/transactions/types/expenseOverview.types';
import ThemedText from '@/theme/components/ThemedText';
import { themeColors } from '@/theme/utilities';

const expenseOverviewTabs: ExpenseOverviewTabConfig[] = [
  {
    value: 'personal',
    label: 'Personal',
    iconName: 'person-outline',
  },
  {
    value: 'shared',
    label: 'Shared',
    iconName: 'people-outline',
  },
];

const ExpenseOverviewTabs = ({
  children,
  onSelectTab,
  selectedTab,
}: ExpenseOverviewTabsProps) => (
  <View className="mt-4 flex-1">
    <View accessibilityRole="tablist" className="flex-row rounded-t-2xl bg-gray-100 p-1">
      {expenseOverviewTabs.map((tab) => {
        const isSelected = tab.value === selectedTab;

        return (
          <TouchableOpacity
            key={tab.value}
            activeOpacity={0.8}
            accessibilityRole="tab"
            accessibilityState={{ selected: isSelected }}
            onPress={() => onSelectTab(tab.value)}
            className={`flex-1 flex-row items-center justify-center rounded-xl px-3 py-3 ${
              isSelected ? 'bg-white' : ''
            }`}
          >
            <Ionicons
              name={tab.iconName}
              size={tab.value === 'shared' ? 19 : 18}
              color={isSelected ? themeColors.primary : themeColors.gray500}
            />
            <ThemedText
              className={`ml-2 text-sm ${
                isSelected ? 'text-gray-900' : 'text-gray-500'
              }`}
              weight="semiBold"
            >
              {tab.label}
            </ThemedText>
          </TouchableOpacity>
        );
      })}
    </View>

    <View className="min-h-44 rounded-b-3xl border border-gray-100 bg-gray-100 px-2 py-2">
      {children}
    </View>
  </View>
);

export default ExpenseOverviewTabs;
