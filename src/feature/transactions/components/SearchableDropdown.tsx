import { Ionicons } from '@expo/vector-icons';
import { useCallback, useMemo } from 'react';
import { ScrollView, TextInput, TouchableOpacity, View } from 'react-native';

import { searchableDropdownStyles } from '@/feature/transactions/components/SearchableDropdown.styles';
import SearchableDropdownOptionRow from '@/feature/transactions/components/SearchableDropdownOptionRow';
import type { SearchableDropdownProps } from '@/feature/transactions/types/addTransactionRecord.types';
import ThemedText from '@/theme/components/ThemedText';
import { fontFamilies } from '@/theme/fonts';
import { themeColors, typography } from '@/theme/utilities';

const SearchableDropdown = ({
  error,
  iconName,
  inlineLabel,
  isOpen,
  isProminent = false,
  label,
  onBlur,
  onClose,
  onOpen,
  onQueryChange,
  onSelect,
  options,
  placeholder,
  query,
  selectedId,
}: SearchableDropdownProps) => {
  const selectedOption = options.find((option) => option.id === selectedId);
  const normalizedQuery = query.trim().toLowerCase();
  const filteredOptions = useMemo(
    () =>
      normalizedQuery.length === 0
        ? options
        : options.filter((option) =>
            option.label.toLowerCase().includes(normalizedQuery),
          ),
    [normalizedQuery, options],
  );

  const openDropdown = () => {
    onOpen();
  };

  const closeDropdown = (shouldValidate = true) => {
    onClose();
    if (shouldValidate) {
      onBlur?.();
    }
  };
  const selectOption = useCallback(
    (id: number) => {
      onSelect(id);
      onClose();
    },
    [onClose, onSelect],
  );

  return (
    <View className={`relative mb-5 ${isOpen ? 'z-40' : 'z-10'}`}>
      {label ? (
        <ThemedText className="mb-1 text-sm text-gray-600">{label}</ThemedText>
      ) : null}

      <TouchableOpacity
        activeOpacity={0.8}
        accessibilityRole="button"
        accessibilityState={{ expanded: isOpen }}
        onPress={() => {
          if (isOpen) {
            closeDropdown();
            return;
          }

          openDropdown();
        }}
        className={`flex-row items-center rounded-xl border px-4 ${
          isProminent ? 'bg-primary/5 py-5' : 'bg-white py-4'
        } ${
          error
            ? 'border-red-400'
            : isProminent
              ? 'border-primary/30'
              : 'border-gray-200'
        }`}
      >
        {inlineLabel ? (
          <>
            <ThemedText
              className={`mr-1 ${isProminent ? 'text-base text-gray-900' : 'text-sm text-gray-600'}`}
              weight="semiBold"
            >
              {inlineLabel}
            </ThemedText>
            <Ionicons
              name={iconName}
              size={18}
              color={themeColors.primary}
              style={{ marginRight: 10 }}
            />
            <View className="mr-3 h-6 w-px bg-gray-300" />
          </>
        ) : (
          <Ionicons
            name={iconName}
            size={20}
            color={themeColors.primary}
            style={{ marginRight: 8 }}
          />
        )}
        <ThemedText
          className={`flex-1 ${
            selectedOption ? 'text-gray-800' : 'text-gray-400'
          } ${isProminent ? 'text-base' : ''}`}
          weight={isProminent ? 'semiBold' : 'regular'}
          numberOfLines={1}
        >
          {selectedOption?.label ?? placeholder}
        </ThemedText>
        <Ionicons
          name={isOpen ? 'chevron-up' : 'chevron-down'}
          size={20}
          color={themeColors.gray500}
        />
      </TouchableOpacity>

      {error ? (
        <ThemedText className="mt-1 text-xs text-red-500">{error}</ThemedText>
      ) : null}

      {isOpen ? (
        <View className="absolute left-0 right-0 top-[72px] z-50 rounded-2xl border border-gray-200 bg-white p-3 shadow-lg">
          <View className="mb-2 flex-row items-center rounded-xl border border-gray-100 bg-gray-50 px-3 py-2">
            <Ionicons name="search" size={18} color={themeColors.gray500} />
            <TextInput
              autoFocus
              value={query}
              onChangeText={onQueryChange}
              placeholder="Search"
              placeholderTextColor={themeColors.gray400}
              className={`${typography.primaryControlSize} ml-2 flex-1 text-gray-800`}
              style={{ fontFamily: fontFamilies.regular }}
            />
          </View>

          <ScrollView
            nestedScrollEnabled
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={filteredOptions.length > 4}
            style={searchableDropdownStyles.optionList}
          >
            {filteredOptions.map((option) => (
              <SearchableDropdownOptionRow
                key={option.id}
                isSelected={option.id === selectedId}
                onSelect={selectOption}
                option={option}
              />
            ))}

            {filteredOptions.length === 0 ? (
              <View className="items-center px-3 py-6">
                <ThemedText className="text-sm text-gray-500">
                  No matches found
                </ThemedText>
              </View>
            ) : null}
          </ScrollView>
        </View>
      ) : null}
    </View>
  );
};

export default SearchableDropdown;
