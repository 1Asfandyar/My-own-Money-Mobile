import { useRouter } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { Alert } from 'react-native';

import { ROUTES } from '@/config/routes';
import {
  createAccount,
  deleteAccount,
  listAccounts,
} from '@/feature/accounts/api/accounts.api';
import { useAccountsOverviewStore } from '@/feature/accounts/store/accountsOverview.store';
import type { ManageAccountsViewModel } from '@/feature/accounts/types/manageAccounts.types';
import { listCurrencies } from '@/feature/currencies/api/currencies.api';
import { ApiError } from '@/services/api';
import { useAuthStore } from '@/store/auth.store';
import type { Account } from '@/types/account.types';
import type { Currency } from '@/types/currency.types';
import {
  fallbackCurrencies,
  getCurrencyById,
  moneyInputToCents,
} from '@/utils/currency';
import { getRequestError } from '@/utils/errors';

const useManageAccounts = (): ManageAccountsViewModel => {
  const router = useRouter();
  const token = useAuthStore((state) => state.token);
  const user = useAuthStore((state) => state.user);
  const clearSession = useAuthStore((state) => state.clearSession);
  const setStoredAccounts = useAccountsOverviewStore((state) => state.setAccounts);
  const setStoredCurrencies = useAccountsOverviewStore(
    (state) => state.setCurrencies,
  );
  const selectedAccountId = useAccountsOverviewStore(
    (state) => state.selectedAccountId,
  );
  const setSelectedAccountId = useAccountsOverviewStore(
    (state) => state.setSelectedAccountId,
  );
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [currencies, setCurrencies] = useState<Currency[]>(fallbackCurrencies);
  const [accountName, setAccountName] = useState('');
  const [balance, setBalance] = useState('');
  const [error, setError] = useState('');
  const [formError, setFormError] = useState('');
  const [isAddModalVisible, setIsAddModalVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [removingAccountId, setRemovingAccountId] = useState<number | null>(null);
  const [selectedCurrencyId, setSelectedCurrencyId] = useState(
    user?.currency_id ?? fallbackCurrencies[0].id,
  );

  const redirectToLogin = useCallback(async () => {
    await clearSession();
    router.replace(ROUTES.AUTH_LOGIN);
  }, [clearSession, router]);

  const loadAccounts = useCallback(async () => {
    if (!token) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const [nextAccounts, nextCurrencies] = await Promise.all([
        listAccounts(token),
        listCurrencies(token).catch((requestError: unknown) => {
          if (requestError instanceof ApiError && requestError.status === 401) {
            throw requestError;
          }

          return fallbackCurrencies;
        }),
      ]);
      const displayCurrencies =
        nextCurrencies.length > 0 ? nextCurrencies : fallbackCurrencies;

      setAccounts(nextAccounts);
      setCurrencies(displayCurrencies);
      setStoredAccounts(nextAccounts);
      setStoredCurrencies(displayCurrencies);
      setSelectedCurrencyId((currentId) =>
        getCurrencyById(user?.currency_id ?? currentId, displayCurrencies).id,
      );
    } catch (requestError) {
      if (requestError instanceof ApiError && requestError.status === 401) {
        await redirectToLogin();
        return;
      }

      setError(getRequestError(requestError, 'Could not load accounts.'));
    } finally {
      setIsLoading(false);
    }
  }, [
    redirectToLogin,
    setStoredAccounts,
    setStoredCurrencies,
    token,
    user?.currency_id,
  ]);

  useEffect(() => {
    void loadAccounts();
  }, [loadAccounts]);

  const openAddModal = useCallback(() => {
    setAccountName('');
    setBalance('');
    setFormError('');
    setSelectedCurrencyId(
      getCurrencyById(user?.currency_id, currencies).id,
    );
    setIsAddModalVisible(true);
  }, [currencies, user?.currency_id]);

  const closeAddModal = useCallback(() => {
    if (!isSaving) {
      setFormError('');
      setIsAddModalVisible(false);
    }
  }, [isSaving]);

  const saveAccount = useCallback(async () => {
    if (!token) {
      setFormError('Please sign in again to add an account.');
      return;
    }

    const name = accountName.trim();

    if (!name) {
      setFormError('Enter an account name.');
      return;
    }

    setIsSaving(true);
    setFormError('');

    try {
      const openingBalanceCents = moneyInputToCents(balance);
      const account = await createAccount(token, {
        currency_id: selectedCurrencyId,
        current_balance_cents: openingBalanceCents,
        initial_balance_cents: openingBalanceCents,
        name,
      });
      const nextAccounts = [...accounts, account];

      setAccounts(nextAccounts);
      setStoredAccounts(nextAccounts);

      if (!selectedAccountId) {
        setSelectedAccountId(account.id);
      }

      setIsAddModalVisible(false);
    } catch (requestError) {
      setFormError(getRequestError(requestError, 'Could not create this account.'));
    } finally {
      setIsSaving(false);
    }
  }, [
    accountName,
    accounts,
    balance,
    selectedAccountId,
    selectedCurrencyId,
    setSelectedAccountId,
    setStoredAccounts,
    token,
  ]);

  const removeAccount = useCallback(
    (account: Account) => {
      Alert.alert(
        'Remove account?',
        `This will permanently remove "${account.name}". This action cannot be undone.`,
        [
          { style: 'cancel', text: 'Cancel' },
          {
            style: 'destructive',
            text: 'Remove',
            onPress: async () => {
              if (!token) {
                setError('Please sign in again to remove an account.');
                return;
              }

              setRemovingAccountId(account.id);
              setError('');

              try {
                await deleteAccount(token, account.id);
                const nextAccounts = accounts.filter(
                  (item) => item.id !== account.id,
                );

                setAccounts(nextAccounts);
                setStoredAccounts(nextAccounts);

                if (selectedAccountId === account.id) {
                  setSelectedAccountId(
                    nextAccounts.find((item) => !item.is_archived)?.id ?? null,
                  );
                }
              } catch (requestError) {
                setError(
                  getRequestError(requestError, 'Could not remove this account.'),
                );
              } finally {
                setRemovingAccountId(null);
              }
            },
          },
        ],
      );
    },
    [
      accounts,
      selectedAccountId,
      setSelectedAccountId,
      setStoredAccounts,
      token,
    ],
  );

  return {
    accountName,
    accounts,
    balance,
    currencies,
    error,
    formError,
    isAddModalVisible,
    isLoading,
    isSaving,
    onBack: () => router.back(),
    onChangeAccountName: setAccountName,
    onChangeBalance: setBalance,
    onCloseAddModal: closeAddModal,
    onDeleteAccount: removeAccount,
    onOpenAddModal: openAddModal,
    onRefresh: () => void loadAccounts(),
    onSaveAccount: () => void saveAccount(),
    onSelectCurrency: setSelectedCurrencyId,
    removingAccountId,
    selectedCurrencyId,
  };
};

export default useManageAccounts;
