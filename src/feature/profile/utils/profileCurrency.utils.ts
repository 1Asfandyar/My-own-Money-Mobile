import type { Account } from '@/types/account.types';
import type { AuthUser } from '@/types/auth.types';
import type { Currency } from '@/types/currency.types';
import { fallbackCurrencies, getCurrencyByCode, getCurrencyById } from '@/utils/currency';

export const getPrimaryAccountCurrencyId = (accounts: Account[]) =>
  accounts.find((account) => !account.is_archived)?.currency_id ??
  accounts[0]?.currency_id ??
  null;

const getUserCurrencyCode = (user: AuthUser | null) =>
  user?.currency_code?.trim() || user?.currency?.code?.trim() || null;

export const resolveProfileCurrencyId = (
  user: AuthUser | null,
  currencies: Currency[],
  accountCurrencyId: number | null,
) => {
  const userCurrencyCode = getUserCurrencyCode(user);

  if (userCurrencyCode) {
    return getCurrencyByCode(userCurrencyCode, currencies).id;
  }

  const userCurrencyId = user?.currency_id ?? null;

  if (userCurrencyId && accountCurrencyId) {
    const remoteUserCurrency = getCurrencyById(userCurrencyId, currencies);
    const accountCurrency = getCurrencyById(accountCurrencyId, currencies);
    const fallbackUserCurrency = fallbackCurrencies.find(
      (currency) => currency.id === userCurrencyId,
    );

    if (
      fallbackUserCurrency &&
      remoteUserCurrency.code !== fallbackUserCurrency.code &&
      accountCurrency.code === fallbackUserCurrency.code
    ) {
      return accountCurrency.id;
    }
  }

  return userCurrencyId ?? accountCurrencyId ?? fallbackCurrencies[0].id;
};
