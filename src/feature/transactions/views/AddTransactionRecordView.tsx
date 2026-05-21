import { Ionicons } from '@expo/vector-icons';
import { useMemo } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import CategoryPickerModal from '@/feature/categories/components/CategoryPickerModal';
import AddFriendModal from '@/feature/transactions/components/AddFriendModal';
import SharedExpenseSplitSheet from '@/feature/transactions/components/SharedExpenseSplitSheet';
import SharedTransactionRecordForm from '@/feature/transactions/components/SharedTransactionRecordForm';
import TransactionRecordFields from '@/feature/transactions/components/TransactionRecordFields';
import TransactionTypeTabs from '@/feature/transactions/components/TransactionTypeTabs';
import type { AddTransactionRecordViewProps } from '@/feature/transactions/types/addTransactionRecord.types';
import ThemedText from '@/theme/components/ThemedText';
import { themeColors } from '@/theme/utilities';

const AddTransactionRecordView = ({ form }: AddTransactionRecordViewProps) => {
  const existingFriendIds = useMemo(
    () => form.friends.map((friend) => friend.id),
    [form.friends],
  );
  const headerTitle = form.isSharedRecord
    ? 'Add an expense'
    : form.values.transactionType === 'income'
      ? 'Add income'
      : 'Add expense';

  const header = (
    <View className="flex-row items-center justify-between px-5 pb-3 pt-2">
      <TouchableOpacity
        activeOpacity={0.76}
        accessibilityRole="button"
        accessibilityLabel="Close add record"
        onPress={form.cancel}
        className="h-11 w-11 items-center justify-center rounded-full"
      >
        <Ionicons name="close" size={33} color={themeColors.gray900} />
      </TouchableOpacity>

      <ThemedText className="text-2xl text-gray-900" weight="semiBold">
        {headerTitle}
      </ThemedText>

      <TouchableOpacity
        activeOpacity={0.76}
        accessibilityRole="button"
        accessibilityState={{ disabled: form.isSubmitDisabled }}
        disabled={form.isSubmitDisabled}
        onPress={form.submit}
        className="min-w-14 items-end py-2"
      >
        {form.isSaving ? (
          <ActivityIndicator color={themeColors.primary} />
        ) : (
          <ThemedText
            className={`text-lg ${
              form.isSubmitDisabled ? 'text-gray-300' : 'text-primary'
            }`}
            weight="bold"
          >
            Save
          </ThemedText>
        )}
      </TouchableOpacity>
    </View>
  );

  if (form.isSharedRecord) {
    return (
      <SafeAreaView
        className="flex-1 bg-white"
        edges={['top', 'left', 'right', 'bottom']}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          className="flex-1"
        >
          {header}

          {form.isLoadingOptions ? (
            <View className="flex-1 items-center justify-center px-6">
              <ActivityIndicator color={themeColors.primary} />
              <ThemedText className="mt-3 text-sm text-gray-500">
                Loading shared expense options
              </ThemedText>
            </View>
          ) : (
            <ScrollView
              className="flex-1"
              contentContainerStyle={{
                paddingBottom: 34,
                paddingHorizontal: 20,
                paddingTop: 10,
              }}
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
            >
              {form.formError ? (
                <View className="mb-5 rounded-2xl bg-red-50 px-4 py-3">
                  <ThemedText className="text-sm text-red-600">
                    {form.formError}
                  </ThemedText>
                </View>
              ) : null}

              <SharedTransactionRecordForm form={form} />
            </ScrollView>
          )}
          <CategoryPickerModal
            isVisible={form.isCategoryPickerVisible}
            options={form.categoryOptions}
            query={form.categoryPickerQuery}
            selectedId={form.selectedCategoryId}
            onClose={form.closeCategoryPicker}
            onQueryChange={form.setCategoryPickerQuery}
            onSelect={form.selectCategory}
          />

          <SharedExpenseSplitSheet
            currencyId={form.selectedAccountCurrencyId}
            error={form.fieldErrors.splitValues}
            isVisible={form.isSplitSheetVisible}
            method={form.values.splitMethod}
            participants={form.splitParticipants}
            totalAmountCents={form.totalAmountCents}
            values={form.values.splitValues}
            onChangeMethod={form.updateSplitMethod}
            onChangeValue={form.updateSplitValue}
            onClose={form.closeSplitSheet}
          />

          <AddFriendModal
            emailQuery={form.friendEmailQuery}
            error={form.friendSearchError}
            existingFriendIds={existingFriendIds}
            isAdding={form.isAddingFriend}
            isSearching={form.isSearchingFriend}
            isVisible={form.isAddFriendModalVisible}
            onAddUser={form.addFriend}
            onChangeEmail={form.setFriendEmailQuery}
            onClose={form.closeAddFriendModal}
            onSearch={form.searchFriendByEmail}
            results={form.friendSearchResults}
          />
        </KeyboardAvoidingView>
        
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-white" edges={['top', 'left', 'right', 'bottom']}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        className="flex-1"
      >
        {header}

        <ScrollView
          className="flex-1"
          contentContainerStyle={{
            paddingBottom: 28,
            paddingHorizontal: 20,
            paddingTop: 16,
          }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <TransactionTypeTabs
            selectedType={form.values.transactionType}
            onSelectType={form.updateTransactionType}
          />

          {form.formError ? (
            <View className="mt-5 rounded-2xl bg-red-50 px-4 py-3">
              <ThemedText className="text-sm text-red-600">
                {form.formError}
              </ThemedText>
            </View>
          ) : null}

          {form.isLoadingOptions ? (
            <View className="mt-10 items-center justify-center py-8">
              <ActivityIndicator color={themeColors.primary} />
              <ThemedText className="mt-3 text-sm text-gray-500">
                Loading form options
              </ThemedText>
            </View>
          ) : (
            <View className="mt-6">
              <TransactionRecordFields form={form} />
            </View>
          )}
        </ScrollView>

        <CategoryPickerModal
          isVisible={form.isCategoryPickerVisible}
          options={form.categoryOptions}
          query={form.categoryPickerQuery}
          selectedId={form.selectedCategoryId}
          onClose={form.closeCategoryPicker}
          onQueryChange={form.setCategoryPickerQuery}
          onSelect={form.selectCategory}
        />
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default AddTransactionRecordView;
