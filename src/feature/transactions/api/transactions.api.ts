import type {
  ListAccountTransactionsParams,
  Transaction,
  TransactionPayload,
} from '@/feature/transactions/types/transaction.types';
import { apiRequest } from '@/services/api';

export const createTransaction = async (
  token: string,
  payload: TransactionPayload,
) => {
  const result = await apiRequest<{ success: true; transaction: Transaction }>(
    '/api/v0/transactions',
    {
      method: 'POST',
      token,
      body: payload,
    },
  );

  return result.data.transaction;
};

export const updateTransaction = async (
  token: string,
  transactionId: number,
  payload: TransactionPayload,
) => {
  const result = await apiRequest<{ success: true; transaction: Transaction }>(
    `/api/v0/transactions/${transactionId}`,
    {
      method: 'PATCH',
      token,
      body: payload,
    },
  );

  return result.data.transaction;
};

export const deleteTransaction = async (
  token: string,
  transactionId: number,
) => {
  await apiRequest<{ success: true }>(
    `/api/v0/transactions/${transactionId}`,
    {
      method: 'DELETE',
      token,
    },
  );
};

export const getTransaction = async (token: string, transactionId: number) => {
  const result = await apiRequest<{ success: true; transaction: Transaction }>(
    `/api/v0/transactions/${transactionId}`,
    { token },
  );

  return result.data.transaction;
};

export const listAccountTransactions = async (
  token: string,
  accountId: number,
  params: ListAccountTransactionsParams = {},
) => {
  const queryParams = new URLSearchParams({
    account_id: String(accountId),
  });
  const trimmedSearch = params.search?.trim();

  if (params.type) {
    queryParams.set('type', params.type);
  }

  if (trimmedSearch) {
    queryParams.set('search', trimmedSearch);
  }

  if (params.fromDate) {
    queryParams.set('from', params.fromDate);
  }

  if (params.toDate) {
    queryParams.set('to', params.toDate);
  }

  const result = await apiRequest<{ success: true; transactions: Transaction[] }>(
    `/api/v0/transactions?${queryParams.toString()}`,
    { token },
  );

  return result.data.transactions ?? [];
};
