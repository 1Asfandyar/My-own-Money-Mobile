import { listAccounts } from '@/feature/accounts/api/accounts.api';
import { listCategories } from '@/feature/categories/api/categories.api';
import type { Category } from '@/feature/categories/types/category.types';
import type { Account } from '@/types/account.types';

export type AddTransactionRecordOptions = {
  accounts: Account[];
  categories: Category[];
};

export const loadAddTransactionRecordOptions = async (
  token: string,
): Promise<AddTransactionRecordOptions> => {
  const [accounts, categories] = await Promise.all([
    listAccounts(token),
    listCategories(token, { includeZeroBalance: true }),
  ]);

  return {
    accounts,
    categories,
  };
};
