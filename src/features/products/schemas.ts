import { z } from "zod";

export const backendProductSchema = z.object({
  id: z.string(),
  name: z.string(),
  price: z.coerce.number(),
  depositPerCan: z.coerce.number().nullish(),
  orderValuePerCan: z.coerce.number().nullish(),
  photoUrl: z.string().url().nullish(),
  photoUrls: z.array(z.string().url()).nullish(),
  stock: z.coerce.number().nullish(),
  category: z.string().nullish(),
  isActive: z.boolean().nullish(),
  createdAt: z.string().nullish(),
  updatedAt: z.string().nullish(),
});

export const backendProductsListSchema = z.array(backendProductSchema);
