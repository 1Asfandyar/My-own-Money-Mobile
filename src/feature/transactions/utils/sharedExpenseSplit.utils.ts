import type { SharedExpenseSplitMethod, SharedExpenseSplitValueMap } from '@/feature/transactions/types/sharedExpenseSplit.types';
import { moneyInputToCents } from '@/utils/currency';

const DECIMAL_INPUT_PATTERN = /[^0-9.]/g;

const toNumber = (value?: string) => {
  const amount = Number(value);

  return Number.isFinite(amount) ? amount : 0;
};

const roundToTwoPlaces = (value: number) =>
  Number.isFinite(value) ? Math.round(value * 100) / 100 : 0;

const formatInputNumber = (value: number) => {
  const rounded = roundToTwoPlaces(value);

  return Number.isInteger(rounded)
    ? String(rounded)
    : rounded.toFixed(2).replace(/0+$/, '').replace(/\.$/, '');
};

export const sanitizeSharedExpenseSplitInput = (
  method: SharedExpenseSplitMethod,
  value: string,
) => {
  const sanitized = value.replace(DECIMAL_INPUT_PATTERN, '');
  const [integerPart, ...decimalParts] = sanitized.split('.');
  const normalized =
    decimalParts.length > 0
      ? `${integerPart}.${decimalParts.join('')}`
      : integerPart;

  if (method === 'shares') {
    return normalized.replace(/\..*$/, '');
  }

  return normalized;
};

export const getSharedExpenseSplitInputSuffix = (
  method: SharedExpenseSplitMethod,
) => {
  if (method === 'percentage') {
    return '%';
  }

  if (method === 'shares') {
    return 'shares';
  }

  return '';
};

export const areSplitValueMapsEqual = (
  firstValues: SharedExpenseSplitValueMap,
  secondValues: SharedExpenseSplitValueMap,
) => {
  const firstKeys = Object.keys(firstValues);
  const secondKeys = Object.keys(secondValues);

  return (
    firstKeys.length === secondKeys.length &&
    firstKeys.every(
      (key) =>
        Object.prototype.hasOwnProperty.call(secondValues, key) &&
        firstValues[key] === secondValues[key],
    )
  );
};

export const getSharedExpenseSplitParticipantIds = (
  paidByUserId: number,
  selectedFriendIds: number[],
) =>
  Array.from(
    new Set([
      paidByUserId,
      ...selectedFriendIds.filter((userId) => userId !== paidByUserId),
    ]),
  );

export const getDefaultSharedExpenseSplitValues = (
  method: SharedExpenseSplitMethod,
  participantIds: number[],
  totalAmountCents: number,
): SharedExpenseSplitValueMap => {
  if (method === 'equal') {
    return {};
  }

  if (method === 'shares') {
    return Object.fromEntries(participantIds.map((id) => [String(id), '1']));
  }

  if (method === 'percentage') {
    const basePercentage =
      participantIds.length > 0
        ? Math.floor((100 / participantIds.length) * 100) / 100
        : 0;
    let assignedPercentage = 0;

    return Object.fromEntries(
      participantIds.map((id, index) => {
        const isLast = index === participantIds.length - 1;
        const value = isLast ? 100 - assignedPercentage : basePercentage;

        assignedPercentage += value;

        return [String(id), formatInputNumber(value)];
      }),
    );
  }

  const baseAmountCents =
    participantIds.length > 0 ? Math.floor(totalAmountCents / participantIds.length) : 0;
  let assignedAmountCents = 0;

  return Object.fromEntries(
    participantIds.map((id, index) => {
      const isLast = index === participantIds.length - 1;
      const amountCents = isLast
        ? totalAmountCents - assignedAmountCents
        : baseAmountCents;

      assignedAmountCents += amountCents;

      return [String(id), formatInputNumber(amountCents / 100)];
    }),
  );
};

export const reconcileSharedExpenseSplitValues = (
  values: SharedExpenseSplitValueMap,
  method: SharedExpenseSplitMethod,
  participantIds: number[],
  totalAmountCents: number,
) => {
  if (method === 'equal') {
    return {};
  }

  const defaults = getDefaultSharedExpenseSplitValues(
    method,
    participantIds,
    totalAmountCents,
  );

  return Object.fromEntries(
    participantIds.map((id) => {
      const key = String(id);

      return [key, values[key] ?? defaults[key] ?? ''];
    }),
  );
};

export const getEqualSplitAmountCents = (
  totalAmountCents: number,
  participantCount: number,
  participantIndex: number,
) => {
  if (participantCount <= 0) {
    return 0;
  }

  const baseAmountCents = Math.floor(totalAmountCents / participantCount);
  const remainderCents = totalAmountCents - baseAmountCents * participantCount;

  return baseAmountCents + (participantIndex < remainderCents ? 1 : 0);
};

export const getSplitAmountCents = (
  method: SharedExpenseSplitMethod,
  value: string | undefined,
  totalAmountCents: number,
  totalShares: number,
) => {
  if (method === 'exact') {
    return moneyInputToCents(value ?? '');
  }

  if (method === 'percentage') {
    return Math.round(totalAmountCents * (toNumber(value) / 100));
  }

  if (method === 'shares') {
    return totalShares > 0
      ? Math.round(totalAmountCents * (toNumber(value) / totalShares))
      : 0;
  }

  return 0;
};

export const validateSharedExpenseSplitValues = ({
  method,
  participantIds,
  totalAmountCents,
  values,
}: {
  method: SharedExpenseSplitMethod;
  participantIds: number[];
  totalAmountCents: number;
  values: SharedExpenseSplitValueMap;
}) => {
  if (method === 'equal') {
    return '';
  }

  const hasMissingValue = participantIds.some((id) => !values[String(id)]?.trim());

  if (hasMissingValue) {
    return 'Enter a split value for every participant.';
  }

  if (method === 'shares') {
    const shares = participantIds.map((id) => toNumber(values[String(id)]));

    return shares.some((share) => share <= 0)
      ? 'Shares must be greater than zero.'
      : '';
  }

  if (method === 'percentage') {
    const totalPercentage = participantIds.reduce(
      (total, id) => total + toNumber(values[String(id)]),
      0,
    );

    return Math.abs(totalPercentage - 100) > 0.01
      ? 'Percentages must add up to 100%.'
      : '';
  }

  const totalExactAmountCents = participantIds.reduce(
    (total, id) => total + moneyInputToCents(values[String(id)] ?? ''),
    0,
  );

  return Math.abs(totalExactAmountCents - totalAmountCents) > 1
    ? 'Exact amounts must add up to the total.'
    : '';
};

export const buildSharedExpenseUserShares = ({
  method,
  participantIds,
  values,
}: {
  method: SharedExpenseSplitMethod;
  participantIds: number[];
  values: SharedExpenseSplitValueMap;
}) => {
  if (method === 'equal') {
    return undefined;
  }

  return participantIds.map((userId) => {
    const value = values[String(userId)] ?? '';

    if (method === 'exact') {
      return {
        user_id: userId,
        amount_cents: moneyInputToCents(value),
      };
    }

    if (method === 'percentage') {
      return {
        user_id: userId,
        percentage: toNumber(value),
      };
    }

    return {
      user_id: userId,
      shares: toNumber(value),
    };
  });
};
