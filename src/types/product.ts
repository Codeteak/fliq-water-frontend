export type WaterProductType = "CAN_20L" | "BOTTLE_1L" | "BOTTLE_500ML" | "SUBSCRIPTION";

export interface Product {
  id: string;
  slug: string;
  name: string;
  description: string;
  price: number;
  imageUrl: string;
  type: WaterProductType;
  depositPerCan?: number;
  orderValuePerCan?: number;
  photoUrls?: string[];
  stock?: number;
  category?: string;
  isActive?: boolean;
  volume?: string;
  tags?: string[];
  colors?: string[];
}
