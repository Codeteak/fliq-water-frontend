"use client";

import { API_ENDPOINTS } from "@/lib/constants";
import { api } from "@/lib/api";
import { toOrder, toOrderQuote, toOrders } from "@/features/orders/mappers";
import { orderQuoteRequestSchema } from "@/features/orders/schemas";
import type { Order, OrderQuoteRequest, OrderQuoteResponse } from "@/types/order";

function unwrapList(payload: unknown): unknown {
  if (Array.isArray(payload)) return payload;
  if (payload && typeof payload === "object") {
    const maybe = payload as { items?: unknown; data?: unknown };
    if (Array.isArray(maybe.items)) return maybe.items;
    if (Array.isArray(maybe.data)) return maybe.data;
  }
  return payload;
}

export async function quoteOrder(input: unknown): Promise<OrderQuoteResponse> {
  const payload = orderQuoteRequestSchema.parse(input);
  const response = await api.post(API_ENDPOINTS.orders.quote, payload);
  return toOrderQuote(response.data);
}

export async function createOrder(input: unknown): Promise<Order> {
  const payload = orderQuoteRequestSchema.parse(input);
  const response = await api.post(API_ENDPOINTS.orders.create, payload);
  return toOrder(response.data);
}

export async function listMyOrders(): Promise<Order[]> {
  const response = await api.get(API_ENDPOINTS.orders.listMy);
  return toOrders(unwrapList(response.data));
}

export async function trackOrder(id: string): Promise<Order> {
  const response = await api.get(API_ENDPOINTS.orders.track(id));
  const payload = response.data as Record<string, unknown>;
  if (payload && typeof payload === "object" && "order" in payload) {
    return toOrder((payload as { order: unknown }).order);
  }
  return toOrder(payload);
}

export function buildQuotePayload(params: {
  addressId: string;
  timeSlot: string;
  paymentMethod: OrderQuoteRequest["paymentMethod"];
  ifCanRefund?: boolean;
  returnedCanCount?: number;
  items: Array<{ productId: string; quantity: number }>;
}): OrderQuoteRequest {
  return orderQuoteRequestSchema.parse(params);
}
