import { Ionicons } from '@expo/vector-icons';
import { TouchableOpacity, View } from 'react-native';

import SearchableDropdown from '@/feature/transactions/components/SearchableDropdown';
import type { AddTransactionRecordViewModel } from '@/feature/transactions/types/addTransactionRecord.types';
import ThemedInput from '@/theme/components/ThemedInput';
import ThemedText from '@/theme/components/ThemedText';
import { themeColors } from '@/theme/utilities';

type TransactionRecordFieldsProps = {
  form: AddTransactionRecordViewModel;
};

const TransactionRecordFields = ({ form }: TransactionRecordFieldsProps) => (
  <>
    <ThemedInput
      inlineLabel="Amount"
      inlineLabelIcon="cash"
      isProminent
      value={form.values.amount}
      onChangeText={(value) => form.updateField('amount', value)}
      onBlur={() => form.validateField('amount')}
      placeholder="0.00"
      keyboardType="decimal-pad"
      containerClassName="mb-4"
      error={form.fieldErrors.amount}
    />

    <SearchableDropdown
      inlineLabel="Account"
      iconName="wallet"
      isOpen={form.openDropdown === 'account'}
      isProminent
      options={form.accountOptions}
      query={form.accountDropdownQuery}
      selectedId={form.selectedAccountId}
      onOpen={form.openAccountDropdown}
      onClose={form.closeDropdown}
      onQueryChange={form.setAccountDropdownQuery}
      onSelect={form.selectAccount}
      onBlur={() => form.validateField('accountId')}
      placeholder="Choose account"
      error={form.fieldErrors.accountId}
    />

    <View className="mb-5">
      <TouchableOpacity
        activeOpacity={0.8}
        accessibilityRole="button"
        onPress={form.openCategoryPicker}
        className={`flex-row items-center rounded-xl border bg-white px-4 py-4 ${
          form.fieldErrors.categoryId ? 'border-red-400' : 'border-gray-200'
        }`}
      >
        <Ionicons
          name={form.selectedCategory?.iconName ?? 'pricetag'}
          size={20}
          color={form.selectedCategory?.iconColor ?? themeColors.primary}
          style={{ marginRight: 8 }}
        />
        <ThemedText
          className={`flex-1 ${
            form.selectedCategory ? 'text-gray-800' : 'text-gray-400'
          }`}
          numberOfLines={1}
        >
          {form.selectedCategory?.label ?? 'Choose category'}
        </ThemedText>
        <Ionicons name="chevron-forward" size={20} color={themeColors.gray500} />
      </TouchableOpacity>

      {form.fieldErrors.categoryId ? (
        <ThemedText className="mt-1 text-xs text-red-500">
          {form.fieldErrors.categoryId}
        </ThemedText>
      ) : null}
    </View>

    <ThemedInput
      leftIcon="create-outline"
      value={form.values.note}
      onChangeText={(value) => form.updateField('note', value)}
      placeholder="Optional details"
      multiline
      textAlignVertical="top"
      inputClassName="min-h-20"
      borderClassName="items-start"
      error={form.fieldErrors.note}
    />
  </>
);

export default TransactionRecordFields;
