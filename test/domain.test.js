import assert from 'node:assert/strict';
import test from 'node:test';
import {
  buildUsageInvoice,
  collectSubscription,
  createAllowance,
  createPlan,
  formatUsdc,
  spendFromAllowance,
  subscribeToPlan,
} from '../src/domain.js';

test('allowance enforces capped AI-agent spend', () => {
  let allowance = createAllowance({
    id: 'weekly-agent-budget',
    delegator: 'user',
    delegatee: 'agent',
    capAtomic: 1_000_000n,
    expiresAt: 2_000,
  });

  allowance = spendFromAllowance(allowance, 600_000n, 1_000);
  assert.equal(allowance.spentAtomic, 600_000n);
  assert.throws(() => spendFromAllowance(allowance, 500_000n, 1_001), /cap exceeded/);
});

test('allowance expires', () => {
  const allowance = createAllowance({
    id: 'short-budget',
    delegator: 'user',
    delegatee: 'agent',
    capAtomic: 1_000_000n,
    expiresAt: 2_000,
  });
  assert.throws(() => spendFromAllowance(allowance, 1n, 2_000), /expired/);
});

test('subscription collection uses snapshotted plan terms', () => {
  const plan = createPlan({
    id: 'monthly-api',
    merchant: 'merchant',
    mint: 'USDC',
    amountAtomic: 49_000_000n,
    periodHours: 720,
    metadataUri: 'https://example.com/plan.json',
    createdAt: 100,
  });
  const sub = subscribeToPlan({ plan, subscriber: 'user', authorityInitId: 1n });
  const collected = collectSubscription({ plan, subscription: sub, now: 100 });

  assert.equal(collected.cyclesPaid, 1);

  const tamperedPlan = {
    ...plan,
    terms: { ...plan.terms, amountAtomic: 59_000_000n },
  };
  assert.throws(() => collectSubscription({ plan: tamperedPlan, subscription: sub, now: 100 }), /terms/);
});

test('usage invoice and formatting are deterministic', () => {
  const invoice = buildUsageInvoice({ endpoint: '/v1/search', calls: 3, unitPriceAtomic: 125_000n });
  assert.equal(invoice.totalAtomic, 375_000n);
  assert.equal(formatUsdc(invoice.totalAtomic), '0.375');
});
