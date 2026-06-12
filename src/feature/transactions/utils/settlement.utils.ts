import type { FriendshipBalance } from '@/feature/friendships/types/friendship.types';
import type {
  SettlementPayload,
  SettlementValidationErrors,
} from '@/feature/transactions/types/settlement.types';
import type { ApiFieldErrors } from '@/types/api.types';

type BuildSettlementPayloadParams = {
  accountId: number;
  amountCents: number;
  friendId: number;
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
  balance.type === 'you_owe' && balance.amount_cents > 0;

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
    errors.form = 'Only an amount you owe can be settled.';
  }

  if (amountCents === null || amountCents <= 0) {
    errors.amount = 'Enter an amount greater than zero.';
  } else if (amountCents > balance.amount_cents) {
    errors.amount = 'The settlement cannot exceed the amount you owe.';
  }

  if (!accountId) {
    errors.accountId = 'Choose an account.';
  }

  return errors;
};

export const buildSettlementPayload = ({
  accountId,
  amountCents,
  friendId,
  friendName,
  note,
  transactionDate,
}: BuildSettlementPayloadParams): SettlementPayload => ({
  account_id: accountId,
  amount_cents: amountCents,
  ...(note?.trim() ? { note: note.trim() } : {}),
  settles_user_id: friendId,
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
  const accountError = fieldErrors.account_id;
  const message =
    fieldErrors.base ||
    amountError ||
    accountError ||
    fieldErrors.settles_user_id ||
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
