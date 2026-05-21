import { View } from 'react-native';

import CategoryBreakdownList from '@/feature/categories/components/CategoryBreakdownList';
import {
  CategoryDashboardEmptyState,
  CategoryDashboardErrorState,
  CategoryDashboardLoadingState,
} from '@/feature/categories/components/CategoryDashboardState';
import { usePersonalCategoryDashboard } from '@/feature/categories/hooks/usePersonalCategoryDashboard';
import type { PersonalCategoryDashboardProps } from '@/feature/categories/types/categoryDashboard.types';

const PersonalCategoryDashboard = ({
  categories,
  currencies,
  displayCurrency,
  error,
  isLoading,
  onRetry,
  onSelectCategory,
  selectedAccount,
  totalExpenseCents,
  totalIncomeCents,
}: PersonalCategoryDashboardProps) => {
  const dashboard = usePersonalCategoryDashboard({
    categories,
    currencies,
    displayCurrency,
    totalExpenseCents,
    totalIncomeCents,
  });

  if (isLoading) {
    return <CategoryDashboardLoadingState />;
  }

  if (error) {
    return <CategoryDashboardErrorState error={error} onRetry={onRetry} />;
  }

  if (!selectedAccount) {
    return null;
  }

  return (
    <View className="bg-gray-100">
      {dashboard.hasCategories ? (
        <CategoryBreakdownList
          items={dashboard.items}
          onSelectCategory={onSelectCategory}
        />
      ) : (
        <CategoryDashboardEmptyState />
      )}
    </View>
  );
};

export default PersonalCategoryDashboard;
