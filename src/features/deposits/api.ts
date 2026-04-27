"use client";

import { API_ENDPOINTS } from "@/lib/constants";
import { api } from "@/lib/api";
import { toDepositPublicConfig, toWalletBalance } from "@/features/deposits/mappers";
import { topUpRequestSchema } from "@/features/deposits/schemas";
import type { DepositPublicConfig, WalletBalance } from "@/types/deposit";

export async function getDepositPublicConfig(): Promise<DepositPublicConfig> {
  const response = await api.get(API_ENDPOINTS.deposits.publicConfig);
  return toDepositPublicConfig(response.data);
}

export async function getWalletBalance(): Promise<WalletBalance> {
  const response = await api.get(API_ENDPOINTS.deposits.walletMe);
  return toWalletBalance(response.data);
}

export async function topUpWallet(input: unknown): Promise<WalletBalance> {
  const payload = topUpRequestSchema.parse(input);
  const response = await api.post(API_ENDPOINTS.deposits.topUp, payload);
  return toWalletBalance(response.data);
}
