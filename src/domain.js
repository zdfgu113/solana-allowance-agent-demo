export const HOURS = 60 * 60;

export function createAllowance({ id, delegator, delegatee, capAtomic, expiresAt }) {
  if (!id || !delegator || !delegatee) throw new Error('id, delegator, and delegatee are required');
  assertNonNegativeBigInt(capAtomic, 'capAtomic');
  if (!Number.isInteger(expiresAt) || expiresAt <= 0) throw new Error('expiresAt must be a unix timestamp');

  return {
    id,
    delegator,
    delegatee,
    capAtomic,
    spentAtomic: 0n,
    expiresAt,
  };
}

export function spendFromAllowance(allowance, amountAtomic, now) {
  assertNonNegativeBigInt(amountAtomic, 'amountAtomic');
  if (now >= allowance.expiresAt) throw new Error('allowance expired');
  const nextSpent = allowance.spentAtomic + amountAtomic;
  if (nextSpent > allowance.capAtomic) throw new Error('allowance cap exceeded');
  return { ...allowance, spentAtomic: nextSpent };
}

export function remainingAllowance(allowance) {
  return allowance.capAtomic - allowance.spentAtomic;
}

export function createPlan({
  id,
  merchant,
  mint,
  amountAtomic,
  periodHours,
  destinations = [],
  pullers = [],
  metadataUri,
  createdAt,
}) {
  if (!id || !merchant || !mint || !metadataUri) {
    throw new Error('id, merchant, mint, and metadataUri are required');
  }
  assertNonNegativeBigInt(amountAtomic, 'amountAtomic');
  if (!Number.isInteger(periodHours) || periodHours <= 0) throw new Error('periodHours must be positive');

  return {
    id,
    merchant,
    mint,
    terms: {
      amountAtomic,
      periodHours,
      createdAt,
    },
    destinations,
    pullers,
    metadataUri,
    status: 'active',
  };
}

export function subscribeToPlan({ plan, subscriber, authorityInitId }) {
  if (plan.status !== 'active') throw new Error('plan is not active');
  return {
    planId: plan.id,
    merchant: plan.merchant,
    subscriber,
    authorityInitId,
    termsSnapshot: { ...plan.terms },
    expiresAt: 0,
    cyclesPaid: 0,
  };
}

export function collectSubscription({ plan, subscription, now }) {
  if (subscription.planId !== plan.id) throw new Error('subscription belongs to a different plan');
  if (subscription.expiresAt !== 0 && now >= subscription.expiresAt) {
    throw new Error('subscription cancelled and grace period elapsed');
  }
  if (!sameTerms(plan.terms, subscription.termsSnapshot)) {
    throw new Error('plan terms no longer match subscription snapshot');
  }

  const nextDueAt = subscription.termsSnapshot.createdAt + subscription.cyclesPaid * subscription.termsSnapshot.periodHours * HOURS;
  if (now < nextDueAt) throw new Error('subscription is not due yet');
  return {
    ...subscription,
    cyclesPaid: subscription.cyclesPaid + 1,
  };
}

export function buildUsageInvoice({ endpoint, calls, unitPriceAtomic }) {
  if (!endpoint || !Number.isInteger(calls) || calls <= 0) throw new Error('endpoint and positive calls are required');
  assertNonNegativeBigInt(unitPriceAtomic, 'unitPriceAtomic');
  return {
    endpoint,
    calls,
    unitPriceAtomic,
    totalAtomic: BigInt(calls) * unitPriceAtomic,
  };
}

export function formatUsdc(atomic, decimals = 6) {
  assertNonNegativeBigInt(atomic, 'atomic');
  const scale = 10n ** BigInt(decimals);
  const whole = atomic / scale;
  const fraction = String(atomic % scale).padStart(decimals, '0').replace(/0+$/, '');
  return fraction ? `${whole}.${fraction}` : String(whole);
}

function sameTerms(a, b) {
  return (
    a.amountAtomic === b.amountAtomic &&
    a.periodHours === b.periodHours &&
    a.createdAt === b.createdAt
  );
}

function assertNonNegativeBigInt(value, name) {
  if (typeof value !== 'bigint' || value < 0n) throw new Error(`${name} must be a non-negative bigint`);
}
