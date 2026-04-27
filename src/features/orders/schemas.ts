import { z } from "zod";

export const paymentMethodSchema = z.enum(["COD", "ONLINE"]);
export const orderStatusSchema = z.enum([
  "RECEIVED",
  "CONFIRMED",
  "PACKED",
  "DISPATCHED",
  "DELIVERED",
  "CANCELLED",
]);

export const orderItemInputSchema = z.object({
  productId: z.string(),
  quantity: z.number().int().min(1),
});

export const orderQuoteRequestSchema = z.object({
  addressId: z.string(),
  timeSlot: z.string(),
  paymentMethod: paymentMethodSchema,
  ifCanRefund: z.boolean().optional(),
  returnedCanCount: z.number().int().min(0).optional(),
  items: z.array(orderItemInputSchema).min(1),
});

export const orderQuoteResponseSchema = z.object({
  itemsSubtotal: z.number(),
  quantity: z.number(),
  returnedCanCount: z.number(),
  chargeableCanCount: z.number(),
  depositBase: z.number(),
  depositDiscount: z.number(),
  depositCharge: z.number(),
  totalAmount: z.number(),
  discountPercent: z.number(),
});

export const orderSchema = z
  .object({
    id: z.string(),
    status: orderStatusSchema,
    totalAmount: z.coerce.number().default(0),
    depositBase: z.coerce.number().default(0),
    depositDiscount: z.coerce.number().default(0),
    depositCharge: z.coerce.number().default(0),
    depositRefunded: z.boolean().nullish().default(false),
    items: z
      .array(
        z.object({
          id: z.string().nullish(),
          productId: z.string().nullish(),
          quantity: z.coerce.number().int().min(1).default(1),
          productName: z.string().nullish(),
          imageUrl: z.string().url().nullish(),
          product: z
            .object({
              id: z.string().nullish(),
              name: z.string().nullish(),
              photoUrl: z.string().url().nullish(),
              photoUrls: z.array(z.string().url()).nullish(),
              imageUrl: z.string().url().nullish(),
            })
            .nullish(),
        }),
      )
      .nullish(),
    createdAt: z.string().nullish().default(""),
    updatedAt: z.string().nullish().default(""),
  })
  .passthrough();

export const ordersListSchema = z.array(orderSchema);
