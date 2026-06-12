import { useCallback, useMemo } from 'react';
import { FlatList, RefreshControl, View } from 'react-native';
import type { ListRenderItem } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import CategoryFormModal from '@/feature/categories/components/CategoryFormModal';
import CategoryManagementCard from '@/feature/categories/components/CategoryManagementCard';
import type { Category } from '@/feature/categories/types/category.types';
import type { ManageCategoriesViewProps } from '@/feature/categories/types/manageCategories.types';
import ManagementListState from '@/feature/main/components/ManagementListState';
import ManagementScreenHeader from '@/feature/main/components/ManagementScreenHeader';
import ThemedText from '@/theme/components/ThemedText';
import { themeColors } from '@/theme/utilities';

const keyExtractor = (category: Category) => String(category.id);

const ManageCategoriesView = ({ manager }: ManageCategoriesViewProps) => {
  const renderCategory = useCallback<ListRenderItem<Category>>(
    ({ item }) => (
      <CategoryManagementCard
        category={item}
        isDeleting={manager.removingCategoryId === item.id}
        onDelete={manager.onDeleteCategory}
      />
    ),
    [
      manager.onDeleteCategory,
      manager.removingCategoryId,
    ],
  );
  const header = useMemo(
    () => (
      <View className="mb-5">
        <ManagementScreenHeader
          addLabel="Add category"
          onAdd={manager.onOpenAddModal}
          onBack={manager.onBack}
          subtitle="Add and remove the categories used for your transactions."
          title="Manage categories"
        />
        {manager.error && manager.categories.length > 0 ? (
          <View className="mt-4 rounded-xl bg-red-50 px-4 py-3">
            <ThemedText className="text-sm text-red-600">
              {manager.error}
            </ThemedText>
          </View>
        ) : null}
      </View>
    ),
    [
      manager.categories.length,
      manager.error,
      manager.onBack,
      manager.onOpenAddModal,
    ],
  );

  return (
    <SafeAreaView className="flex-1 bg-white" edges={['top', 'left', 'right']}>
      <FlatList
        data={manager.isLoading ? [] : manager.categories}
        contentContainerStyle={{
          flexGrow: 1,
          paddingBottom: 40,
          paddingHorizontal: 20,
          paddingTop: 12,
        }}
        keyExtractor={keyExtractor}
        ListEmptyComponent={
          <ManagementListState
            emptyMessage="Create categories for the income and expenses you track."
            emptyTitle="No categories yet"
            error={manager.error}
            icon="pricetags-outline"
            isLoading={manager.isLoading}
            loadingLabel="Loading categories"
            onAdd={manager.onOpenAddModal}
            onRetry={manager.onRefresh}
          />
        }
        ListHeaderComponent={header}
        refreshControl={
          <RefreshControl
            refreshing={false}
            onRefresh={manager.onRefresh}
            tintColor={themeColors.primary}
          />
        }
        renderItem={renderCategory}
        showsVerticalScrollIndicator={false}
      />

      <CategoryFormModal
        categoryName={manager.categoryName}
        categoryType={manager.categoryType}
        color={manager.color}
        error={manager.formError}
        icon={manager.icon}
        isSaving={manager.isSaving}
        isVisible={manager.isAddModalVisible}
        onChangeName={manager.onChangeName}
        onClose={manager.onCloseAddModal}
        onSave={manager.onSaveCategory}
        onSelectColor={manager.onSelectColor}
        onSelectIcon={manager.onSelectIcon}
        onSelectType={manager.onSelectType}
      />
    </SafeAreaView>
  );
};

export default ManageCategoriesView;
