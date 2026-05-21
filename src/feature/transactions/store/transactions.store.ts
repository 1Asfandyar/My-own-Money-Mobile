import { create } from 'zustand';

import type {
  TransactionsStore,
  TransactionsStoreState,
} from '@/feature/transactions/types/transaction.types';

const initialTransactionsState: TransactionsStoreState = {
  error: null,
  isAccountContextLoading: false,
  isLoading: false,
  transactions: [],
};

export const useTransactionsStore = create<TransactionsStore>((set) => ({
  ...initialTransactionsState,
  resetTransactions: () => set(initialTransactionsState),
  setError: (error) => set({ error }),
  setIsAccountContextLoading: (isAccountContextLoading) =>
    set({ isAccountContextLoading }),
  setIsLoading: (isLoading) => set({ isLoading }),
  setTransactions: (transactions) => set({ transactions }),
}));
