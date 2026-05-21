import { useCallback, useEffect, useState } from 'react';

import { loadAddTransactionRecordOptions } from '@/feature/transactions/api/addTransactionRecord.api';
import type { Category } from '@/feature/categories/types/category.types';
import type { Group } from '@/feature/groups/types/group.types';
import type { AddTransactionRecordKind } from '@/feature/transactions/types/addTransactionRecord.types';
import type { Account } from '@/types/account.types';

type UseAddTransactionRecordOptionsParams = {
  loadFriendsGroup: () => Promise<unknown>;
  recordKind: AddTransactionRecordKind;
  resetAddTransactionRecord: () => void;
  setAccounts: (accounts: Account[]) => void;
  setCategories: (categories: Category[]) => void;
  setFormError: (error: string) => void;
  setIsLoadingOptions: (isLoadingOptions: boolean) => void;
  token: string | null;
};

const useAddTransactionRecordOptions = ({
  loadFriendsGroup,
  recordKind,
  resetAddTransactionRecord,
  setAccounts,
  setCategories,
  setFormError,
  setIsLoadingOptions,
  token,
}: UseAddTransactionRecordOptionsParams) => {
  const isSharedRecord = recordKind === 'shared';
  const [sharedGroups, setSharedGroups] = useState<Group[]>([]);

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
        loadAddTransactionRecordOptions(token, recordKind),
        isSharedRecord ? loadFriendsGroup() : Promise.resolve(),
      ]);

      setAccounts(options.accounts);
      setCategories(options.categories);
      setSharedGroups(options.sharedGroups);
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
    loadFriendsGroup,
    recordKind,
    setAccounts,
    setCategories,
    setFormError,
    setIsLoadingOptions,
    token,
  ]);

  useEffect(() => {
    void loadOptions();
  }, [loadOptions]);

  return { sharedGroups };
};

export default useAddTransactionRecordOptions;
