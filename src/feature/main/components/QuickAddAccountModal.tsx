import { Ionicons } from '@expo/vector-icons';
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import type { QuickAddAccountModalProps } from '@/feature/main/types/mainHeader.types';
import ThemedButton from '@/theme/components/ThemedButton';
import ThemedInput from '@/theme/components/ThemedInput';
import ThemedText from '@/theme/components/ThemedText';
import { themeColors } from '@/theme/utilities';

const QuickAddAccountModal = ({
  accountName,
  balance,
  currencyCode,
  error,
  isSaving,
  isVisible,
  onChangeAccountName,
  onChangeBalance,
  onClose,
  onSave,
}: QuickAddAccountModalProps) => (
  <Modal
    animationType="slide"
    transparent
    visible={isVisible}
    onRequestClose={onClose}
  >
    <View className="flex-1 justify-end bg-black/40">
      <TouchableOpacity
        activeOpacity={1}
        accessibilityRole="button"
        accessibilityLabel="Close add account"
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
              <View className="min-w-0 flex-1">
                <ThemedText className="text-xl text-gray-900" weight="bold">
                  Add account
                </ThemedText>
                <ThemedText className="mt-1 text-sm text-gray-500">
                  Create another wallet, bank, or cash account.
                </ThemedText>
              </View>

              <TouchableOpacity
                activeOpacity={0.75}
                accessibilityRole="button"
                accessibilityLabel="Close add account"
                onPress={onClose}
                className="ml-3 h-10 w-10 items-center justify-center rounded-full bg-gray-100"
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
              inlineLabel={currencyCode}
              keyboardType="decimal-pad"
              onChangeText={onChangeBalance}
              placeholder="Opening balance"
              value={balance}
              error={error}
            />

            <ThemedButton
              title="Create account"
              leftIcon="add-circle-outline"
              loading={isSaving}
              disabled={!accountName.trim()}
              onPress={onSave}
              containerClassName="mt-2"
            />
          </View>
        </SafeAreaView>
      </KeyboardAvoidingView>
    </View>
  </Modal>
);

export default QuickAddAccountModal;
