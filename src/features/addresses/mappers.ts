import type { Address } from "@/types/address";
import { addressSchema, addressesListSchema } from "@/features/addresses/schemas";

export function toAddress(payload: unknown): Address {
  const parsed = addressSchema.parse(payload);
  return {
    id: parsed.id,
    label: parsed.label ?? undefined,
    line1: parsed.line1,
    line2: parsed.line2 ?? undefined,
    landmark: parsed.landmark ?? undefined,
    city: parsed.city,
    state: parsed.state,
    pincode: parsed.pincode,
    phone: parsed.phone ?? undefined,
    isDefault: parsed.isDefault ?? undefined,
    createdAt: parsed.createdAt ?? undefined,
    updatedAt: parsed.updatedAt ?? undefined,
  };
}

export function toAddresses(payload: unknown): Address[] {
  const parsed = addressesListSchema.parse(payload);
  return parsed.map((item) => toAddress(item));
}
