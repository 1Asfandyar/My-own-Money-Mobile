import { listAccounts } from '@/feature/accounts/api/accounts.api';
import { listCategories } from '@/feature/categories/api/categories.api';
import { listGroups } from '@/feature/groups/api/groups.api';
import type { Group } from '@/feature/groups/types/group.types';
import type { AddTransactionRecordKind } from '@/feature/transactions/types/addTransactionRecord.types';
import type { Account } from '@/types/account.types';
import type { Category } from '@/feature/categories/types/category.types';

export type AddTransactionRecordOptions = {
  accounts: Account[];
  categories: Category[];
  sharedGroups: Group[];
};

export const loadAddTransactionRecordOptions = async (
  token: string,
  recordKind: AddTransactionRecordKind,
): Promise<AddTransactionRecordOptions> => {
  const [accounts, categories, sharedGroups] = await Promise.all([
    listAccounts(token),
    listCategories(token),
    recordKind === 'shared' ? listGroups(token, 'custom') : Promise.resolve([]),
  ]);

  return {
    accounts,
    categories,
    sharedGroups,
  };
};
