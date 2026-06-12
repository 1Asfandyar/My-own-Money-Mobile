import { Ionicons } from '@expo/vector-icons';
import { ActivityIndicator, TouchableOpacity, View } from 'react-native';

import type { CategoryManagementCardProps } from '@/feature/categories/types/manageCategories.types';
import {
  getCategoryDisplayColor,
  getCategoryDisplayIcon,
  getCategorySoftColor,
} from '@/feature/categories/utils/categoryDisplay.utils';
import ThemedText from '@/theme/components/ThemedText';

const CategoryManagementCard = ({
  category,
  isDeleting,
  onDelete,
}: CategoryManagementCardProps) => {
  const color = getCategoryDisplayColor(category);

  return (
    <View className="mb-3 rounded-2xl border border-gray-200 bg-white px-4 py-4">
      <View className="flex-row items-center">
        <View
          className="h-12 w-12 items-center justify-center rounded-2xl"
          style={{ backgroundColor: getCategorySoftColor(color) }}
        >
          <Ionicons name={getCategoryDisplayIcon(category)} size={22} color={color} />
        </View>
        <View className="ml-3 min-w-0 flex-1">
          <ThemedText
            className="text-base text-gray-900"
            numberOfLines={1}
            weight="semiBold"
          >
            {category.name}
          </ThemedText>
        </View>
        <View className="rounded-full bg-gray-100 px-3 py-1">
          <ThemedText className="text-xs capitalize text-gray-600" weight="semiBold">
            {category.category_type}
          </ThemedText>
        </View>
      </View>

      <TouchableOpacity
        activeOpacity={0.76}
        accessibilityLabel={`Remove ${category.name}`}
        accessibilityRole="button"
        className="mt-4 flex-row items-center justify-center rounded-xl border border-red-200 bg-red-50 px-4 py-3"
        disabled={isDeleting}
        onPress={() => onDelete(category)}
      >
        {isDeleting ? (
          <ActivityIndicator color="#DC2626" size="small" />
        ) : (
          <>
            <Ionicons name="trash-outline" size={17} color="#DC2626" />
            <ThemedText className="ml-2 text-sm text-red-600" weight="semiBold">
              Remove category
            </ThemedText>
          </>
        )}
      </TouchableOpacity>
    </View>
  );
};

export default CategoryManagementCard;
