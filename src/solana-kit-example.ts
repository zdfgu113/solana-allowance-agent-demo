import { address, type TransactionSigner } from '@solana/kit';
import {
  getCreateFixedDelegationOverlayInstructionAsync,
  getCreatePlanOverlayInstructionAsync,
  getSubscribeOverlayInstructionAsync,
  getTransferSubscriptionOverlayInstructionAsync,
} from '@solana/subscriptions';

const SUBSCRIPTIONS_PROGRAM = address('De1egAFMkMWZSN5rYXRj9CAdheBamobVNubTsi9avR44');
const MAINNET_USDC = address('EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v');
const TOKEN_PROGRAM = address('TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA');
const DEMO_TREASURY = address('11111111111111111111111111111111');
const DEMO_BILLING_WORKER = address('TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA');

export async function buildMerchantPlanInstruction(owner: TransactionSigner) {
  return getCreatePlanOverlayInstructionAsync({
    owner,
    programAddress: SUBSCRIPTIONS_PROGRAM,
    mint: MAINNET_USDC,
    tokenProgram: TOKEN_PROGRAM,
    planId: 20260609n,
    amount: 49_000_000n,
    periodHours: 24n * 30n,
    endTs: 0n,
    metadataUri: 'https://example.com/maple-api-pro-plan.json',
    destinations: [DEMO_TREASURY],
    pullers: [DEMO_BILLING_WORKER],
  });
}

export async function buildSubscriberPlanInstruction({
  subscriber,
  merchant,
  expectedCreatedAt,
  expectedAuthorityInitId,
}: {
  expectedAuthorityInitId: bigint;
  expectedCreatedAt: bigint;
  merchant: string;
  subscriber: TransactionSigner;
}) {
  return getSubscribeOverlayInstructionAsync({
    subscriber,
    merchant: address(merchant),
    programAddress: SUBSCRIPTIONS_PROGRAM,
    tokenMint: MAINNET_USDC,
    planId: 20260609n,
    expectedAmount: 49_000_000n,
    expectedPeriodHours: 24n * 30n,
    expectedCreatedAt,
    expectedSubscriptionAuthorityInitId: expectedAuthorityInitId,
  });
}

export async function buildAgentAllowanceInstruction({
  subscriber,
  agentDelegate,
  expiryTs,
}: {
  agentDelegate: string;
  expiryTs: bigint;
  subscriber: TransactionSigner;
}) {
  return getCreateFixedDelegationOverlayInstructionAsync({
    delegator: subscriber,
    delegatee: address(agentDelegate),
    programAddress: SUBSCRIPTIONS_PROGRAM,
    tokenMint: MAINNET_USDC,
    tokenProgram: TOKEN_PROGRAM,
    nonce: 1n,
    amount: 15_000_000n,
    expiryTs,
  });
}

export async function buildMonthlyCollectionInstruction({
  merchant,
  planPda,
  subscriptionPda,
  subscriberAta,
  receiverAta,
}: {
  merchant: TransactionSigner;
  planPda: string;
  receiverAta: string;
  subscriberAta: string;
  subscriptionPda: string;
}) {
  return getTransferSubscriptionOverlayInstructionAsync({
    delegatee: merchant,
    amount: 49_000_000n,
    planPda: address(planPda),
    programAddress: SUBSCRIPTIONS_PROGRAM,
    receiverAta: address(receiverAta),
    subscriptionPda: address(subscriptionPda),
    subscriberAta: address(subscriberAta),
    tokenMint: MAINNET_USDC,
    tokenProgram: TOKEN_PROGRAM,
  });
}
