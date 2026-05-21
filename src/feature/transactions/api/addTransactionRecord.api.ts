import { listAccounts } from '@/feature/accounts/api/accounts.api';
import { listCategories } from '@/feature/categories/api/categories.api';
import type { Account } from '@/types/account.types';
import type { Category } from '@/feature/categories/types/category.types';

export type AddTransactionRecordOptions = {
  accounts: Account[];
  categories: Category[];
};

export const loadAddTransactionRecordOptions = async (
  token: string,
): Promise<AddTransactionRecordOptions> => {
  const [accounts, categories] = await Promise.all([
    listAccounts(token),
    listCategories(token),
  ]);

  return {
    accounts,
    categories,
  };
};
