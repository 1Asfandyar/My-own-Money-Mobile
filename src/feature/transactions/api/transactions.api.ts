import type {
  ApiTransaction,
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

export const getApiTransaction = async (token: string, transactionId: number) => {
  const result = await apiRequest<{ success: true; transaction: ApiTransaction }>(
    `/api/v0/transactions/${transactionId}`,
    { token },
  );

  return result.data.transaction;
};

export const listAccountTransactions = async (
  token: string,
  params: ListAccountTransactionsParams = {},
) => {
  const queryParams = new URLSearchParams();
  const trimmedSearch = params.search?.trim();

  if (params.accountId) {
    queryParams.set('account_id', String(params.accountId));
  }

  if (params.categoryId) {
    queryParams.set('category_id', String(params.categoryId));
  }

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

  const result = await apiRequest<{ success: true; transactions: ApiTransaction[] }>(
    `/api/v0/transactions?${queryParams.toString()}`,
    { token },
  );

  return result.data.transactions ?? [];
};
