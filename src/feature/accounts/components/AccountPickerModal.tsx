import { Ionicons } from '@expo/vector-icons';
import { memo, useCallback } from 'react';
import { FlatList, Modal, TouchableOpacity, View } from 'react-native';
import type { ListRenderItem } from 'react-native';

import AccountOptionRow from '@/feature/accounts/components/AccountOptionRow';
import { accountPickerModalStyles } from '@/feature/accounts/components/AccountPickerModal.styles';
import type { AccountPickerModalProps } from '@/feature/accounts/types/accountsOverview.types';
import ThemedText from '@/theme/components/ThemedText';
import { themeColors } from '@/theme/utilities';
import type { Account } from '@/types/account.types';

const keyExtractor = (account: Account) => String(account.id);

const AccountPickerModal = ({
  accounts,
  currencies,
  isVisible,
  onClose,
  onSelectAccount,
  selectedAccount,
}: AccountPickerModalProps) => {
  const renderItem = useCallback<ListRenderItem<Account>>(
    ({ item }) => (
      <AccountOptionRow
        account={item}
        currencies={currencies}
        isSelected={item.id === selectedAccount?.id}
        onSelectAccount={onSelectAccount}
      />
    ),
    [currencies, onSelectAccount, selectedAccount?.id],
  );

  return (
    <Modal
      animationType="fade"
      transparent
      visible={isVisible}
      onRequestClose={onClose}
    >
      <View className="flex-1 justify-end bg-black/40">
        <TouchableOpacity
          activeOpacity={1}
          className="flex-1"
          accessibilityRole="button"
          accessibilityLabel="Close account selector"
          onPress={onClose}
        />

        <View className="rounded-t-[32px] bg-white px-6 pb-8 pt-5">
          <View className="mb-5 flex-row items-center justify-between">
            <View>
              <ThemedText className="text-xl text-gray-900" weight="bold">
                Choose account
              </ThemedText>
              <ThemedText className="mt-1 text-sm text-gray-500">
                Switch the balance card view.
              </ThemedText>
            </View>

            <TouchableOpacity
              activeOpacity={0.75}
              accessibilityRole="button"
              accessibilityLabel="Close account selector"
              onPress={onClose}
              className="h-10 w-10 items-center justify-center rounded-full bg-gray-100"
            >
              <Ionicons name="close" size={22} color={themeColors.gray700} />
            </TouchableOpacity>
          </View>

          <FlatList
            data={accounts}
            initialNumToRender={8}
            keyExtractor={keyExtractor}
            keyboardShouldPersistTaps="handled"
            maxToRenderPerBatch={8}
            renderItem={renderItem}
            showsVerticalScrollIndicator={accounts.length > 5}
            style={accountPickerModalStyles.accountList}
            windowSize={5}
          />
        </View>
      </View>
    </Modal>
  );
};

export default memo(AccountPickerModal);
