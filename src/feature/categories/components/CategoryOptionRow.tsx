import { Ionicons } from '@expo/vector-icons';
import { memo } from 'react';
import { TouchableOpacity, View } from 'react-native';

import type { CategoryOptionRowProps } from '@/feature/transactions/types/addTransactionRecord.types';
import ThemedText from '@/theme/components/ThemedText';
import { themeColors } from '@/theme/utilities';

const CategoryOptionRow = ({
  isSelected,
  onSelect,
  option,
}: CategoryOptionRowProps) => (
  <TouchableOpacity
    activeOpacity={0.78}
    accessibilityRole="button"
    onPress={() => onSelect(option.id)}
    className={`mb-2 flex-row items-center rounded-2xl border px-4 py-4 ${
      isSelected ? 'border-primary bg-primary/10' : 'border-gray-100 bg-white'
    }`}
  >
    <View className="h-11 w-11 items-center justify-center rounded-full bg-gray-100">
      <Ionicons
        name={option.iconName ?? 'pricetag'}
        size={20}
        color={option.iconColor ?? themeColors.primary}
      />
    </View>

    <ThemedText
      className="ml-3 flex-1 text-base text-gray-900"
      weight="semiBold"
      numberOfLines={1}
    >
      {option.label}
    </ThemedText>

    {isSelected ? (
      <Ionicons name="checkmark-circle" size={22} color={themeColors.primary} />
    ) : null}
  </TouchableOpacity>
);

export default memo(CategoryOptionRow);
