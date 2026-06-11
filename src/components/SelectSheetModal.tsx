import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import {
  FlatList,
  Modal,
  Pressable,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

import type { SelectFieldOption } from '@/components/SelectField';
import ThemedText from '@/theme/components/ThemedText';
import { fontFamilies } from '@/theme/fonts';
import { themeColors } from '@/theme/utilities';

export type SelectSheetModalProps<T extends string | number = string | number> = {
  allLabel?: string;
  isVisible: boolean;
  label: string;
  onClose: () => void;
  onSelect: (value: T | null) => void;
  options: SelectFieldOption<T>[];
  searchable?: boolean;
  value: T | null;
};

type ListItem<T extends string | number> = {
  label: string;
  value: T | null;
};

const SelectSheetModal = <T extends string | number>({
  allLabel = 'All',
  isVisible,
  label,
  onClose,
  onSelect,
  options,
  searchable = false,
  value,
}: SelectSheetModalProps<T>) => {
  const [search, setSearch] = useState('');

  const filtered = search.trim()
    ? options.filter((opt) =>
        opt.label.toLowerCase().includes(search.toLowerCase()),
      )
    : options;

  const items: ListItem<T>[] = [{ label: allLabel, value: null }, ...filtered];

  return (
    <Modal
      animationType="slide"
      onRequestClose={onClose}
      transparent
      visible={isVisible}
    >
      <View style={styles.root}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`Close ${label} selector`}
          onPress={onClose}
          style={styles.backdrop}
        />

        <View
          className="rounded-t-3xl border border-gray-200 bg-white px-5 pb-6 pt-4"
          style={styles.sheet}
        >
          <View className="mb-4 h-1.5 w-12 self-center rounded-full bg-gray-200" />

          <View className="flex-row items-center justify-between">
            <ThemedText className="text-xl text-gray-900" weight="bold">
              {label}
            </ThemedText>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={`Close ${label} selector`}
              onPress={onClose}
              className="h-10 w-10 items-center justify-center rounded-full bg-gray-100"
            >
              <Ionicons name="close" size={22} color={themeColors.gray700} />
            </Pressable>
          </View>

          {searchable ? (
            <View className="mt-4 flex-row items-center rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5">
              <Ionicons name="search" size={16} color={themeColors.gray400} />
              <TextInput
                value={search}
                onChangeText={setSearch}
                placeholder="Search..."
                placeholderTextColor={themeColors.gray400}
                autoCapitalize="none"
                autoCorrect={false}
                className="ml-2 flex-1 text-sm text-gray-800"
                style={{ fontFamily: fontFamilies.regular }}
              />
            </View>
          ) : null}

          <FlatList
            data={items}
            keyExtractor={(item) => String(item.value ?? '__all__')}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
            style={styles.list}
            renderItem={({ item }) => {
              const isSelected =
                item.value === null ? value === null : item.value === value;

              return (
                <TouchableOpacity
                  activeOpacity={0.78}
                  accessibilityRole="button"
                  accessibilityLabel={item.label}
                  onPress={() => {
                    onSelect(item.value);
                    onClose();
                  }}
                  className={`mb-2 flex-row items-center rounded-xl px-4 py-3 ${
                    isSelected ? 'bg-primary/10' : 'bg-gray-50'
                  }`}
                >
                  <ThemedText
                    className={`flex-1 text-base ${isSelected ? 'text-primary' : 'text-gray-700'}`}
                    numberOfLines={1}
                    weight={isSelected ? 'semiBold' : 'regular'}
                  >
                    {item.label}
                  </ThemedText>
                  {isSelected ? (
                    <Ionicons
                      name="checkmark"
                      size={18}
                      color={themeColors.primary}
                    />
                  ) : null}
                </TouchableOpacity>
              );
            }}
          />
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(17, 24, 39, 0.42)',
  },
  list: {
    marginTop: 12,
    maxHeight: 320,
  },
  root: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  sheet: {
    maxHeight: '80%',
  },
});

export default SelectSheetModal;
