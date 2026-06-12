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

import type { AccountFormModalProps } from '@/feature/accounts/types/manageAccounts.types';
import ThemedButton from '@/theme/components/ThemedButton';
import ThemedInput from '@/theme/components/ThemedInput';
import ThemedText from '@/theme/components/ThemedText';
import { themeColors } from '@/theme/utilities';

const AccountFormModal = ({
  accountName,
  balance,
  currencies,
  error,
  isSaving,
  isVisible,
  onChangeAccountName,
  onChangeBalance,
  onClose,
  onSave,
  onSelectCurrency,
  selectedCurrencyId,
}: AccountFormModalProps) => (
  <Modal
    animationType="slide"
    transparent
    visible={isVisible}
    onRequestClose={onClose}
  >
    <View className="flex-1 justify-end bg-black/40">
      <TouchableOpacity
        activeOpacity={1}
        accessibilityLabel="Close add account"
        accessibilityRole="button"
        className="flex-1"
        onPress={onClose}
      />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 8 : 0}
      >
        <SafeAreaView edges={['bottom']} className="rounded-t-[28px] bg-white">
          <View className="px-5 pb-5 pt-5">
            <View className="mb-4 flex-row items-center justify-between">
              <View className="min-w-0 flex-1 pr-3">
                <ThemedText className="text-xl text-gray-900" weight="bold">
                  Add account
                </ThemedText>
                <ThemedText className="mt-1 text-sm text-gray-500">
                  Create a wallet, bank, or cash account.
                </ThemedText>
              </View>

              <TouchableOpacity
                activeOpacity={0.75}
                accessibilityLabel="Close add account"
                accessibilityRole="button"
                className="h-10 w-10 items-center justify-center rounded-full bg-gray-100"
                onPress={onClose}
              >
                <Ionicons name="close" size={22} color={themeColors.gray700} />
              </TouchableOpacity>
            </View>

            <ThemedInput
              autoCapitalize="words"
              leftIcon="wallet-outline"
              onChangeText={onChangeAccountName}
              placeholder="Account name"
              returnKeyType="next"
              value={accountName}
            />

            <ThemedInput
              inlineLabel={
                currencies.find((item) => item.id === selectedCurrencyId)?.code ??
                currencies[0]?.code ??
                ''
              }
              keyboardType="decimal-pad"
              onChangeText={onChangeBalance}
              placeholder="Opening balance"
              value={balance}
            />

            <ThemedText className="mb-2 mt-1 text-xs uppercase tracking-wide text-gray-500">
              Currency
            </ThemedText>
            <ScrollView
              horizontal
              keyboardShouldPersistTaps="handled"
              showsHorizontalScrollIndicator={false}
            >
              <View className="flex-row">
                {currencies.map((currency) => {
                  const isSelected = currency.id === selectedCurrencyId;

                  return (
                    <TouchableOpacity
                      key={currency.id}
                      activeOpacity={0.76}
                      accessibilityLabel={`Use ${currency.name}`}
                      accessibilityRole="button"
                      className={`mr-2 rounded-full border px-4 py-2 ${
                        isSelected
                          ? 'border-primary bg-primary/10'
                          : 'border-gray-200 bg-white'
                      }`}
                      onPress={() => onSelectCurrency(currency.id)}
                    >
                      <ThemedText
                        className={isSelected ? 'text-primary' : 'text-gray-600'}
                        weight="semiBold"
                      >
                        {currency.code}
                      </ThemedText>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </ScrollView>

            {error ? (
              <ThemedText className="mt-3 text-sm text-red-500">
                {error}
              </ThemedText>
            ) : null}

            <ThemedButton
              title="Create account"
              leftIcon="add-circle-outline"
              loading={isSaving}
              disabled={!accountName.trim()}
              onPress={onSave}
              containerClassName="mt-5"
            />
          </View>
        </SafeAreaView>
      </KeyboardAvoidingView>
    </View>
  </Modal>
);

export default AccountFormModal;
