import { backendProductSchema, backendProductsListSchema } from "@/features/products/schemas";
import type { Product, WaterProductType } from "@/types/product";

function toProductType(category?: string): WaterProductType {
  if (!category) return "CAN_20L";
  const normalized = category.toUpperCase();
  if (normalized.includes("500")) return "BOTTLE_500ML";
  if (normalized.includes("1L")) return "BOTTLE_1L";
  if (normalized.includes("SUB")) return "SUBSCRIPTION";
  return "CAN_20L";
}

function slugify(name: string): string {
  return name.trim().toLowerCase().replace(/\s+/g, "-");
}

export function toProduct(payload: unknown): Product {
  const parsed = backendProductSchema.parse(payload);
  const imageUrl = parsed.photoUrl ?? parsed.photoUrls?.[0] ?? "";
  const category = parsed.category ?? undefined;

  return {
    id: parsed.id,
    slug: slugify(parsed.name),
    name: parsed.name,
    description: `${parsed.name} available for fast water delivery.`,
    price: parsed.price,
    imageUrl,
    type: toProductType(category),
    depositPerCan: parsed.depositPerCan ?? undefined,
    orderValuePerCan: parsed.orderValuePerCan ?? undefined,
    photoUrls: parsed.photoUrls ?? undefined,
    stock: parsed.stock ?? undefined,
    category,
    isActive: parsed.isActive ?? undefined,
  };
}

export function toProducts(payload: unknown): Product[] {
  const parsed = backendProductsListSchema.parse(payload);
  return parsed.map((item) => toProduct(item));
}
