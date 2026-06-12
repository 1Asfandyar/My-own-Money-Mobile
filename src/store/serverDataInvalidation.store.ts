import { create } from 'zustand';

type ServerDataInvalidationState = {
  accounts: number;
  friendships: number;
  reports: number;
  transactions: number;
  invalidateSettlementData: () => void;
};

export const useServerDataInvalidationStore =
  create<ServerDataInvalidationState>((set) => ({
    accounts: 0,
    friendships: 0,
    reports: 0,
    transactions: 0,
    invalidateSettlementData: () =>
      set((state) => ({
        accounts: state.accounts + 1,
        friendships: state.friendships + 1,
        reports: state.reports + 1,
        transactions: state.transactions + 1,
      })),
  }));

export const invalidateSettlementData = () => {
  useServerDataInvalidationStore.getState().invalidateSettlementData();
};
