import type { Account } from '@/types/account.types';
import type { Currency } from '@/types/currency.types';

export type AccountFormModalProps = {
  accountName: string;
  balance: string;
  currencyCode: string;
  error: string;
  isSaving: boolean;
  isVisible: boolean;
  onChangeAccountName: (value: string) => void;
  onChangeBalance: (value: string) => void;
  onClose: () => void;
  onSave: () => void;
};

export type AccountManagementCardProps = {
  account: Account;
  currencies: Currency[];
  isDeleting: boolean;
  onDelete: (account: Account) => void;
};

export type ManageAccountsViewModel = {
  accountName: string;
  accounts: Account[];
  balance: string;
  currencies: Currency[];
  error: string;
  formError: string;
  isAddModalVisible: boolean;
  isLoading: boolean;
  isSaving: boolean;
  onBack: () => void;
  onChangeAccountName: (value: string) => void;
  onChangeBalance: (value: string) => void;
  onCloseAddModal: () => void;
  onDeleteAccount: (account: Account) => void;
  onOpenAddModal: () => void;
  onRefresh: () => void;
  onSaveAccount: () => void;
  removingAccountId: number | null;
  selectedCurrencyCode: string;
};

export type ManageAccountsViewProps = {
  manager: ManageAccountsViewModel;
};
