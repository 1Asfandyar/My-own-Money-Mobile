import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Alert } from 'react-native';

import { ROUTES } from '@/config/routes';
import {
  CATEGORY_COLOR_FALLBACK,
  CATEGORY_ICON_FALLBACK,
} from '@/feature/categories/constants/categoryDashboard.constants';
import { useAccountsOverviewStore } from '@/feature/accounts/store/accountsOverview.store';
import { listFriendships } from '@/feature/friendships/api/friendships.api';
import { friendshipUserToGroupUser } from '@/feature/friendships/utils/friendshipDisplay.utils';
import type { GroupUser } from '@/feature/groups/types/group.types';
import {
  deleteTransaction,
  getTransaction,
} from '@/feature/transactions/api/transactions.api';
import { useTransactionsStore } from '@/feature/transactions/store/transactions.store';
import type {
  SharedTransactionParticipant,
  SharedTransactionDetailViewModel,
  Transaction,
} from '@/feature/transactions/types/transaction.types';
import {
  getEqualSplitAmountCents,
  getSplitAmountCents,
} from '@/feature/transactions/utils/sharedExpenseSplit.utils';
import { getSharedTransactionEditRouteParams } from '@/feature/transactions/utils/transactionRouteParams.utils';
import { ApiError } from '@/services/api';
import { useAuthStore } from '@/store/auth.store';
import type { AuthUser } from '@/types/auth.types';
import type { Currency } from '@/types/currency.types';
import { fallbackCurrencies, formatCents } from '@/utils/currency';

const getSoftColor = (color: string) =>
  /^#[0-9a-f]{6}$/i.test(color) ? `${color}1A` : '#F3F4F6';

const formatTransactionDate = (value?: string) => {
  if (!value) return 'No date';

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return 'No date';

  return date.toLocaleDateString(undefined, {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
};

const getCategoryIcon = (
  icon?: string | null,
): keyof typeof Ionicons.glyphMap => {
  if (icon && icon in Ionicons.glyphMap) {
    return icon as keyof typeof Ionicons.glyphMap;
  }

  return CATEGORY_ICON_FALLBACK.expense;
};

const getCurrentUserParticipant = (user: AuthUser | null) => {
  if (!user) return null;

  return {
    avatar_url: user.avatar_url,
    email: user.email,
    full_name: user.full_name || 'You',
    id: user.id,
    mobile_number: user.mobile_number,
    photo_url: user.photo_url,
    profile_image_url: user.profile_image_url,
    profile_photo_url: user.profile_photo_url,
  };
};

const getFallbackUser = (userId: number): GroupUser => ({
  full_name: `User #${userId}`,
  id: userId,
});

const getParticipantIds = (
  transaction: Transaction,
  currentUserId?: number,
  fallbackParticipantIds: number[] = [],
) => {
  const participantIds = [
    ...(transaction.shared_by ?? []),
    ...(transaction.user_shares ?? []).map((share) => share.user_id),
    transaction.paid_by,
    currentUserId,
    ...fallbackParticipantIds,
  ].filter((id): id is number => typeof id === 'number' && Number.isFinite(id));

  return Array.from(new Set(participantIds));
};

const getShareAmountCents = (
  transaction: Transaction,
  participantIds: number[],
  participantId: number,
) => {
  const totalAmountCents = Math.abs(transaction.amount_cents);
  const method = transaction.split_method ?? 'equal';
  const share = transaction.user_shares?.find(
    (item) => item.user_id === participantId,
  );

  if (method === 'equal') {
    return getEqualSplitAmountCents(
      totalAmountCents,
      participantIds.length,
      participantIds.indexOf(participantId),
    );
  }

  if (method === 'exact') {
    return share?.amount_cents ?? 0;
  }

  const totalShares =
    method === 'shares'
      ? transaction.user_shares?.reduce(
          (total, item) => total + (item.shares ?? 0),
          0,
        ) ?? 0
      : 0;

  return getSplitAmountCents(
    method,
    String(method === 'percentage' ? share?.percentage ?? '' : share?.shares ?? ''),
    totalAmountCents,
    totalShares,
  );
};

const getParticipantRows = ({
  currencies,
  currentUserId,
  fallbackParticipantIds,
  transaction,
  usersById,
}: {
  currencies: Currency[];
  currentUserId?: number;
  fallbackParticipantIds?: number[];
  transaction: Transaction;
  usersById: Map<number, GroupUser>;
}): SharedTransactionParticipant[] => {
  const participantIds = getParticipantIds(
    transaction,
    currentUserId,
    fallbackParticipantIds,
  );
  const payerId = transaction.paid_by ?? currentUserId;

  return participantIds.map((participantId) => {
    const isCurrentUser = participantId === currentUserId;
    const user = usersById.get(participantId) ?? getFallbackUser(participantId);
    const amountCents = getShareAmountCents(
      transaction,
      participantIds,
      participantId,
    );

    const nameLabel = isCurrentUser ? 'You' : user.full_name;
    const owesVerb = isCurrentUser ? 'owe' : 'owes';

    return {
      amountCents,
      id: participantId,
      isCurrentUser,
      isPayer: participantId === payerId,
      label: `${nameLabel} ${owesVerb} ${formatCents(
        amountCents,
        transaction.currency_id,
        currencies,
      )}`,
      user: isCurrentUser ? { ...user, full_name: 'You' } : user,
    };
  });
};

const useSharedTransactionDetail = (): SharedTransactionDetailViewModel => {
  const router = useRouter();
  const params = useLocalSearchParams<{
    friendId?: string;
    friendName?: string;
    transactionId?: string;
  }>();
  const routeTransactionId = Number(params.transactionId);
  const transactionId = Number.isFinite(routeTransactionId)
    ? routeTransactionId
    : null;
  const routeFriendId = Number(params.friendId);
  const fallbackFriendId = Number.isFinite(routeFriendId) ? routeFriendId : null;
  const token = useAuthStore((state) => state.token);
  const user = useAuthStore((state) => state.user);
  const currencies = useAccountsOverviewStore((state) => state.currencies);
  const storedTransaction = useTransactionsStore(
    (state) => state.selectedTransaction,
  );
  const transactions = useTransactionsStore((state) => state.transactions);
  const setSelectedTransaction = useTransactionsStore(
    (state) => state.setSelectedTransaction,
  );
  const [friends, setFriends] = useState<GroupUser[]>([]);
  const [loadedTransaction, setLoadedTransaction] = useState<Transaction | null>(
    null,
  );
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const displayCurrencies = currencies.length > 0 ? currencies : fallbackCurrencies;
  const transaction =
    loadedTransaction ??
    (storedTransaction?.id === transactionId ? storedTransaction : null) ??
    transactions.find((item) => item.id === transactionId);

  const usersById = useMemo(() => {
    const nextUsers = new Map<number, GroupUser>();
    const currentUser = getCurrentUserParticipant(user);

    if (currentUser) {
      nextUsers.set(currentUser.id, currentUser);
    }

    if (fallbackFriendId) {
      nextUsers.set(fallbackFriendId, {
        full_name: params.friendName?.trim() || `User #${fallbackFriendId}`,
        id: fallbackFriendId,
      });
    }

    friends.forEach((friend) => {
      nextUsers.set(friend.id, friend);
    });

    return nextUsers;
  }, [fallbackFriendId, friends, params.friendName, user]);

  const loadDetail = useCallback(async () => {
    if (!token || !transactionId) {
      setError('Could not open this transaction.');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const [nextTransaction, friendships] = await Promise.all([
        getTransaction(token, transactionId),
        listFriendships(token),
      ]);

      setLoadedTransaction(nextTransaction);
      setSelectedTransaction(nextTransaction);
      setFriends(
        friendships
          .map((friendship) => friendshipUserToGroupUser(friendship.friend))
          .filter((friend) => friend.id !== user?.id),
      );
    } catch (requestError) {
      if (requestError instanceof ApiError && requestError.status === 401) {
        router.replace(ROUTES.AUTH_LOGIN);
        return;
      }

      setError(
        requestError instanceof Error
          ? requestError.message
          : 'Could not load transaction details.',
      );
    } finally {
      setIsLoading(false);
    }
  }, [router, setSelectedTransaction, token, transactionId, user?.id]);

  useEffect(() => {
    void loadDetail();
  }, [loadDetail]);

  const onBack = useCallback(() => {
    router.back();
  }, [router]);

  const onEdit = useCallback(() => {
    if (!transaction) {
      return;
    }

    router.push({
      pathname: ROUTES.ADD_SHARED_RECORD,
      params: getSharedTransactionEditRouteParams(transaction),
    });
  }, [router, transaction]);

  const deleteCurrentTransaction = useCallback(async () => {
    if (!token || !transaction) {
      return;
    }

    setIsDeleting(true);
    setError(null);

    try {
      await deleteTransaction(token, transaction.id);
      setSelectedTransaction(null);
      router.back();
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : 'Could not delete this transaction.',
      );
    } finally {
      setIsDeleting(false);
    }
  }, [router, setSelectedTransaction, token, transaction]);

  const onDelete = useCallback(() => {
    Alert.alert(
      'Delete shared expense?',
      'This will remove the expense and its shared balances.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            void deleteCurrentTransaction();
          },
        },
      ],
    );
  }, [deleteCurrentTransaction]);

  const categoryColor =
    transaction?.category?.color ?? CATEGORY_COLOR_FALLBACK.expense;
  const paidByUser = transaction
    ? usersById.get(transaction.paid_by ?? user?.id ?? 0)
    : undefined;
  const paidByName = paidByUser?.id === user?.id ? 'You' : paidByUser?.full_name;

  return {
    amountLabel: transaction
      ? formatCents(
          Math.abs(transaction.amount_cents),
          transaction.currency_id,
          displayCurrencies,
        )
      : formatCents(0, user?.currency_id, displayCurrencies),
    categoryColor,
    categoryIconName: getCategoryIcon(transaction?.category?.icon),
    categorySoftColor: getSoftColor(categoryColor),
    createdByLabel: `Added by you on ${formatTransactionDate(
      transaction?.transaction_date,
    )}`,
    dateLabel: formatTransactionDate(transaction?.transaction_date),
    error,
    isDeleting,
    isLoading: isLoading && !transaction,
    note: transaction?.note?.trim() || undefined,
    onBack,
    onDelete,
    onEdit,
    onRetry: loadDetail,
    paidByLabel: `${paidByName ?? 'Someone'} paid ${
      transaction
        ? formatCents(
            Math.abs(transaction.amount_cents),
            transaction.currency_id,
            displayCurrencies,
          )
        : formatCents(0, user?.currency_id, displayCurrencies)
    }`,
    paidByUser,
    participantRows: transaction
      ? getParticipantRows({
          currencies: displayCurrencies,
          currentUserId: user?.id,
          fallbackParticipantIds: fallbackFriendId ? [fallbackFriendId] : [],
          transaction,
          usersById,
        })
      : [],
    title:
      transaction?.title ||
      transaction?.note?.trim() ||
      transaction?.category?.name ||
      'Shared expense',
  };
};

export default useSharedTransactionDetail;
