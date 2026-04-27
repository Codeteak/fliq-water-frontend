import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getProductBySlug, getProducts } from "@/features/products/api";
import { ProductDetailClient } from "./product-detail-client";

// ─── Types ────────────────────────────────────────────────────────────────────

interface ProductDetailPageProps {
  params: Promise<{ slug: string }>;
}

// ─── Metadata ─────────────────────────────────────────────────────────────────

export async function generateMetadata({
  params,
}: ProductDetailPageProps): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  const title = product?.name ?? slug.replace(/-/g, " ");
  return {
    title,
    description: product
      ? `${product.name} — Rs.${product.price} per can, deposit Rs.${product.depositPerCan ?? 0}`
      : `Details for ${title}`,
  };
}

// ─── Server shell ──────────────────────────────────────────────────────────────

export default async function ProductDetailPage({
  params,
}: ProductDetailPageProps) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) return notFound();
  const allProducts = await getProducts().catch(() => []);

  const images = product.photoUrls?.length
    ? product.photoUrls
    : [product.imageUrl];

  const relatedProducts = allProducts
    .filter((p) => p.id !== product.id)
    .sort((a, b) => {
      const aSame = a.category === product.category ? 1 : 0;
      const bSame = b.category === product.category ? 1 : 0;
      return bSame - aSame;
    })
    .slice(0, 8);

  return (
    <ProductDetailClient
      product={product}
      images={images}
      relatedProducts={relatedProducts}
    />
  );
}