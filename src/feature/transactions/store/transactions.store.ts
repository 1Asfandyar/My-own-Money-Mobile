import { create } from 'zustand';

import type {
  TransactionsStore,
  TransactionsStoreState,
} from '@/feature/transactions/types/transaction.types';

const initialTransactionsState: TransactionsStoreState = {
  error: null,
  isAccountContextLoading: false,
  isLoading: false,
  selectedTransaction: null,
  transactions: [],
};

export const useTransactionsStore = create<TransactionsStore>((set) => ({
  ...initialTransactionsState,
  resetTransactions: () => set(initialTransactionsState),
  setError: (error) => set({ error }),
  setIsAccountContextLoading: (isAccountContextLoading) =>
    set({ isAccountContextLoading }),
  setIsLoading: (isLoading) => set({ isLoading }),
  setSelectedTransaction: (selectedTransaction) => set({ selectedTransaction }),
  setTransactions: (transactions) => set({ transactions }),
}));
