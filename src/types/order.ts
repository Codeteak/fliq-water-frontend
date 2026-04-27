export type PaymentMethod = "COD" | "ONLINE";

export type OrderStatus =
  | "RECEIVED"
  | "CONFIRMED"
  | "PACKED"
  | "DISPATCHED"
  | "DELIVERED"
  | "CANCELLED";

export interface OrderItemInput {
  productId: string;
  quantity: number;
}

export interface OrderItemProductSnapshot {
  id?: string;
  name?: string;
  photoUrl?: string;
  photoUrls?: string[];
  imageUrl?: string;
}

export interface OrderItem {
  id?: string;
  productId?: string;
  quantity: number;
  productName?: string;
  imageUrl?: string;
  product?: OrderItemProductSnapshot;
}

export interface OrderQuoteRequest {
  addressId: string;
  timeSlot: string;
  paymentMethod: PaymentMethod;
  ifCanRefund?: boolean;
  returnedCanCount?: number;
  items: OrderItemInput[];
}

export interface OrderQuoteResponse {
  itemsSubtotal: number;
  quantity: number;
  returnedCanCount: number;
  chargeableCanCount: number;
  depositBase: number;
  depositDiscount: number;
  depositCharge: number;
  totalAmount: number;
  discountPercent: number;
}

export interface Order {
  id: string;
  status: OrderStatus;
  totalAmount: number;
  depositBase: number;
  depositDiscount: number;
  depositCharge: number;
  depositRefunded: boolean;
  items?: OrderItem[];
  createdAt: string;
  updatedAt: string;
}
