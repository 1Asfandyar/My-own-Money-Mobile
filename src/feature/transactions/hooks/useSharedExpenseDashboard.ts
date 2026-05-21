import { useMemo } from 'react';

import { getUserInitial, getUserLabel } from '@/feature/groups/utils/groupMembers.utils';
import type {
  SharedExpenseDashboardFriendItem,
  SharedExpenseDashboardTransactionItem,
  UseSharedExpenseDashboardParams,
} from '@/feature/transactions/types/sharedExpenseDashboard.types';
import type { SharedExpenseTransaction } from '@/feature/transactions/types/sharedExpense.types';
import { getSignedTransactionAmountCents } from '@/feature/transactions/utils/transactionAmount.utils';
import type { Currency } from '@/types/currency.types';
import { formatCents } from '@/utils/currency';

const VISIBLE_TRANSACTION_COUNT = 3;

const formatSignedCents = (
  cents: number,
  currencyId: number,
  currencies: Currency[],
) => {
  const sign = cents >= 0 ? '+' : '-';

  return `${sign}${formatCents(Math.abs(cents), currencyId, currencies)}`;
};

const formatCount = (count: number, singular: string, plural: string) =>
  `${count} ${count === 1 ? singular : plural}`;

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

const getTransactionTimestamp = (transaction: SharedExpenseTransaction) => {
  const date = new Date(transaction.transaction_date);

  if (!Number.isNaN(date.getTime())) {
    return date.getTime();
  }

  return transaction.id;
};

const getTransactionItem = (
  transaction: SharedExpenseTransaction,
  displayCurrencyId: number,
  currencies: Currency[],
): SharedExpenseDashboardTransactionItem => ({
  amountLabel: formatSignedCents(
    getSignedTransactionAmountCents(transaction),
    transaction.currency_id ?? displayCurrencyId,
    currencies,
  ),
  dateLabel: formatTransactionDate(transaction.transaction_date),
  id: transaction.id,
  note: transaction.note?.trim() || undefined,
  title: transaction.title?.trim() || 'Shared expense',
});

export const useSharedExpenseDashboard = ({
  currencies,
  displayCurrency,
  friends,
}: UseSharedExpenseDashboardParams) => {
  const items = useMemo<SharedExpenseDashboardFriendItem[]>(
    () =>
      friends
        .map((friendGroup) => {
          const transactions = [...(friendGroup.transactions ?? [])].sort(
            (first, second) =>
              getTransactionTimestamp(second) - getTransactionTimestamp(first),
          );
          const totalAmountCents = transactions.reduce(
            (total, transaction) =>
              total + getSignedTransactionAmountCents(transaction),
            0,
          );

          return {
            amountLabel: formatSignedCents(
              totalAmountCents,
              displayCurrency.id,
              currencies,
            ),
            email: friendGroup.friend.email?.trim() || undefined,
            hiddenTransactionCount: Math.max(
              0,
              transactions.length - VISIBLE_TRANSACTION_COUNT,
            ),
            id: friendGroup.friend.id,
            initial: getUserInitial(friendGroup.friend),
            name: getUserLabel(friendGroup.friend),
            totalAmountCents,
            transactionCountLabel: formatCount(
              transactions.length,
              'split',
              'splits',
            ),
            transactions: transactions
              .slice(0, VISIBLE_TRANSACTION_COUNT)
              .map((transaction) =>
                getTransactionItem(transaction, displayCurrency.id, currencies),
              ),
          };
        })
        .filter((item) => item.transactions.length > 0)
        .sort(
          (first, second) =>
            Math.abs(second.totalAmountCents) - Math.abs(first.totalAmountCents),
        ),
    [currencies, displayCurrency.id, friends],
  );

  const summary = useMemo(() => {
    const totalAmountCents = items.reduce(
      (total, item) => total + item.totalAmountCents,
      0,
    );
    const splitCount = items.reduce(
      (total, item) =>
        total + item.transactions.length + item.hiddenTransactionCount,
      0,
    );

    return {
      amountLabel: formatSignedCents(
        totalAmountCents,
        displayCurrency.id,
        currencies,
      ),
      friendCountLabel: formatCount(items.length, 'friend', 'friends'),
      splitCountLabel: formatCount(splitCount, 'split', 'splits'),
    };
  }, [currencies, displayCurrency.id, items]);

  return {
    hasFriends: items.length > 0,
    items,
    summary,
  };
};
