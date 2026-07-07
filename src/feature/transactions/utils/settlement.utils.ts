import type { FriendshipBalance } from '@/feature/friendships/types/friendship.types';
import type {
  SettlementPayload,
  SettlementValidationErrors,
} from '@/feature/transactions/types/settlement.types';
import type { ApiFieldErrors } from '@/types/api.types';

type BuildSettlementPayloadParams = {
  accountId?: number;
  amountCents: number;
  isDebtorView: boolean;
  paidByUserId: number;
  paidToUserId: number;
  friendName: string;
  note?: string;
  transactionDate: string;
};

export const settlementCentsToInput = (cents: number) => {
  const whole = Math.floor(cents / 100);
  const fraction = cents % 100;

  return fraction === 0
    ? String(whole)
    : `${whole}.${String(fraction).padStart(2, '0').replace(/0$/, '')}`;
};

export const settlementAmountToCents = (value: string): number | null => {
  const normalized = value.replace(/,/g, '').trim();

  if (!/^\d+(?:\.\d{0,2})?$/.test(normalized)) {
    return null;
  }

  const [wholePart, fractionPart = ''] = normalized.split('.');
  const whole = Number(wholePart);
  const fraction = Number(fractionPart.padEnd(2, '0'));

  if (!Number.isSafeInteger(whole) || !Number.isSafeInteger(fraction)) {
    return null;
  }

  const amountCents = whole * 100 + fraction;

  return Number.isSafeInteger(amountCents) ? amountCents : null;
};

export const isSettlementAllowed = (balance: FriendshipBalance) =>
  balance.amount_cents > 0 && balance.type !== 'settled_up';

export const validateSettlement = ({
  accountId,
  amount,
  balance,
}: {
  accountId: number | null;
  amount: string;
  balance: FriendshipBalance;
}): SettlementValidationErrors => {
  const errors: SettlementValidationErrors = {};
  const amountCents = settlementAmountToCents(amount);

  if (!isSettlementAllowed(balance)) {
    errors.form = 'Nothing to settle.';
  }

  if (amountCents === null || amountCents <= 0) {
    errors.amount = 'Enter an amount greater than zero.';
  } else if (amountCents > balance.amount_cents) {
    errors.amount = 'The settlement cannot exceed the outstanding balance.';
  }

  if (!accountId) {
    errors.accountId = 'Choose an account.';
  }

  return errors;
};

export const buildSettlementPayload = ({
  accountId,
  amountCents,
  isDebtorView,
  paidByUserId,
  paidToUserId,
  friendName,
  note,
  transactionDate,
}: BuildSettlementPayloadParams): SettlementPayload => ({
  amount_cents: amountCents,
  ...(note?.trim() ? { note: note.trim() } : {}),
  paid_by_id: paidByUserId,
  paid_to_id: paidToUserId,
  ...(accountId && isDebtorView ? { paid_by_account_id: accountId } : {}),
  ...(accountId && !isDebtorView ? { paid_to_account_id: accountId } : {}),
  title: `Settled up with ${friendName}`,
  transaction_date: transactionDate,
  transaction_type: 'settlement',
});

export const getSettlementRequestError = (error: unknown) => {
  const fieldErrors =
    error instanceof Error &&
    'fieldErrors' in error &&
    typeof error.fieldErrors === 'object' &&
    error.fieldErrors !== null
      ? (error.fieldErrors as ApiFieldErrors)
      : null;

  if (!fieldErrors) {
    return {
      errors: {},
      message:
        error instanceof Error
          ? error.message
          : 'Could not record this settlement.',
    };
  }

  const amountError = fieldErrors.amount_cents;
  const accountError =
    fieldErrors.paid_by_account_id || fieldErrors.paid_to_account_id;
  const message =
    fieldErrors.base ||
    amountError ||
    accountError ||
    fieldErrors.paid_by_id ||
    fieldErrors.paid_to_id ||
    fieldErrors.transaction_date ||
    fieldErrors.note ||
    (error instanceof Error
      ? error.message
      : 'Could not record this settlement.');

  return {
    errors: {
      ...(accountError ? { accountId: accountError } : {}),
      ...(amountError ? { amount: amountError } : {}),
    },
    message,
  };
};
