import assert from 'node:assert/strict';
import test from 'node:test';

import { createSettlementSubmitter } from './settlementSubmission.service';
import type {
  SettlementPayload,
  SettlementSubmissionInput,
} from '../types/settlement.types';
import {
  settlementAmountToCents,
  validateSettlement,
} from '../utils/settlement.utils';

const buildInput = (
  overrides: Partial<SettlementSubmissionInput> = {},
): SettlementSubmissionInput => ({
  accountId: 14,
  amount: '12.34',
  balance: { amount_cents: 2500, type: 'you_owe' },
  friendId: 42,
  friendName: 'Amina Khan',
  note: 'Paid in cash',
  onSubmittingChange: () => undefined,
  token: 'Bearer test-token',
  transactionDate: '2026-06-12T10:30:00.000Z',
  ...overrides,
});

test('converts decimal amounts to integer cents without floating-point math', () => {
  assert.equal(settlementAmountToCents('12.34'), 1234);
  assert.equal(settlementAmountToCents('1,234.5'), 123450);
  assert.equal(settlementAmountToCents('0.01'), 1);
  assert.equal(settlementAmountToCents('1.234'), null);
  assert.equal(settlementAmountToCents('1e2'), null);
});

test('submits the exact settlement payload and invalidates caches after success', async () => {
  const loadingStates: boolean[] = [];
  const requests: { payload: SettlementPayload; token: string }[] = [];
  let invalidationCount = 0;
  const submit = createSettlementSubmitter({
    createSettlement: async (token, payload) => {
      requests.push({ payload, token });
      return { status: 201 };
    },
    invalidateCaches: () => {
      invalidationCount += 1;
    },
  });

  const result = await submit(
    buildInput({
      onSubmittingChange: (isSubmitting) => {
        loadingStates.push(isSubmitting);
      },
    }),
  );

  assert.deepEqual(result, { status: 'success' });
  assert.deepEqual(loadingStates, [true, false]);
  assert.equal(invalidationCount, 1);
  assert.deepEqual(requests, [
    {
      token: 'Bearer test-token',
      payload: {
        account_id: 14,
        amount_cents: 1234,
        note: 'Paid in cash',
        settles_user_id: 42,
        title: 'Settled up with Amina Khan',
        transaction_date: '2026-06-12T10:30:00.000Z',
        transaction_type: 'settlement',
      },
    },
  ]);
  assert.equal('category_id' in requests[0].payload, false);
  assert.equal('group_id' in requests[0].payload, false);
});

test('prevents overpayment before making a request', async () => {
  let requestCount = 0;
  let invalidationCount = 0;
  const submit = createSettlementSubmitter({
    createSettlement: async () => {
      requestCount += 1;
      return { status: 201 };
    },
    invalidateCaches: () => {
      invalidationCount += 1;
    },
  });

  const result = await submit(
    buildInput({
      amount: '25.01',
      balance: { amount_cents: 2500, type: 'you_owe' },
    }),
  );

  assert.equal(result.status, 'validation_error');
  assert.equal(requestCount, 0);
  assert.equal(invalidationCount, 0);
  assert.equal(
    validateSettlement({
      accountId: 14,
      amount: '25.01',
      balance: { amount_cents: 2500, type: 'you_owe' },
    }).amount,
    'The settlement cannot exceed the amount you owe.',
  );
});

test('does not invalidate caches when the API response is not HTTP 201', async () => {
  let invalidationCount = 0;
  const submit = createSettlementSubmitter({
    createSettlement: async () => ({ status: 200 }),
    invalidateCaches: () => {
      invalidationCount += 1;
    },
  });

  const result = await submit(buildInput());

  assert.equal(result.status, 'request_error');
  assert.equal(invalidationCount, 0);
});

test('locks duplicate submissions and clears loading after backend errors', async () => {
  const loadingStates: boolean[] = [];
  let rejectRequest: ((reason: Error) => void) | undefined;
  let invalidationCount = 0;
  const submit = createSettlementSubmitter({
    createSettlement: () =>
      new Promise((_, reject) => {
        rejectRequest = reject;
      }),
    invalidateCaches: () => {
      invalidationCount += 1;
    },
  });
  const input = buildInput({
    onSubmittingChange: (isSubmitting) => {
      loadingStates.push(isSubmitting);
    },
  });

  const firstSubmission = submit(input);
  const duplicateResult = await submit(input);

  assert.deepEqual(duplicateResult, { status: 'duplicate' });
  assert.deepEqual(loadingStates, [true]);

  const backendError = Object.assign(new Error('Validation failed'), {
    fieldErrors: {
      amount_cents: 'Amount is too high.',
    },
  });
  rejectRequest?.(backendError);
  const result = await firstSubmission;

  assert.equal(result.status, 'request_error');
  assert.deepEqual(loadingStates, [true, false]);
  assert.equal(invalidationCount, 0);

  if (result.status === 'request_error') {
    assert.equal(result.errors.amount, 'Amount is too high.');
    assert.equal(result.message, 'Amount is too high.');
  }
});
