import { Ionicons } from '@expo/vector-icons';
import type { FormikErrors } from 'formik';

import type { Category } from '@/feature/categories/types/category.types';
import type { GroupUser } from '@/feature/groups/types/group.types';
import type {
  AddTransactionRecordDropdownOption,
  AddTransactionRecordFieldErrors,
  AddTransactionRecordFormValues,
  AddTransactionRecordKind,
} from '@/feature/transactions/types/addTransactionRecord.types';
import type { SharedExpenseSplitMethod } from '@/feature/transactions/types/sharedExpenseSplit.types';
import type { TransactionPayload } from '@/feature/transactions/types/transaction.types';
import {
  buildSharedExpenseUserShares,
  validateSharedExpenseSplitValues,
} from '@/feature/transactions/utils/sharedExpenseSplit.utils';
import type { AuthUser } from '@/types/auth.types';
import type { Account } from '@/types/account.types';
import { formatCents, moneyInputToCents } from '@/utils/currency';

const CATEGORY_ICON_FALLBACK: keyof typeof Ionicons.glyphMap = 'pricetag-outline';

const getCategoryIcon = (icon: string | null): keyof typeof Ionicons.glyphMap =>
  icon && icon in Ionicons.glyphMap
    ? (icon as keyof typeof Ionicons.glyphMap)
    : CATEGORY_ICON_FALLBACK;

export const getAddTransactionAmountCents = (amount: string) =>
  moneyInputToCents(amount);

export const getValidatedAddTransactionRecordFieldErrors = (
  errors: FormikErrors<AddTransactionRecordFormValues>,
): AddTransactionRecordFieldErrors => ({
  accountId: typeof errors.accountId === 'string' ? errors.accountId : undefined,
  amount: typeof errors.amount === 'string' ? errors.amount : undefined,
  categoryId:
    typeof errors.categoryId === 'string' ? errors.categoryId : undefined,
  note: typeof errors.note === 'string' ? errors.note : undefined,
  sharedUserIds:
    typeof errors.sharedUserIds === 'string'
      ? errors.sharedUserIds
      : undefined,
  transactionType:
    typeof errors.transactionType === 'string'
      ? errors.transactionType
      : undefined,
});

export const validateAddTransactionRecord =
  (recordKind: AddTransactionRecordKind) =>
  (values: AddTransactionRecordFormValues) => {
    const errors: FormikErrors<AddTransactionRecordFormValues> = {};
    const amountCents = moneyInputToCents(values.amount);

    if (!values.amount.trim()) {
      errors.amount = 'Amount is required.';
    } else if (amountCents <= 0) {
      errors.amount = 'Enter a valid amount.';
    }

    if (!values.accountId) {
      errors.accountId = 'Choose an account.';
    }

    if (!values.categoryId) {
      errors.categoryId = 'Choose a category.';
    }

    if (recordKind === 'shared' && values.sharedUserIds.length === 0) {
      errors.sharedUserIds = 'Choose at least one friend to share with.';
    }

    return errors;
  };

export const getAddTransactionAccountOptions = (
  accounts: Account[],
): AddTransactionRecordDropdownOption[] =>
  accounts.map((account) => ({
    id: account.id,
    label: account.name,
    iconName: 'wallet-outline',
    supportingLabel: formatCents(
      account.current_balance_cents,
      account.currency_id,
    ),
  }));

export const getAddTransactionCategoryOptions = (
  categories: Category[],
): AddTransactionRecordDropdownOption[] =>
  categories.map((category) => ({
    id: category.id,
    label: category.name,
    iconName: getCategoryIcon(category.icon),
    iconColor: category.color ?? undefined,
  }));

export const getCurrentUserParticipant = (
  user: AuthUser | null,
): GroupUser | null => {
  if (!user?.id) {
    return null;
  }

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

export const getSelectedSharedFriends = (
  selectedUserIds: number[],
  sharedUsersById: Map<number, GroupUser>,
) =>
  selectedUserIds
    .map((userId) => sharedUsersById.get(userId))
    .filter((friend): friend is GroupUser => Boolean(friend));

export const getSplitParticipants = (
  currentUserParticipant: GroupUser | null,
  selectedSharedFriends: GroupUser[],
) =>
  currentUserParticipant
    ? [currentUserParticipant, ...selectedSharedFriends]
    : selectedSharedFriends;

export const getLiveSplitValuesError = ({
  isSharedRecord,
  participantIds,
  splitMethod,
  splitValues,
  totalAmountCents,
}: {
  isSharedRecord: boolean;
  participantIds: number[];
  splitMethod: SharedExpenseSplitMethod;
  splitValues: AddTransactionRecordFormValues['splitValues'];
  totalAmountCents: number;
}) => {
  if (!isSharedRecord || splitMethod !== 'percentage') {
    return '';
  }

  return validateSharedExpenseSplitValues({
    method: splitMethod,
    participantIds,
    totalAmountCents,
    values: splitValues,
  });
};

export const buildAddTransactionPayload = ({
  formValues,
  isSharedRecord,
  paidByUserId,
  selectedAccount,
  selectedCategory,
  sharedParticipantIds,
  totalAmountCents,
  userCurrencyId,
}: {
  formValues: AddTransactionRecordFormValues;
  isSharedRecord: boolean;
  paidByUserId?: number;
  selectedAccount: Account;
  selectedCategory?: Category;
  sharedParticipantIds: number[];
  totalAmountCents: number;
  userCurrencyId?: number | null;
}): TransactionPayload => {
  const transactionType = isSharedRecord ? 'expense' : formValues.transactionType;
  const payload: TransactionPayload = {
    title:
      formValues.note.trim() ||
      selectedCategory?.name ||
      (isSharedRecord ? 'Shared expense' : 'Personal record'),
    transaction_type: transactionType,
    amount_cents: totalAmountCents,
    account_id: selectedAccount.id,
    category_id: Number(formValues.categoryId),
    transaction_date: new Date().toISOString(),
    note: formValues.note.trim(),
    currency_id: selectedAccount.currency_id ?? userCurrencyId ?? 1,
  };

  if (isSharedRecord && paidByUserId) {
    payload.paid_by = paidByUserId;
    payload.shared_by = sharedParticipantIds;
    payload.split_method = formValues.splitMethod;
    payload.user_shares = buildSharedExpenseUserShares({
      method: formValues.splitMethod,
      participantIds: sharedParticipantIds,
      values: formValues.splitValues,
    });
  }

  return payload;
};
