import { useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { Alert } from 'react-native';

import { ROUTES } from '@/config/routes';
import {
  deleteTransaction,
  getApiTransaction,
} from '@/feature/transactions/api/transactions.api';
import type {
  ApiTransaction,
  TransactionDetailViewModel,
  TransactionRenderAs,
} from '@/feature/transactions/types/transaction.types';
import { ApiError } from '@/services/api';
import { useAuthStore } from '@/store/auth.store';

const EDITABLE_RENDER_AS = new Set<TransactionRenderAs>([
  'personal_expense',
  'personal_income',
  'transfer',
  'shared_expense_payer',
]);

const DELETABLE_RENDER_AS = new Set<TransactionRenderAs>([
  'personal_expense',
  'personal_income',
  'transfer',
  'shared_expense_payer',
  'settlement_settler',
]);

const getPersonalEditParams = (t: ApiTransaction) => ({
  accountId: String(t.account.id),
  amountCents: String(t.amount_cents),
  categoryId: String(t.category?.id ?? ''),
  note: t.note ?? '',
  transactionDate: t.date,
  transactionId: String(t.id),
  transactionType: t.type,
});

const getSharedEditParams = (t: ApiTransaction) => {
  const splits = t.splits ?? [];
  const paidByUserId = t.paid_by.id;
  const sharedUserIds = splits.map((s) => s.user.id);
  const userShares = splits.map((s) => ({
    user_id: s.user.id,
    amount_cents: s.owed_amount_cents,
    percentage: t.split_method === 'percentage' ? s.allocation_value : null,
    shares: t.split_method === 'shares' ? s.allocation_value : null,
  }));

  return {
    accountId: String(t.account.id),
    amountCents: String(t.amount_cents),
    categoryId: String(t.category?.id ?? ''),
    note: t.note ?? '',
    transactionDate: t.date,
    transactionId: String(t.id),
    transactionType: t.type,
    paidByUserId: String(paidByUserId),
    sharedUserIds: JSON.stringify(sharedUserIds),
    splitMethod: t.split_method ?? 'equal',
    userShares: JSON.stringify(userShares),
  };
};

const useTransactionDetail = (): TransactionDetailViewModel => {
  const router = useRouter();
  const params = useLocalSearchParams<{ transactionId?: string }>();
  const transactionId = Number(params.transactionId);
  const token = useAuthStore((state) => state.token);

  const [transaction, setTransaction] = useState<ApiTransaction | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const loadDetail = useCallback(async () => {
    if (!token || !Number.isFinite(transactionId)) {
      setError('Could not open this transaction.');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const result = await getApiTransaction(token, transactionId);
      setTransaction(result);
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) {
        router.replace(ROUTES.AUTH_LOGIN);
        return;
      }

      setError(
        err instanceof Error ? err.message : 'Could not load transaction details.',
      );
    } finally {
      setIsLoading(false);
    }
  }, [router, token, transactionId]);

  useEffect(() => {
    void loadDetail();
  }, [loadDetail]);

  const onBack = useCallback(() => {
    router.back();
  }, [router]);

  const onEdit = useCallback(() => {
    if (!transaction) return;

    if (transaction.render_as === 'shared_expense_payer') {
      router.push({
        pathname: ROUTES.ADD_SHARED_RECORD,
        params: getSharedEditParams(transaction),
      });
      return;
    }

    router.push({
      pathname: ROUTES.ADD_PERSONAL_RECORD,
      params: getPersonalEditParams(transaction),
    });
  }, [router, transaction]);

  const performDelete = useCallback(async () => {
    if (!token || !transaction) return;

    setIsDeleting(true);
    setError(null);

    try {
      await deleteTransaction(token, transaction.id);
      router.back();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Could not delete this transaction.',
      );
    } finally {
      setIsDeleting(false);
    }
  }, [router, token, transaction]);

  const onDelete = useCallback(() => {
    Alert.alert(
      'Delete transaction?',
      'This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => { void performDelete(); },
        },
      ],
    );
  }, [performDelete]);

  const canEdit = Boolean(transaction && EDITABLE_RENDER_AS.has(transaction.render_as));
  const canDelete = Boolean(transaction && DELETABLE_RENDER_AS.has(transaction.render_as));

  return {
    canDelete,
    canEdit,
    error,
    isDeleting,
    isLoading: isLoading && !transaction,
    onBack,
    onDelete,
    onEdit,
    onRetry: loadDetail,
    transaction,
  };
};

export default useTransactionDetail;
