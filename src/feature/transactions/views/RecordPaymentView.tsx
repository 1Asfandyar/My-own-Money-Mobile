import { Ionicons } from '@expo/vector-icons';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import AccountPickerModal from '@/feature/accounts/components/AccountPickerModal';
import SharedExpenseAvatar from '@/feature/transactions/components/SharedExpenseAvatar';
import type { RecordPaymentViewProps } from '@/feature/transactions/types/settlement.types';
import ThemedButton from '@/theme/components/ThemedButton';
import ThemedInput from '@/theme/components/ThemedInput';
import ThemedText from '@/theme/components/ThemedText';
import { formatCents } from '@/utils/currency';

const RecordPaymentView = ({ payment }: RecordPaymentViewProps) => (
  <SafeAreaView
    className="flex-1 bg-white"
    edges={['top', 'left', 'right', 'bottom']}
  >
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      className="flex-1 px-5"
    >
      <View className="flex-row items-center justify-between pb-3 pt-2">
        <TouchableOpacity
          activeOpacity={0.76}
          accessibilityRole="button"
          accessibilityLabel="Close record payment"
          onPress={payment.close}
          className="h-11 w-11 items-center justify-center rounded-full"
        >
          <Ionicons name="close" size={32} color="#111827" />
        </TouchableOpacity>
        <ThemedText className="text-xl text-gray-900" weight="semiBold">
          Record a payment
        </ThemedText>
        <View className="h-11 w-11" />
      </View>

      {payment.isLoading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator />
          <ThemedText className="mt-3 text-sm text-gray-500">
            Loading payment form
          </ThemedText>
        </View>
      ) : (
        <View className="flex-1 justify-between pb-5">
          <View className="pt-24">
            <View className="flex-row items-center justify-center">
              <SharedExpenseAvatar
                user={payment.isDebtorView ? payment.currentUser : payment.friendUser}
                size={72}
              />
              <Ionicons
                name="arrow-forward"
                size={38}
                color="#4B5563"
                style={{ marginHorizontal: 28 }}
              />
              <SharedExpenseAvatar
                user={payment.isDebtorView ? payment.friendUser : payment.currentUser}
                size={72}
              />
            </View>

            <ThemedText className="mt-8 text-center text-base text-gray-800">
              {payment.isDebtorView
                ? `You paid ${payment.friendName}`
                : `${payment.friendName} paid you`}
            </ThemedText>

            <ThemedInput
              inlineLabel={
                payment.account
                  ? payment.currencies.find(
                      (item) => item.id === payment.account?.currency_id,
                    )?.symbol ?? 'Rs'
                  : 'Rs'
              }
              isProminent
              value={payment.amount}
              onChangeText={payment.setAmount}
              keyboardType="decimal-pad"
              placeholder="0.00"
              containerClassName="mx-auto mt-5 w-56"
              inputClassName="text-center text-4xl"
              error={payment.amountError}
            />

            <View className="mt-5 rounded-2xl border border-gray-100 bg-gray-50 px-4 py-3">
              <TouchableOpacity
                activeOpacity={0.78}
                accessibilityRole="button"
                accessibilityLabel={
                  payment.isDebtorView
                    ? 'Change payment account'
                    : 'Change receiving account'
                }
                className="flex-row items-center"
                onPress={payment.openAccountPicker}
              >
                <Ionicons name="wallet-outline" size={20} color="#6B7280" />
                <View className="ml-3 flex-1">
                  <ThemedText className="text-xs text-gray-500">
                    {payment.isDebtorView ? 'Paid from' : 'Received into'}
                  </ThemedText>
                  <ThemedText
                    className="text-sm text-gray-900"
                    weight="semiBold"
                  >
                    {payment.account?.name ?? 'Choose account'}
                  </ThemedText>
                </View>
                {payment.account ? (
                  <ThemedText className="text-xs text-gray-500">
                    {formatCents(
                      payment.account.current_balance_cents,
                      payment.account.currency_id,
                      payment.currencies,
                    )}
                  </ThemedText>
                ) : null}
                <Ionicons
                  name="chevron-forward"
                  size={18}
                  color="#9CA3AF"
                  style={{ marginLeft: 8 }}
                />
              </TouchableOpacity>

              <View className="mt-4 flex-row items-center border-t border-gray-200 pt-4">
                <Ionicons
                  name="checkmark-circle-outline"
                  size={20}
                  color="#6B7280"
                />
                <View className="ml-3 flex-1">
                  <ThemedText className="text-xs text-gray-500">
                    Transaction
                  </ThemedText>
                  <ThemedText
                    className="text-sm text-gray-900"
                    weight="semiBold"
                  >
                    Settlement
                  </ThemedText>
                </View>
                <Ionicons
                  name="lock-closed-outline"
                  size={17}
                  color="#9CA3AF"
                />
              </View>
            </View>

            <View className="mt-5 flex-row rounded-2xl border border-primary/10 bg-primary/5 px-4 py-3">
              <Ionicons
                name="information-circle-outline"
                size={22}
                color="#0F766E"
              />
              <ThemedText className="ml-3 flex-1 text-sm leading-5 text-gray-600">
                You are recording a payment that happened outside the app. No
                money will be moved.
              </ThemedText>
            </View>

            {payment.error ? (
              <ThemedText className="mt-4 text-center text-sm text-red-500">
                {payment.error}
              </ThemedText>
            ) : null}
          </View>

          <ThemedButton
            title="Record payment"
            loading={payment.isSaving}
            disabled={payment.isSubmitDisabled}
            onPress={payment.submit}
            containerClassName="rounded-full py-5"
            textClassName="text-lg"
          />
        </View>
      )}
    </KeyboardAvoidingView>

    <AccountPickerModal
      accounts={payment.accounts}
      currencies={payment.currencies}
      isVisible={payment.isAccountPickerVisible}
      selectedAccount={payment.account}
      onClose={payment.closeAccountPicker}
      onSelectAccount={payment.selectPaymentAccount}
    />
  </SafeAreaView>
);

export default RecordPaymentView;
