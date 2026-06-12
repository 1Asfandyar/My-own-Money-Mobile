import assert from 'node:assert/strict';
import test from 'node:test';

import {
  invalidateSettlementData,
  useServerDataInvalidationStore,
} from './serverDataInvalidation.store';

test('settlement invalidation marks every affected server-data cache stale', () => {
  const before = useServerDataInvalidationStore.getState();

  invalidateSettlementData();

  const after = useServerDataInvalidationStore.getState();

  assert.equal(after.accounts, before.accounts + 1);
  assert.equal(after.friendships, before.friendships + 1);
  assert.equal(after.transactions, before.transactions + 1);
  assert.equal(after.reports, before.reports + 1);
});
