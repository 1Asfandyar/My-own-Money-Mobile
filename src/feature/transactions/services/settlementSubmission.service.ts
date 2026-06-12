import type {
  SettlementSubmissionInput,
  SettlementSubmissionResult,
  SettlementSubmitterDependencies,
} from '@/feature/transactions/types/settlement.types';
import {
  buildSettlementPayload,
  getSettlementRequestError,
  settlementAmountToCents,
  validateSettlement,
} from '@/feature/transactions/utils/settlement.utils';

export const createSettlementSubmitter = (
  dependencies: SettlementSubmitterDependencies,
) => {
  let isSubmitting = false;

  return async (
    input: SettlementSubmissionInput,
  ): Promise<SettlementSubmissionResult> => {
    if (isSubmitting) {
      return { status: 'duplicate' };
    }

    const errors = validateSettlement(input);

    if (Object.keys(errors).length > 0) {
      return { status: 'validation_error', errors };
    }

    const amountCents = settlementAmountToCents(input.amount);

    if (amountCents === null || !input.accountId) {
      return {
        status: 'validation_error',
        errors: { form: 'Check the settlement details and try again.' },
      };
    }

    isSubmitting = true;
    input.onSubmittingChange(true);

    try {
      const result = await dependencies.createSettlement(
        input.token,
        buildSettlementPayload({
          accountId: input.accountId,
          amountCents,
          friendId: input.friendId,
          friendName: input.friendName,
          note: input.note,
          transactionDate: input.transactionDate,
        }),
      );

      if (result.status !== 201) {
        return {
          status: 'request_error',
          errors: {},
          message: 'The settlement was not created. Please try again.',
        };
      }

      dependencies.invalidateCaches();

      return { status: 'success' };
    } catch (error) {
      const requestError = getSettlementRequestError(error);

      return {
        status: 'request_error',
        errors: requestError.errors,
        message: requestError.message,
      };
    } finally {
      isSubmitting = false;
      input.onSubmittingChange(false);
    }
  };
};
