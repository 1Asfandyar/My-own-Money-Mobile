import { Currency } from '@/types/currency.types';

const fallbackTimestamp = '1970-01-01T00:00:00.000Z';

export const fallbackCurrencies: Currency[] = [
  {
    id: 1,
    code: 'PKR',
    name: 'Pakistani Rupee',
    symbol: 'Rs',
    created_at: fallbackTimestamp,
    updated_at: fallbackTimestamp,
  },
  {
    id: 2,
    code: 'USD',
    name: 'US Dollar',
    symbol: '$',
    created_at: fallbackTimestamp,
    updated_at: fallbackTimestamp,
  },
  {
    id: 3,
    code: 'EUR',
    name: 'Euro',
    symbol: '€',
    created_at: fallbackTimestamp,
    updated_at: fallbackTimestamp,
  },
  {
    id: 4,
    code: 'GBP',
    name: 'British Pound',
    symbol: '£',
    created_at: fallbackTimestamp,
    updated_at: fallbackTimestamp,
  },
];

export const getCurrencyById = (
  id?: number | null,
  currencies = fallbackCurrencies,
) => currencies.find((currency) => currency.id === id) ?? currencies[0];

export const getCurrencyByCode = (
  code?: string | null,
  currencies = fallbackCurrencies,
) => currencies.find((currency) => currency.code === code) ?? currencies[0];

export const formatCents = (
  cents: number,
  currencyId?: number | null,
  currencies = fallbackCurrencies,
  maximumFractionDigits = 2,
) => {
  const currency = getCurrencyById(currencyId, currencies);
  const amount = cents / 100;

  return `${currency.symbol} ${amount.toLocaleString(undefined, {
    minimumFractionDigits: 0,
    maximumFractionDigits,
  })}`;
};

export const formatCentsBySymbol = (
  cents: number,
  currencySymbol: string,
  maximumFractionDigits = 2,
) => {
  const amount = cents / 100;

  return `${currencySymbol} ${amount.toLocaleString(undefined, {
    minimumFractionDigits: 0,
    maximumFractionDigits,
  })}`;
};

/**
 * Formats cents using a currency symbol with no space (e.g. "$39,350").
 * Shared across the Reports screen to keep formatting consistent.
 */
export const formatAmount = (
  cents: number,
  symbol: string,
  { useAbsoluteValue = false }: { useAbsoluteValue?: boolean } = {},
): string => {
  const amount = (useAbsoluteValue ? Math.abs(cents) : cents) / 100;
  return `${symbol}${amount.toLocaleString(undefined, {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  })}`;
};

export const moneyInputToCents = (value: string) => {
  const normalized = value.replace(/,/g, '').trim();
  const amount = Number(normalized);

  if (!Number.isFinite(amount)) return 0;

  return Math.round(amount * 100);
};
