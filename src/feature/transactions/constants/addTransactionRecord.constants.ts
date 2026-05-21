import type {
  AddTransactionRecordContent,
  AddTransactionRecordFormValues,
  AddTransactionRecordKind,
  TransactionTypeTabConfig,
} from '@/feature/transactions/types/addTransactionRecord.types';

export const addTransactionRecordInitialValues: AddTransactionRecordFormValues = {
  accountId: '',
  amount: '',
  categoryId: '',
  note: '',
  splitMethod: 'equal',
  splitValues: {},
  sharedUserIds: [],
  transactionType: 'expense',
};

export const transactionTypeTabs: TransactionTypeTabConfig[] = [
  {
    value: 'expense',
    label: 'Expense',
    iconName: 'trending-down-outline',
  },
  {
    value: 'income',
    label: 'Income',
    iconName: 'trending-up-outline',
  },
];

export const addTransactionRecordContent: Record<
  AddTransactionRecordKind,
  AddTransactionRecordContent
> = {
  personal: {
    iconName: 'person-outline',
    submitLabel: 'Save personal record',
    subtitle: 'Track money movement for your own account.',
    title: 'Add personal record',
  },
  shared: {
    iconName: 'people-outline',
    submitLabel: 'Save shared expense',
    subtitle: 'Split an expense with friends and keep everyone included.',
    title: 'Add shared expense',
  },
};
