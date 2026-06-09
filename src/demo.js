import {
  buildUsageInvoice,
  collectSubscription,
  createAllowance,
  createPlan,
  formatUsdc,
  remainingAllowance,
  spendFromAllowance,
  subscribeToPlan,
} from './domain.js';

const USDC = 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v';
const now = 1_785_000_000;

const plan = createPlan({
  id: 'maple-api-pro-monthly',
  merchant: 'MapleData API Guild',
  mint: USDC,
  amountAtomic: 49_000_000n,
  periodHours: 24 * 30,
  destinations: ['MapleDataTreasury1111111111111111111111111111'],
  pullers: ['MapleDataBillingWorker111111111111111111111111'],
  metadataUri: 'https://example.com/maple-api-pro-plan.json',
  createdAt: now,
});

let subscription = subscribeToPlan({
  plan,
  subscriber: 'CanadianBuilderWallet11111111111111111111111',
  authorityInitId: 17n,
});

let agentAllowance = createAllowance({
  id: 'agent-research-budget-week-1',
  delegator: subscription.subscriber,
  delegatee: 'NorthStarAgentWorker11111111111111111111111',
  capAtomic: 15_000_000n,
  expiresAt: now + 7 * 24 * 60 * 60,
});

const invoices = [
  buildUsageInvoice({ endpoint: '/v1/canadian-market-search', calls: 32, unitPriceAtomic: 85_000n }),
  buildUsageInvoice({ endpoint: '/v1/company-summaries', calls: 18, unitPriceAtomic: 120_000n }),
  buildUsageInvoice({ endpoint: '/v1/export/report', calls: 2, unitPriceAtomic: 350_000n }),
];

for (const invoice of invoices) {
  agentAllowance = spendFromAllowance(agentAllowance, invoice.totalAtomic, now + 600);
}

subscription = collectSubscription({ plan, subscription, now });

const summary = {
  concept: 'Bounded AI-agent API spend for Canadian builders',
  primitiveCoverage: [
    'subscription plan: merchant-published API tier with immutable monthly terms',
    'fixed allowance: subscriber gives an AI agent a capped one-week usage budget',
    'pull collection: merchant billing worker collects the monthly plan charge',
  ],
  planChargeUsdc: formatUsdc(plan.terms.amountAtomic),
  agentSpendUsdc: formatUsdc(agentAllowance.spentAtomic),
  agentBudgetRemainingUsdc: formatUsdc(remainingAllowance(agentAllowance)),
  invoiceCount: invoices.length,
  cyclesPaid: subscription.cyclesPaid,
};

console.log(JSON.stringify(summary, null, 2));
