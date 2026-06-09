# Solana Allowance Agent Demo

A runnable technical demo for Solana native subscriptions and allowances.

The project shows how a Canadian API provider can combine:

- **Subscription plans** for predictable monthly API access.
- **Fixed allowances** for bounded AI-agent spending.
- **Stablecoin settlement** with USDC-style atomic units.

The sample app is called **Maple Meter**: a fictional Canadian data API that lets a builder subscribe to a monthly API tier while giving an autonomous agent a separate one-week usage budget.

## Why This Matters

Solana's subscriptions program supports fixed delegations, recurring delegations, and subscription plans in one shared program. That makes it possible to build agent commerce flows where users can authorize useful automation without giving an agent unlimited wallet control.

In this demo:

1. A merchant publishes a `49 USDC / 30 days` API plan.
2. A Canadian builder subscribes to the plan.
3. The builder grants a `15 USDC / 7 days` fixed allowance to an AI agent.
4. The agent pays for metered API usage only until the cap or expiry is reached.
5. The merchant collects the monthly plan charge through the subscription primitive.

## Run It

No wallet, RPC, private key, or paid service is required for the runnable simulation.

```bash
npm test
npm run demo
```

Expected demo output:

```json
{
  "concept": "Bounded AI-agent API spend for Canadian builders",
  "planChargeUsdc": "49",
  "agentSpendUsdc": "5.58",
  "agentBudgetRemainingUsdc": "9.42",
  "invoiceCount": 3,
  "cyclesPaid": 1
}
```

## Files

- `src/domain.js` contains the deterministic subscription and allowance model.
- `src/demo.js` runs the Maple Meter scenario end to end.
- `src/solana-kit-example.ts` shows how the same flow maps to the official `@solana/subscriptions` instruction builders.
- `docs/architecture.md` explains the flow and includes a sequence diagram.
- `test/domain.test.js` verifies caps, expiry, subscription term snapshots, and invoice math.

## Official Primitive Mapping

The TypeScript integration sketch uses the official program ID:

```text
De1egAFMkMWZSN5rYXRj9CAdheBamobVNubTsi9avR44
```

It maps the demo to these instruction builders from `@solana/subscriptions`:

- `getCreatePlanOverlayInstructionAsync`
- `getSubscribeOverlayInstructionAsync`
- `getCreateFixedDelegationOverlayInstructionAsync`
- `getTransferSubscriptionOverlayInstructionAsync`

The runnable simulation is intentionally dependency-free so reviewers can inspect the business logic quickly. The `solana-kit-example.ts` file is the integration bridge for wiring the same scenario into a wallet/RPC flow.

## Canadian Context

Maple Meter is framed around Canadian builders and a Canada-based API guild:

- Canadian AI startups can buy data/API access in stablecoins.
- A user can delegate a capped research budget to an autonomous agent.
- A merchant can offer predictable subscription tiers without operating a custom recurring-billing smart contract.

## Safety Notes

- The AI agent receives only a capped, expiring allowance.
- Existing subscribers keep snapshotted plan terms.
- Subscription collection and agent usage are separate flows.
- The demo never asks for a private key and never sends a transaction.

## References

- Solana announcement: <https://solana.com/news/subscriptions-and-allowances>
- Official subscriptions repository: <https://github.com/solana-foundation/subscriptions>
- Subscription plan docs: <https://solana.com/docs/payments/subscriptions/subscription-plan>
- Chainstack overview: <https://docs.chainstack.com/docs/solana-subscriptions-and-allowances>
