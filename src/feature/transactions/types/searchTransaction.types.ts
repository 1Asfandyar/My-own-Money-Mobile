import type { Account } from '@/types/account.types';
import type { Category } from '@/feature/categories/types/category.types';
import type { TransactionFilters } from '@/feature/transactions/types/transactionDateFilter.types';

export type SearchTransactionProps = {
  accounts: Account[];
  categories: Category[];
  filters: TransactionFilters;
  hasActiveDateFilter: boolean;
  onApplyFilters: (filters: TransactionFilters) => void;
  onClearFilters: () => void;
  onClearSearch: () => void;
  onSearchQueryChange: (query: string) => void;
  searchQuery: string;
};
