export interface DepositPromoTier {
  minQty: number;
  discountPercent: number;
}

export interface DepositPublicConfig {
  perCanAmount: number;
  promoActive: boolean;
  promoStartsAt: string | null;
  promoEndsAt: string | null;
  tiers: DepositPromoTier[];
}

export interface WalletBalance {
  balance: number;
}
