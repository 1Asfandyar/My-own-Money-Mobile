import useRecordPayment from '@/feature/transactions/hooks/useRecordPayment';
import RecordPaymentView from '@/feature/transactions/views/RecordPaymentView';

const RecordPaymentScreen = () => {
  const payment = useRecordPayment();

  return <RecordPaymentView payment={payment} />;
};

export default RecordPaymentScreen;
