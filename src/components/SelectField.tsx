import { Ionicons } from '@expo/vector-icons';
import { TouchableOpacity, View } from 'react-native';

import ThemedText from '@/theme/components/ThemedText';
import { themeColors } from '@/theme/utilities';

export type SelectFieldOption<T extends string | number = string | number> = {
  label: string;
  value: T;
};

export type SelectFieldProps<T extends string | number = string | number> = {
  label: string;
  onPress: () => void;
  options: SelectFieldOption<T>[];
  placeholder?: string;
  value: T | null;
};

const SelectField = <T extends string | number>({
  label,
  onPress,
  options,
  placeholder = 'All',
  value,
}: SelectFieldProps<T>) => {
  const selected = options.find((opt) => opt.value === value);
  const hasValue = value !== null && value !== undefined;

  return (
    <TouchableOpacity
      activeOpacity={0.78}
      accessibilityRole="button"
      accessibilityLabel={`Select ${label}`}
      onPress={onPress}
      className={`flex-1 rounded-2xl border px-4 py-3 ${
        hasValue ? 'border-primary bg-primary/10' : 'border-gray-200 bg-white'
      }`}
    >
      <ThemedText
        className={`text-xs uppercase ${hasValue ? 'text-primary' : 'text-gray-500'}`}
        weight="bold"
      >
        {label}
      </ThemedText>
      <View className="mt-1 flex-row items-center justify-between">
        <ThemedText
          className={`flex-1 text-sm ${hasValue ? 'text-gray-900' : 'text-gray-400'}`}
          numberOfLines={1}
          weight="semiBold"
        >
          {selected?.label ?? placeholder}
        </ThemedText>
        <Ionicons
          name="chevron-down"
          size={14}
          color={hasValue ? themeColors.primary : themeColors.gray400}
          style={{ marginLeft: 4 }}
        />
      </View>
    </TouchableOpacity>
  );
};

export default SelectField;
