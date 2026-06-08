import { useCallback, useEffect } from 'react';

import { loadAddTransactionRecordOptions } from '@/feature/transactions/api/addTransactionRecord.api';
import type { Category } from '@/feature/categories/types/category.types';
import type { AddTransactionRecordKind } from '@/feature/transactions/types/addTransactionRecord.types';
import type { Account } from '@/types/account.types';

type UseAddTransactionRecordOptionsParams = {
  loadFriends: () => Promise<unknown>;
  loadGroups?: () => Promise<unknown>;
  recordKind: AddTransactionRecordKind;
  resetAddTransactionRecord: () => void;
  setAccounts: (accounts: Account[]) => void;
  setCategories: (categories: Category[]) => void;
  setFormError: (error: string) => void;
  setIsLoadingOptions: (isLoadingOptions: boolean) => void;
  token: string | null;
};

const useAddTransactionRecordOptions = ({
  loadFriends,
  loadGroups,
  recordKind,
  resetAddTransactionRecord,
  setAccounts,
  setCategories,
  setFormError,
  setIsLoadingOptions,
  token,
}: UseAddTransactionRecordOptionsParams) => {
  const isSharedRecord = recordKind === 'shared';

  useEffect(() => {
    resetAddTransactionRecord();

    return resetAddTransactionRecord;
  }, [resetAddTransactionRecord]);

  const loadOptions = useCallback(async () => {
    if (!token) {
      setIsLoadingOptions(false);
      return;
    }

    setIsLoadingOptions(true);
    setFormError('');

    try {
      const [options] = await Promise.all([
        loadAddTransactionRecordOptions(token),
        isSharedRecord ? loadFriends() : Promise.resolve(),
        isSharedRecord && loadGroups ? loadGroups() : Promise.resolve(),
      ]);

      setAccounts(options.accounts);
      setCategories(options.categories);
    } catch (error) {
      setFormError(
        error instanceof Error
          ? error.message
          : 'Could not load form options.',
      );
    } finally {
      setIsLoadingOptions(false);
    }
  }, [
    isSharedRecord,
    loadFriends,
    loadGroups,
    setAccounts,
    setCategories,
    setFormError,
    setIsLoadingOptions,
    token,
  ]);

  useEffect(() => {
    void loadOptions();
  }, [loadOptions]);
};

export default useAddTransactionRecordOptions;
