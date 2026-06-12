import { Ionicons } from '@expo/vector-icons';
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import {
  CATEGORY_MANAGEMENT_COLOR_OPTIONS,
  CATEGORY_MANAGEMENT_ICON_OPTIONS,
} from '@/feature/categories/constants/categoryManagement.constants';
import type { CategoryFormModalProps } from '@/feature/categories/types/manageCategories.types';
import ThemedButton from '@/theme/components/ThemedButton';
import ThemedInput from '@/theme/components/ThemedInput';
import ThemedText from '@/theme/components/ThemedText';
import { themeColors } from '@/theme/utilities';

const CategoryFormModal = ({
  categoryName,
  categoryType,
  color,
  error,
  icon,
  isSaving,
  isVisible,
  onChangeName,
  onClose,
  onSave,
  onSelectColor,
  onSelectIcon,
  onSelectType,
}: CategoryFormModalProps) => (
  <Modal
    animationType="slide"
    transparent
    visible={isVisible}
    onRequestClose={onClose}
  >
    <View className="flex-1 justify-end bg-black/40">
      <TouchableOpacity
        activeOpacity={1}
        accessibilityLabel="Close add category"
        accessibilityRole="button"
        className="flex-1"
        onPress={onClose}
      />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 8 : 0}
      >
        <SafeAreaView edges={['bottom']} className="rounded-t-[28px] bg-white">
          <ScrollView
            contentContainerStyle={{ paddingBottom: 20, paddingHorizontal: 20 }}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <View className="flex-row items-center justify-between pb-4 pt-5">
              <View className="min-w-0 flex-1 pr-3">
                <ThemedText className="text-xl text-gray-900" weight="bold">
                  Add category
                </ThemedText>
                <ThemedText className="mt-1 text-sm text-gray-500">
                  Choose how the category appears in transactions.
                </ThemedText>
              </View>
              <TouchableOpacity
                activeOpacity={0.75}
                accessibilityLabel="Close add category"
                accessibilityRole="button"
                className="h-10 w-10 items-center justify-center rounded-full bg-gray-100"
                onPress={onClose}
              >
                <Ionicons name="close" size={22} color={themeColors.gray700} />
              </TouchableOpacity>
            </View>

            <ThemedInput
              autoCapitalize="words"
              leftIcon="pricetag-outline"
              onChangeText={onChangeName}
              placeholder="Category name"
              value={categoryName}
            />

            <ThemedText className="mb-2 mt-2 text-xs uppercase tracking-wide text-gray-500">
              Type
            </ThemedText>
            <View className="flex-row">
              {(['expense', 'income'] as const).map((type) => {
                const isSelected = type === categoryType;

                return (
                  <TouchableOpacity
                    key={type}
                    activeOpacity={0.76}
                    accessibilityLabel={`Use ${type} category`}
                    accessibilityRole="button"
                    className={`mr-2 flex-1 rounded-xl border px-4 py-3 ${
                      isSelected
                        ? 'border-primary bg-primary/10'
                        : 'border-gray-200 bg-white'
                    }`}
                    onPress={() => onSelectType(type)}
                  >
                    <ThemedText
                      className={`text-center capitalize ${
                        isSelected ? 'text-primary' : 'text-gray-600'
                      }`}
                      weight="semiBold"
                    >
                      {type}
                    </ThemedText>
                  </TouchableOpacity>
                );
              })}
            </View>

            <ThemedText className="mb-2 mt-5 text-xs uppercase tracking-wide text-gray-500">
              Icon
            </ThemedText>
            <View className="flex-row flex-wrap">
              {CATEGORY_MANAGEMENT_ICON_OPTIONS.map((option) => {
                const isSelected = option.icon === icon;

                return (
                  <TouchableOpacity
                    key={option.icon}
                    activeOpacity={0.76}
                    accessibilityLabel={option.label}
                    accessibilityRole="button"
                    className={`mb-2 mr-2 h-12 w-12 items-center justify-center rounded-xl border ${
                      isSelected
                        ? 'border-primary bg-primary/10'
                        : 'border-gray-200 bg-white'
                    }`}
                    onPress={() => onSelectIcon(option.icon)}
                  >
                    <Ionicons
                      name={option.icon}
                      size={21}
                      color={isSelected ? themeColors.primary : themeColors.gray600}
                    />
                  </TouchableOpacity>
                );
              })}
            </View>

            <ThemedText className="mb-2 mt-3 text-xs uppercase tracking-wide text-gray-500">
              Color
            </ThemedText>
            <View className="flex-row flex-wrap">
              {CATEGORY_MANAGEMENT_COLOR_OPTIONS.map((option) => {
                const isSelected = option === color;

                return (
                  <TouchableOpacity
                    key={option}
                    activeOpacity={0.76}
                    accessibilityLabel={`Use color ${option}`}
                    accessibilityRole="button"
                    className="mb-2 mr-3 h-10 w-10 items-center justify-center rounded-full"
                    onPress={() => onSelectColor(option)}
                    style={{ backgroundColor: option }}
                  >
                    {isSelected ? (
                      <Ionicons name="checkmark" size={20} color="#FFFFFF" />
                    ) : null}
                  </TouchableOpacity>
                );
              })}
            </View>

            {error ? (
              <ThemedText className="mt-2 text-sm text-red-500">
                {error}
              </ThemedText>
            ) : null}

            <ThemedButton
              title="Create category"
              leftIcon="add-circle-outline"
              containerClassName="mt-4"
              disabled={!categoryName.trim()}
              loading={isSaving}
              onPress={onSave}
            />
          </ScrollView>
        </SafeAreaView>
      </KeyboardAvoidingView>
    </View>
  </Modal>
);

export default CategoryFormModal;
