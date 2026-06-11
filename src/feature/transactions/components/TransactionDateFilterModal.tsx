import useTransactionDateFilterModal from '@/feature/transactions/hooks/useTransactionDateFilterModal';
import type { TransactionDateFilterModalProps } from '@/feature/transactions/types/transactionDateFilter.types';
import TransactionDateFilterModalView from '@/feature/transactions/views/TransactionDateFilterModalView';

const TransactionDateFilterModal = (
  props: TransactionDateFilterModalProps,
) => {
  const viewModel = useTransactionDateFilterModal(props);

  return (
    <TransactionDateFilterModalView
      accounts={props.accounts}
      categories={props.categories}
      isVisible={props.isVisible}
      onClose={props.onClose}
      {...viewModel}
    />
  );
};

export default TransactionDateFilterModal;
