import { Ionicons } from '@expo/vector-icons';
import { useCallback, useMemo } from 'react';
import {
  FlatList,
  Modal,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import type { ListRenderItem } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import CategoryOptionRow from '@/feature/categories/components/CategoryOptionRow';
import { categoryPickerModalStyles } from '@/feature/categories/components/CategoryPickerModal.styles';
import type {
  AddTransactionRecordDropdownOption,
  CategoryPickerModalProps,
} from '@/feature/transactions/types/addTransactionRecord.types';
import ThemedText from '@/theme/components/ThemedText';
import { fontFamilies } from '@/theme/fonts';
import { themeColors, typography } from '@/theme/utilities';

const keyExtractor = (option: AddTransactionRecordDropdownOption) =>
  String(option.id);

const CategoryPickerModal = ({
  isVisible,
  onClose,
  onQueryChange,
  onSelect,
  options,
  query,
  selectedId,
}: CategoryPickerModalProps) => {
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

  const closeModal = () => {
    onClose();
  };
  const selectOption = useCallback(
    (id: number) => {
      onSelect(id);
      onClose();
    },
    [onClose, onSelect],
  );
  const renderItem = useCallback<ListRenderItem<AddTransactionRecordDropdownOption>>(
    ({ item }) => (
      <CategoryOptionRow
        isSelected={item.id === selectedId}
        onSelect={selectOption}
        option={item}
      />
    ),
    [selectOption, selectedId],
  );

  return (
    <Modal
      animationType="slide"
      transparent
      visible={isVisible}
      onRequestClose={closeModal}
    >
      <View className="flex-1 justify-end bg-black/40">
        <TouchableOpacity
          activeOpacity={1}
          className="flex-1"
          accessibilityRole="button"
          accessibilityLabel="Close category picker"
          onPress={closeModal}
        />

        <SafeAreaView
          edges={['bottom']}
          className="rounded-t-[28px] bg-white"
          style={{ height: '78%' }}
        >
          <View className="px-5 pt-5">
            <View className="mb-4 flex-row items-center justify-between">
              <ThemedText className="text-xl text-gray-900" weight="bold">
                Categories
              </ThemedText>

              <TouchableOpacity
                activeOpacity={0.75}
                accessibilityRole="button"
                accessibilityLabel="Close category picker"
                onPress={closeModal}
                className="h-10 w-10 items-center justify-center rounded-full bg-gray-100"
              >
                <Ionicons name="close" size={22} color={themeColors.gray700} />
              </TouchableOpacity>
            </View>

            <View className="mb-3 flex-row items-center rounded-xl border border-gray-100 bg-gray-50 px-3 py-3">
              <Ionicons name="search" size={18} color={themeColors.gray500} />
              <TextInput
                autoFocus
                value={query}
                onChangeText={onQueryChange}
                placeholder="Search categories"
                placeholderTextColor={themeColors.gray400}
                className={`${typography.primaryControlSize} ml-2 flex-1 text-gray-800`}
                style={{ fontFamily: fontFamilies.regular }}
              />
            </View>
          </View>

          <FlatList
            data={filteredOptions}
            initialNumToRender={10}
            keyExtractor={keyExtractor}
            keyboardShouldPersistTaps="handled"
            ListEmptyComponent={
              <View className="items-center px-3 py-8">
                <ThemedText className="text-sm text-gray-500">
                  No categories found
                </ThemedText>
              </View>
            }
            maxToRenderPerBatch={10}
            renderItem={renderItem}
            showsVerticalScrollIndicator={filteredOptions.length > 6}
            contentContainerStyle={{ paddingBottom: 24, paddingHorizontal: 20 }}
            style={categoryPickerModalStyles.optionList}
            windowSize={6}
          />
        </SafeAreaView>
      </View>
    </Modal>
  );
};

export default CategoryPickerModal;
