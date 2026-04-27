"use client";

import { API_ENDPOINTS } from "@/lib/constants";
import { api } from "@/lib/api";
import { toAddress, toAddresses } from "@/features/addresses/mappers";
import { createAddressSchema, updateAddressSchema } from "@/features/addresses/schemas";
import type { Address } from "@/types/address";

function unwrapList(payload: unknown): unknown {
  if (Array.isArray(payload)) return payload;
  if (payload && typeof payload === "object") {
    const maybe = payload as { items?: unknown; data?: unknown };
    if (Array.isArray(maybe.items)) return maybe.items;
    if (Array.isArray(maybe.data)) return maybe.data;
  }
  return payload;
}

export async function listAddresses(): Promise<Address[]> {
  const response = await api.get(API_ENDPOINTS.addresses.list);
  return toAddresses(unwrapList(response.data));
}

export async function addAddress(input: unknown): Promise<Address> {
  const payload = createAddressSchema.parse(input);
  const response = await api.post(API_ENDPOINTS.addresses.add, payload);
  return toAddress(response.data);
}

export async function updateAddress(id: string, input: unknown): Promise<Address> {
  const payload = updateAddressSchema.parse(input);
  const response = await api.patch(API_ENDPOINTS.addresses.update(id), payload);
  return toAddress(response.data);
}

export async function deleteAddress(id: string): Promise<void> {
  await api.delete(API_ENDPOINTS.addresses.remove(id));
}
