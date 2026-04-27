import type { Product } from "@/types/product";

/** First usable image URL from `imageUrl` or `photoUrls`. */
export function getProductImageSrc(product: Product): string | null {
  const raw = [product.imageUrl, ...(product.photoUrls ?? [])];
  const first = raw.find((v) => typeof v === "string" && v.trim().length > 0);
  return first ?? null;
}
