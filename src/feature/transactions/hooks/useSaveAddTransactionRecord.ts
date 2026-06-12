import type { FormikHelpers } from 'formik';
import { useCallback, useRef, useState } from 'react';

import {
  createTransaction,
  deleteTransaction,
  updateTransaction,
} from '@/feature/transactions/api/transactions.api';
import type { Category } from '@/feature/categories/types/category.types';
import type { AddTransactionRecordFormValues } from '@/feature/transactions/types/addTransactionRecord.types';
import {
  buildAddTransactionPayload,
  getAddTransactionAmountCents,
} from '@/feature/transactions/utils/addTransactionRecord.utils';
import {
  getSharedExpenseSplitParticipantIds,
  validateSharedExpenseSplitValues,
} from '@/feature/transactions/utils/sharedExpenseSplit.utils';
import { ApiError } from '@/services/api';
import type { Account } from '@/types/account.types';
import type { AuthUser } from '@/types/auth.types';

type UseSaveAddTransactionRecordParams = {
  activeAccounts: Account[];
  categories: Category[];
  editingTransactionDate?: string | null;
  editingTransactionId?: number | null;
  groupId?: number | null;
  isSharedRecord: boolean;
  onSaved: () => void;
  setFormError: (error: string) => void;
  setSplitValuesError: (error: string) => void;
  token: string | null;
  user: AuthUser | null;
};

const useSaveAddTransactionRecord = ({
  activeAccounts,
  categories,
  editingTransactionDate,
  editingTransactionId,
  groupId,
  isSharedRecord,
  onSaved,
  setFormError,
  setSplitValuesError,
  token,
  user,
}: UseSaveAddTransactionRecordParams) => {
  const [isSavingRecord, setIsSavingRecord] = useState(false);
  const [isDeletingRecord, setIsDeletingRecord] = useState(false);
  const isSavingRecordRef = useRef(false);
  const isDeletingRecordRef = useRef(false);

  const lockSave = useCallback(() => {
    if (isSavingRecordRef.current) {
      return false;
    }

    isSavingRecordRef.current = true;
    setIsSavingRecord(true);
    return true;
  }, []);

  const unlockSave = useCallback(() => {
    isSavingRecordRef.current = false;
    setIsSavingRecord(false);
  }, []);

  const lockDelete = useCallback(() => {
    if (isDeletingRecordRef.current) {
      return false;
    }

    isDeletingRecordRef.current = true;
    setIsDeletingRecord(true);
    return true;
  }, []);

  const unlockDelete = useCallback(() => {
    isDeletingRecordRef.current = false;
    setIsDeletingRecord(false);
  }, []);

  const saveRecord = useCallback(
    async (
      formValues: AddTransactionRecordFormValues,
      helpers: FormikHelpers<AddTransactionRecordFormValues>,
    ) => {
      if (!lockSave()) {
        return;
      }

      if (!token) {
        setFormError('Please sign in again to save this record.');
        unlockSave();
        return;
      }

      if (isSharedRecord && !user?.id) {
        setFormError('Please sign in again to save this shared expense.');
        unlockSave();
        return;
      }

      const selectedAccount = activeAccounts.find(
        (account) => account.id === Number(formValues.accountId),
      );
      const selectedCategory = categories.find(
        (category) => category.id === Number(formValues.categoryId),
      );

      if (!selectedAccount) {
        helpers.setFieldError('accountId', 'Choose an account.');
        unlockSave();
        return;
      }

      const totalAmountCents = getAddTransactionAmountCents(formValues.amount);
      const sharedParticipantIds =
        isSharedRecord && user?.id
          ? getSharedExpenseSplitParticipantIds(user.id, formValues.sharedUserIds)
          : [];

      if (isSharedRecord) {
        const nextSplitValuesError = validateSharedExpenseSplitValues({
          method: formValues.splitMethod,
          participantIds: sharedParticipantIds,
          totalAmountCents,
          values: formValues.splitValues,
        });

        if (nextSplitValuesError) {
          setSplitValuesError(nextSplitValuesError);
          unlockSave();
          return;
        }
      }

      setFormError('');
      setSplitValuesError('');

      try {
        const payload = buildAddTransactionPayload({
          formValues,
          groupId,
          isSharedRecord,
          paidByUserId: user?.id,
          selectedAccount,
          selectedCategory,
          sharedParticipantIds,
          totalAmountCents,
          userCurrencyId: user?.currency_id,
        });

        if (editingTransactionDate) {
          payload.transaction_date = editingTransactionDate;
        }

        if (editingTransactionId) {
          await updateTransaction(token, editingTransactionId, payload);
        } else {
          await createTransaction(token, payload);
        }
        onSaved();
      } catch (error) {
        unlockSave();

        if (error instanceof ApiError) {
          setFormError(error.fieldErrors.base || error.message);
          setSplitValuesError(
            error.fieldErrors.user_shares || error.fieldErrors.split_method || '',
          );
          helpers.setErrors({
            amount: error.fieldErrors.amount_cents,
            accountId: error.fieldErrors.account_id,
            categoryId: error.fieldErrors.category_id,
            note: error.fieldErrors.note,
            sharedUserIds:
              error.fieldErrors.shared_by || error.fieldErrors.user_shares,
          });
          return;
        }

        setFormError('Could not save this record. Please try again.');
      }
    },
    [
      activeAccounts,
      categories,
      editingTransactionDate,
      editingTransactionId,
      groupId,
      isSharedRecord,
      lockSave,
      onSaved,
      setFormError,
      setSplitValuesError,
      token,
      unlockSave,
      user,
    ],
  );

  const deleteRecord = useCallback(async () => {
    if (!editingTransactionId || !lockDelete()) {
      return;
    }

    if (!token) {
      setFormError('Please sign in again to delete this record.');
      unlockDelete();
      return;
    }

    setFormError('');

    try {
      await deleteTransaction(token, editingTransactionId);
      onSaved();
    } catch (error) {
      unlockDelete();

      if (error instanceof ApiError) {
        setFormError(error.fieldErrors.base || error.message);
        return;
      }

      setFormError('Could not delete this record. Please try again.');
    }
  }, [
    editingTransactionId,
    lockDelete,
    onSaved,
    setFormError,
    token,
    unlockDelete,
  ]);

  return {
    deleteRecord,
    isDeletingRecord,
    isSavingRecord,
    saveRecord,
  };
};

export default useSaveAddTransactionRecord;
