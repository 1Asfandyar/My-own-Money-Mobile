import useTransactionDetail from '@/feature/transactions/hooks/useTransactionDetail';
import TransactionDetailView from '@/feature/transactions/views/TransactionDetailView';

const TransactionDetailScreen = () => {
  const detail = useTransactionDetail();

  return <TransactionDetailView detail={detail} />;
};

export default TransactionDetailScreen;
