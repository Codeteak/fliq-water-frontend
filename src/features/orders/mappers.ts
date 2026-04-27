import type { Order, OrderQuoteResponse } from "@/types/order";
import { orderQuoteResponseSchema, ordersListSchema, orderSchema } from "@/features/orders/schemas";

export function toOrderQuote(payload: unknown): OrderQuoteResponse {
  const parsed = orderQuoteResponseSchema.parse(payload);
  return parsed;
}

export function toOrder(payload: unknown): Order {
  const parsed = orderSchema.parse(payload);
  return {
    ...parsed,
    depositRefunded: Boolean(parsed.depositRefunded),
    items:
      parsed.items?.map((item) => ({
        id: item.id ?? undefined,
        productId: item.productId ?? undefined,
        quantity: item.quantity,
        productName: item.productName ?? item.product?.name ?? undefined,
        imageUrl:
          item.imageUrl ??
          item.product?.imageUrl ??
          item.product?.photoUrl ??
          item.product?.photoUrls?.[0] ??
          undefined,
        product: item.product
          ? {
              id: item.product.id ?? undefined,
              name: item.product.name ?? undefined,
              photoUrl: item.product.photoUrl ?? undefined,
              photoUrls: item.product.photoUrls ?? undefined,
              imageUrl: item.product.imageUrl ?? undefined,
            }
          : undefined,
      })) ?? undefined,
    createdAt: parsed.createdAt ?? "",
    updatedAt: parsed.updatedAt ?? "",
  };
}

export function toOrders(payload: unknown): Order[] {
  const parsed = ordersListSchema.parse(payload);
  return parsed.map((item) => toOrder(item));
}
