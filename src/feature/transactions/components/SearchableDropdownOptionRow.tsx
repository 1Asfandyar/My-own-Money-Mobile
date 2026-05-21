import { Ionicons } from '@expo/vector-icons';
import { memo } from 'react';
import { TouchableOpacity, View } from 'react-native';

import type { SearchableDropdownOptionRowProps } from '@/feature/transactions/types/addTransactionRecord.types';
import ThemedText from '@/theme/components/ThemedText';
import { themeColors } from '@/theme/utilities';

const SearchableDropdownOptionRow = ({
  isSelected,
  onSelect,
  option,
}: SearchableDropdownOptionRowProps) => (
  <TouchableOpacity
    activeOpacity={0.75}
    accessibilityRole="button"
    onPress={() => onSelect(option.id)}
    className={`mb-1 flex-row items-center rounded-xl px-3 py-3 ${
      isSelected ? 'bg-primary/10' : 'bg-white'
    }`}
  >
    <View className="h-9 w-9 items-center justify-center rounded-full bg-gray-100">
      <Ionicons
        name={option.iconName ?? 'ellipse-outline'}
        size={18}
        color={option.iconColor ?? themeColors.gray700}
      />
    </View>
    <View className="ml-3 flex-1">
      <ThemedText className="text-sm text-gray-900" numberOfLines={1}>
        {option.label}
      </ThemedText>
      {option.supportingLabel ? (
        <ThemedText className="mt-0.5 text-xs text-gray-500" numberOfLines={1}>
          {option.supportingLabel}
        </ThemedText>
      ) : null}
    </View>
    {isSelected ? (
      <Ionicons name="checkmark-circle" size={20} color={themeColors.primary} />
    ) : null}
  </TouchableOpacity>
);

export default memo(SearchableDropdownOptionRow);
