import { z } from "zod";

export const depositPromoTierSchema = z.object({
  minQty: z.coerce.number(),
  discountPercent: z.coerce.number(),
});

export const depositPublicConfigSchema = z.object({
  perCanAmount: z.coerce.number(),
  promoActive: z.boolean(),
  promoStartsAt: z.string().nullable(),
  promoEndsAt: z.string().nullable(),
  tiers: z.array(depositPromoTierSchema),
});

export const walletBalanceSchema = z.object({
  balance: z.coerce.number(),
});

export const topUpRequestSchema = z.object({
  amount: z.number().positive(),
  note: z.string().optional(),
});
