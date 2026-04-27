import { z } from "zod";

export const addressSchema = z.object({
  id: z.string(),
  label: z.string().nullish(),
  line1: z.string(),
  line2: z.string().nullish(),
  landmark: z.string().nullish(),
  city: z.string(),
  state: z.string(),
  pincode: z.coerce.string().regex(/^[1-9][0-9]{5}$/),
  phone: z.string().nullish(),
  isDefault: z.boolean().nullish(),
  createdAt: z.string().nullish(),
  updatedAt: z.string().nullish(),
});

export const addressesListSchema = z.array(addressSchema);

export const createAddressSchema = addressSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const updateAddressSchema = createAddressSchema.partial();
