import useSharedTransactionDetail from '@/feature/transactions/hooks/useSharedTransactionDetail';
import SharedTransactionDetailView from '@/feature/transactions/views/SharedTransactionDetailView';

const SharedTransactionDetailScreen = () => {
  const detail = useSharedTransactionDetail();

  return <SharedTransactionDetailView detail={detail} />;
};

export default SharedTransactionDetailScreen;
