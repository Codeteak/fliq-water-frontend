import type { DepositPublicConfig, WalletBalance } from "@/types/deposit";
import { depositPublicConfigSchema, walletBalanceSchema } from "@/features/deposits/schemas";

export function toDepositPublicConfig(payload: unknown): DepositPublicConfig {
  const parsed = depositPublicConfigSchema.parse(payload);
  return parsed;
}

export function toWalletBalance(payload: unknown): WalletBalance {
  const parsed = walletBalanceSchema.parse(payload);
  return parsed;
}
