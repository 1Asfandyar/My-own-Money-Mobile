import { useRouter } from 'expo-router';
import { useCallback } from 'react';

import { ROUTES } from '@/config/routes';
import useAddTransactionRecord from '@/feature/transactions/hooks/useAddTransactionRecord';
import type { AddTransactionRecordScreenProps } from '@/feature/transactions/types/addTransactionRecord.types';
import AddTransactionRecordView from '@/feature/transactions/views/AddTransactionRecordView';

const AddTransactionRecordScreen = ({
  recordKind,
}: AddTransactionRecordScreenProps) => {
  const router = useRouter();
  const handleSaved = useCallback(() => {
    if (router.canGoBack()) {
      router.back();
      return;
    }

    router.replace(ROUTES.MAIN_HOME);
  }, [router]);
  const form = useAddTransactionRecord(recordKind, handleSaved);
  const formWithNavigation = {
    ...form,
    cancel: () => router.back(),
  };

  return <AddTransactionRecordView form={formWithNavigation} />;
};

export default AddTransactionRecordScreen;
