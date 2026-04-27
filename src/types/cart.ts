import type { Product } from "@/types/product";
import type { PaymentMethod } from "@/types/order";

export interface CartItem {
  product: Product;
  quantity: number;
  deliveryDate: string;
  timeSlot?: string;
}

export interface CheckoutMeta {
  addressId?: string;
  paymentMethod: PaymentMethod;
  returnedCanCount: number;
  /** Set when the user finishes the return-cans modal/sheet; reset when can line qty changes. */
  returnedCansPromptAcknowledged?: boolean;
}
