"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

const addToCartSchema = z.object({
  productId: z.string().min(1),
  quantity: z.number().int().min(1).max(20),
  deliveryDateISO: z.string().datetime(),
});

export async function addToCartAction(input: unknown) {
  const payload = addToCartSchema.parse(input);
  revalidatePath("/cart");
  return { ok: true, payload };
}
