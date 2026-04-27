"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

const checkoutSchema = z.object({
  addressId: z.string().min(1),
  slot: z.string().min(1),
});

export async function createCheckoutAction(input: unknown) {
  const payload = checkoutSchema.parse(input);
  revalidatePath("/orders");
  return { ok: true, payload };
}
