import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ROUTES } from '@/config/routes';
import AccountPickerModal from '@/feature/accounts/components/AccountPickerModal';
import { listAccounts } from '@/feature/accounts/api/accounts.api';
import { useAccountsOverviewStore } from '@/feature/accounts/store/accountsOverview.store';
import { listCategories } from '@/feature/categories/api/categories.api';
import type { Category } from '@/feature/categories/types/category.types';
import { listCurrencies } from '@/feature/currencies/api/currencies.api';
import { createTransaction } from '@/feature/transactions/api/transactions.api';
import SharedExpenseAvatar from '@/feature/transactions/components/SharedExpenseAvatar';
import { ApiError } from '@/services/api';
import { useAuthStore } from '@/store/auth.store';
import ThemedButton from '@/theme/components/ThemedButton';
import ThemedInput from '@/theme/components/ThemedInput';
import ThemedText from '@/theme/components/ThemedText';
import { fallbackCurrencies, formatCents, moneyInputToCents } from '@/utils/currency';

const centsToInput = (cents: number) => {
  const amount = cents / 100;

  return Number.isInteger(amount)
    ? String(amount)
    : amount.toFixed(2).replace(/0+$/, '').replace(/\.$/, '');
};

const findRefundCategory = (
  categories: Category[],
  transactionType: 'expense' | 'income',
) =>
  categories.find(
    (category) =>
      category.category_type === transactionType &&
      category.name.trim().toLowerCase() === 'refund',
  ) ??
  categories.find(
    (category) =>
      category.category_type === transactionType &&
      /refund|payment|settle/i.test(category.name),
  ) ??
  categories.find((category) => category.category_type === transactionType);

const RecordPaymentScreen = () => {
  const router = useRouter();
  const params = useLocalSearchParams<{
    accountId?: string;
    amountCents?: string;
    balanceType?: 'owes_you' | 'you_owe' | 'settled_up';
    friendId?: string;
    friendName?: string;
  }>();
  const token = useAuthStore((state) => state.token);
  const user = useAuthStore((state) => state.user);
  const storedAccounts = useAccountsOverviewStore((state) => state.accounts);
  const storedCurrencies = useAccountsOverviewStore((state) => state.currencies);
  const setAccounts = useAccountsOverviewStore((state) => state.setAccounts);
  const setCurrencies = useAccountsOverviewStore((state) => state.setCurrencies);
  const [categories, setCategories] = useState<Category[]>([]);
  const [error, setError] = useState('');
  const [amount, setAmount] = useState(
    centsToInput(Math.abs(Number(params.amountCents) || 0)),
  );
  const [isAccountPickerVisible, setIsAccountPickerVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const routeAccountId = Number(params.accountId);
  const [selectedPaymentAccountId, setSelectedPaymentAccountId] = useState<
    number | null
  >(Number.isFinite(routeAccountId) ? routeAccountId : null);
  const friendId = Number(params.friendId);
  const friendName = params.friendName?.trim() || `Friend #${friendId}`;
  const accounts = useMemo(
    () => storedAccounts.filter((account) => !account.is_archived),
    [storedAccounts],
  );
  const currencies = storedCurrencies.length > 0 ? storedCurrencies : fallbackCurrencies;
  const account =
    accounts.find((item) => item.id === selectedPaymentAccountId) ?? accounts[0];
  const isFriendPayingYou = params.balanceType !== 'you_owe';
  const transactionType = isFriendPayingYou ? 'income' : 'expense';
  const refundCategory = useMemo(
    () => findRefundCategory(categories, transactionType),
    [categories, transactionType],
  );
  const amountCents = moneyInputToCents(amount);
  const friendUser = { full_name: friendName, id: friendId || 0 };
  const currentUser = user
    ? {
        avatar_url: user.avatar_url,
        email: user.email,
        full_name: 'You',
        id: user.id,
        mobile_number: user.mobile_number,
        photo_url: user.photo_url,
        profile_image_url: user.profile_image_url,
        profile_photo_url: user.profile_photo_url,
      }
    : { full_name: 'You', id: 0 };

  const loadOptions = useCallback(async () => {
    if (!token) {
      setError('Please sign in again to record this payment.');
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const {
        accounts: currentAccounts,
        currencies: currentCurrencies,
      } = useAccountsOverviewStore.getState();
      const currentActiveAccounts = currentAccounts.filter(
        (currentAccount) => !currentAccount.is_archived,
      );
      const hasStoredAccounts = currentActiveAccounts.length > 0;
      const hasStoredCurrencies = currentCurrencies.length > 0;
      const [nextAccounts, nextCurrencies, nextCategories] = await Promise.all([
        hasStoredAccounts
          ? Promise.resolve(currentActiveAccounts)
          : listAccounts(token),
        hasStoredCurrencies
          ? Promise.resolve(currentCurrencies)
          : listCurrencies(token).catch(() => fallbackCurrencies),
        listCategories(token),
      ]);

      if (!hasStoredAccounts) {
        setAccounts(nextAccounts);
      }

      if (!hasStoredCurrencies) {
        setCurrencies(
          nextCurrencies.length > 0 ? nextCurrencies : fallbackCurrencies,
        );
      }

      setCategories(nextCategories);
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : 'Could not load payment options.',
      );
    } finally {
      setIsLoading(false);
    }
  }, [setAccounts, setCurrencies, token]);

  useEffect(() => {
    void loadOptions();
  }, [loadOptions]);

  useEffect(() => {
    if (accounts.length === 0) {
      return;
    }

    const hasSelectedPaymentAccount = accounts.some(
      (item) => item.id === selectedPaymentAccountId,
    );

    if (!hasSelectedPaymentAccount) {
      setSelectedPaymentAccountId(accounts[0].id);
    }
  }, [accounts, selectedPaymentAccountId]);

  const close = useCallback(() => {
    router.replace(ROUTES.MAIN_HOME);
  }, [router]);

  const openAccountPicker = useCallback(() => {
    if (accounts.length > 0) {
      setIsAccountPickerVisible(true);
    }
  }, [accounts.length]);

  const closeAccountPicker = useCallback(() => {
    setIsAccountPickerVisible(false);
  }, []);

  const selectPaymentAccount = useCallback((nextAccountId: number) => {
    setSelectedPaymentAccountId(nextAccountId);
    setIsAccountPickerVisible(false);
  }, []);

  const submit = useCallback(async () => {
    if (!token || !account || !refundCategory) {
      setError('Refund category or account is missing.');
      return;
    }

    if (amountCents <= 0) {
      setError('Enter a valid payment amount.');
      return;
    }

    setIsSaving(true);
    setError('');

    try {
      await createTransaction(token, {
        account_id: account.id,
        amount_cents: amountCents,
        category_id: refundCategory.id,
        currency_id: account.currency_id ?? user?.currency_id ?? 1,
        note: isFriendPayingYou
          ? `${friendName} paid you`
          : `You paid ${friendName}`,
        title: 'Settle up',
        transaction_date: new Date().toISOString(),
        transaction_type: transactionType,
      });

      router.replace(ROUTES.MAIN_HOME);
    } catch (requestError) {
      if (requestError instanceof ApiError) {
        setError(requestError.fieldErrors.base || requestError.message);
      } else {
        setError(
          requestError instanceof Error
            ? requestError.message
            : 'Could not record payment.',
        );
      }
    } finally {
      setIsSaving(false);
    }
  }, [
    account,
    amountCents,
    friendName,
    isFriendPayingYou,
    refundCategory,
    router,
    token,
    transactionType,
    user?.currency_id,
  ]);

  return (
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
            onPress={close}
            className="h-11 w-11 items-center justify-center rounded-full"
          >
            <Ionicons name="close" size={32} color="#111827" />
          </TouchableOpacity>
          <ThemedText className="text-xl text-gray-900" weight="semiBold">
            Record a payment
          </ThemedText>
          <View className="h-11 w-11" />
        </View>

        {isLoading ? (
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
                  user={isFriendPayingYou ? friendUser : currentUser}
                  size={72}
                />
                <Ionicons
                  name="arrow-forward"
                  size={38}
                  color="#4B5563"
                  style={{ marginHorizontal: 28 }}
                />
                <SharedExpenseAvatar
                  user={isFriendPayingYou ? currentUser : friendUser}
                  size={72}
                />
              </View>

              <ThemedText className="mt-8 text-center text-base text-gray-800">
                {isFriendPayingYou
                  ? `${friendName} paid you`
                  : `You paid ${friendName}`}
              </ThemedText>

              <ThemedInput
                inlineLabel={
                  account ? currencies.find((item) => item.id === account.currency_id)?.symbol ?? 'Rs' : 'Rs'
                }
                isProminent
                value={amount}
                onChangeText={setAmount}
                keyboardType="decimal-pad"
                placeholder="0.00"
                containerClassName="mx-auto mt-5 w-56"
                inputClassName="text-center text-4xl"
                error={amountCents <= 0 && amount.trim() ? 'Invalid amount' : undefined}
              />

              <View className="mt-5 rounded-2xl border border-gray-100 bg-gray-50 px-4 py-3">
                <TouchableOpacity
                  activeOpacity={0.78}
                  accessibilityRole="button"
                  accessibilityLabel="Change payment account"
                  className="flex-row items-center"
                  onPress={openAccountPicker}
                >
                  <Ionicons name="wallet-outline" size={20} color="#6B7280" />
                  <View className="ml-3 flex-1">
                    <ThemedText className="text-xs text-gray-500">Account</ThemedText>
                    <ThemedText className="text-sm text-gray-900" weight="semiBold">
                      {account?.name ?? 'Current account'}
                    </ThemedText>
                  </View>
                  {account ? (
                    <ThemedText className="text-xs text-gray-500">
                      {formatCents(account.current_balance_cents, account.currency_id, currencies)}
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
                  <Ionicons name="return-up-back-outline" size={20} color="#6B7280" />
                  <View className="ml-3 flex-1">
                    <ThemedText className="text-xs text-gray-500">Category</ThemedText>
                    <ThemedText className="text-sm text-gray-900" weight="semiBold">
                      {refundCategory?.name ?? 'Refund'}
                    </ThemedText>
                  </View>
                  <Ionicons name="lock-closed-outline" size={17} color="#9CA3AF" />
                </View>
              </View>

              <View className="mt-5 flex-row rounded-2xl border border-primary/10 bg-primary/5 px-4 py-3">
                <Ionicons name="information-circle-outline" size={22} color="#0F766E" />
                <ThemedText className="ml-3 flex-1 text-sm leading-5 text-gray-600">
                  You are recording a payment that happened outside the app.
                  No money will be moved.
                </ThemedText>
              </View>

              {error ? (
                <ThemedText className="mt-4 text-center text-sm text-red-500">
                  {error}
                </ThemedText>
              ) : null}
            </View>

            <ThemedButton
              title="Record payment"
              loading={isSaving}
              disabled={isSaving || !account || !refundCategory || amountCents <= 0}
              onPress={submit}
              containerClassName="rounded-full py-5"
              textClassName="text-lg"
            />
          </View>
        )}
      </KeyboardAvoidingView>

      <AccountPickerModal
        accounts={accounts}
        currencies={currencies}
        isVisible={isAccountPickerVisible}
        selectedAccount={account}
        onClose={closeAccountPicker}
        onSelectAccount={selectPaymentAccount}
      />
    </SafeAreaView>
  );
};

export default RecordPaymentScreen;
