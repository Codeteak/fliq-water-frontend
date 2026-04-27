"use client";

import type React from "react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useCartStore } from "@/store/cart.store";
import type { Product as StoreProduct } from "@/types/product";
import { ProductCard } from "@/components/product/product-card";

interface Product {
  id: string;
  slug: string;
  name: string;
  price: number;
  depositPerCan?: number;
  orderValuePerCan?: number;
  category?: string;
  stock?: number | string;
  photoUrls?: string[];
  imageUrl: string;
  tds?: string;
  ph?: string;
  source?: string;
  composition?: string;
  packaging?: string;
  deliveryInfo?: string;
}

export function ProductDetailClient({
  product,
  images,
  relatedProducts,
}: {
  product: Product;
  images: string[];
  relatedProducts: StoreProduct[];
}) {
  const [activeImg, setActiveImg] = useState(0);
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);
  const [wished, setWished] = useState(false);
  const addItem = useCartStore((state) => state.addItem);

  const depositPerCan = product.depositPerCan ?? 0;
  const orderValuePerCan = product.orderValuePerCan ?? product.price;
  const activeImage = images[activeImg] ?? product.imageUrl ?? images[0];

  const storeProduct = useMemo(
    () =>
      ({
        ...product,
        imageUrl: product.imageUrl || images[0] || "",
      }) as StoreProduct,
    [images, product],
  );

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const raw = window.localStorage.getItem("wf-wishlist-product-ids");
      const ids = raw ? (JSON.parse(raw) as string[]) : [];
      setWished(ids.includes(product.id));
    } catch {
      setWished(false);
    }
  }, [product.id]);

  const handleAddToCart = () => {
    addItem({
      product: storeProduct,
      quantity: qty,
      deliveryDate: new Date().toISOString(),
    });
    setAdded(true);
    window.setTimeout(() => setAdded(false), 1500);
  };

  const toggleWishlist = () => {
    if (typeof window === "undefined") return;
    try {
      const raw = window.localStorage.getItem("wf-wishlist-product-ids");
      const ids = raw ? (JSON.parse(raw) as string[]) : [];
      const next = wished
        ? ids.filter((id) => id !== product.id)
        : Array.from(new Set([...ids, product.id]));
      window.localStorage.setItem("wf-wishlist-product-ids", JSON.stringify(next));
      setWished(!wished);
    } catch {
      setWished((prev) => !prev);
    }
  };

  return (
    <div className="min-h-screen bg-white font-sans dark:bg-[#171715]">
      <div className="mx-auto max-w-[1100px] px-6 py-8 pb-20">
        <nav className="mb-10 flex items-center gap-1.5 text-[11px] tracking-widest text-[#888780] uppercase">
          <Link href="/" className="text-[#5f5e5a] transition-colors hover:text-[#1a1a18] dark:hover:text-[#f0ede8]">
            Home
          </Link>
          <span className="opacity-40">›</span>
          <Link href="/products" className="text-[#5f5e5a] transition-colors hover:text-[#1a1a18] dark:hover:text-[#f0ede8]">
            {product.category ?? "Water"}
          </Link>
          <span className="opacity-40">›</span>
          <span className="text-[#1a1a18] dark:text-[#f0ede8]">{product.name}</span>
        </nav>

        <div className="grid grid-cols-1 items-start gap-12 lg:grid-cols-2 lg:gap-16">
          <div className="flex flex-col gap-3">
            <div className="relative aspect-[4/3] overflow-hidden rounded-2xl border border-black/10 bg-[#f4f3f0] dark:border-white/10 dark:bg-[#242422]">
              <Image
                src={activeImage}
                alt={`${product.name} — view ${activeImg + 1}`}
                fill
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-cover"
                priority
              />
              <div className="absolute top-3.5 left-3.5 rounded-md bg-white/90 px-2.5 py-1 text-[11px] font-medium tracking-wider text-[#3B6D11] uppercase dark:bg-black/60 dark:text-[#97c459]">
                {product.stock ? `Stock: ${product.stock}` : "In stock"}
              </div>
            </div>

            {images.length > 1 && (
              <div className="grid grid-cols-3 gap-2.5">
                {images.map((src, i) => (
                  <button
                    key={`${src}-${i}`}
                    onClick={() => setActiveImg(i)}
                    className={[
                      "relative aspect-square overflow-hidden rounded-[10px] border bg-[#f4f3f0] transition-all dark:bg-[#242422]",
                      i === activeImg
                        ? "border-[1.5px] border-[#1a1a18] dark:border-[#f0ede8]"
                        : "border-black/10 hover:border-black/25 dark:border-white/10 dark:hover:border-white/25",
                    ].join(" ")}
                  >
                    <Image src={src} alt={`${product.name} ${i + 1}`} fill sizes="120px" className="object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="pt-1">
            <span className="mb-4 inline-block rounded-full border border-black/20 px-3 py-1 text-[11px] tracking-[0.1em] text-[#888780] uppercase dark:border-white/20">
              {product.category ?? "Water"} · Premium
            </span>

            <h1
              className="mb-2 text-[2.5rem] leading-[1.1] tracking-[-0.02em] text-[#1a1a18] dark:text-[#f0ede8]"
            >
              {product.name}
            </h1>

            <p className="mb-6 text-[13px] tracking-[0.04em] text-[#888780]">
              {product.tds && `TDS ${product.tds}`}
              {product.ph && ` · pH ${product.ph}`}
              {!product.tds && "Fast doorstep delivery with slot booking and recurring plans"}
            </p>

            <div className="mb-6 flex items-center gap-2">
              <div className="flex gap-0.5">
                {[1, 2, 3, 4].map((s) => (
                  <StarIcon key={s} filled />
                ))}
                <StarIcon filled={false} />
              </div>
              <span className="text-[12px] text-[#888780]">4.0 · 218 reviews</span>
            </div>

            <div className="mb-5 grid grid-cols-2 gap-4 border-t border-b border-black/10 py-5 dark:border-white/10">
              <PriceItem label="Price" value={`₹${product.price}`} unit="per can" />
              <PriceItem label="Deposit" value={`₹${depositPerCan}`} unit="refundable" />
              <PriceItem label="Order value" value={`₹${orderValuePerCan}`} unit="first order" />
              <PriceItem label="Repeat order" value={`₹${product.price}`} unit="deposit waived" />
            </div>

            <div className="mb-5 flex items-center gap-2 text-[13px] text-[#5f5e5a] dark:text-[#b4b2a9]">
              <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-[#63c94a]" />
              Available · Ships within 4 hours
            </div>

            <div className="mb-5">
              <p className="mb-2.5 text-[11px] tracking-[0.08em] text-[#888780] uppercase">Quantity</p>
              <div className="flex w-fit items-center overflow-hidden rounded-lg border border-black/20 dark:border-white/20">
                <button
                  onClick={() => setQty((q) => Math.max(1, q - 1))}
                  className="flex h-10 w-10 items-center justify-center bg-white text-lg text-[#1a1a18] transition-colors hover:bg-[#f4f3f0] dark:bg-[#1c1c1a] dark:text-[#f0ede8] dark:hover:bg-[#242422]"
                >
                  −
                </button>
                <span className="w-12 border-r border-l border-black/10 text-center text-[15px] leading-10 font-medium text-[#1a1a18] dark:border-white/10 dark:text-[#f0ede8]">
                  {qty}
                </span>
                <button
                  onClick={() => setQty((q) => q + 1)}
                  className="flex h-10 w-10 items-center justify-center bg-white text-lg text-[#1a1a18] transition-colors hover:bg-[#f4f3f0] dark:bg-[#1c1c1a] dark:text-[#f0ede8] dark:hover:bg-[#242422]"
                >
                  +
                </button>
              </div>
            </div>

            <div className="mb-5 flex gap-2.5">
              <button
                onClick={handleAddToCart}
                className="flex-1 rounded-[10px] bg-[#1a1a18] py-3.5 text-[14px] font-medium tracking-[0.02em] text-white transition-opacity hover:opacity-85 dark:bg-[#f0ede8] dark:text-[#1a1a18]"
              >
                {added ? "Added to cart" : "Add to cart"}
              </button>
              <button
                onClick={toggleWishlist}
                aria-label={wished ? "Remove from wishlist" : "Add to wishlist"}
                className="rounded-[10px] border border-black/20 px-4 py-3.5 transition-colors hover:bg-[#f4f3f0] dark:border-white/20 dark:hover:bg-[#242422]"
              >
                <HeartIcon filled={wished} />
              </button>
            </div>

            <div className="flex gap-4 border-t border-black/10 pt-4 dark:border-white/10">
              <Perk icon={<CheckIcon />} title="Slot booking" sub="Choose your delivery window" />
              <Perk icon={<ClockIcon />} title="4-hour dispatch" sub="Fast doorstep delivery" />
              <Perk icon={<LockIcon />} title="Deposit refund" sub="Full return on empties" />
            </div>
          </div>
        </div>

        {relatedProducts.length > 0 && (
          <section className="mt-14 border-t border-black/10 pt-10 dark:border-white/10">
            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-2xl font-semibold tracking-tight text-[#1a1a18] dark:text-[#f0ede8]">
                Related products
              </h2>
              <Link href="/products" className="text-sm text-[#5f5e5a] underline underline-offset-4 dark:text-[#b4b2a9]">
                View all
              </Link>
            </div>
            <div className="grid grid-cols-2 gap-2 sm:gap-3 lg:grid-cols-3 xl:grid-cols-4">
              {relatedProducts.map((item, index) => (
                <ProductCard key={item.id} product={item} priorityImage={index === 0} />
              ))}
            </div>
          </section>
        )}

        <div className="mt-16 grid grid-cols-2 gap-8 border-t border-black/10 pt-10 dark:border-white/10 lg:grid-cols-4">
          <DetailCol
            head="Source"
            body={
              product.source ??
              "Sourced from monitored natural spring aquifers at 1,800 m elevation, cold-filtered without heat treatment."
            }
          />
          <DetailCol
            head="Composition"
            body={
              product.composition ??
              `TDS ${product.tds ?? "48"} ppm · pH ${product.ph ?? "7.4"} · Calcium 12 mg/L · Magnesium 4 mg/L · Fluoride <0.1 mg/L`
            }
          />
          <DetailCol
            head="Packaging"
            body={
              product.packaging ??
              "Food-grade polycarbonate can, BPA-compliant. Returned, sanitised, and reused — circular economy."
            }
          />
          <DetailCol
            head="Delivery"
            body={
              product.deliveryInfo ??
              "Book a morning (7–11 AM) or evening (5–8 PM) slot. Recurring plans auto-schedule weekly or bi-weekly."
            }
          />
        </div>
      </div>
    </div>
  );
}

function PriceItem({ label, value, unit }: { label: string; value: string; unit: string }) {
  return (
    <div>
      <p className="mb-1 text-[11px] tracking-[0.08em] text-[#888780] uppercase">{label}</p>
      <p
        className="text-[1.75rem] leading-none tracking-[-0.02em] text-[#1a1a18] dark:text-[#f0ede8]"
      >
        {value}
      </p>
      <p className="mt-0.5 text-[12px] text-[#888780]">{unit}</p>
    </div>
  );
}

function Perk({ icon, title, sub }: { icon: React.ReactNode; title: string; sub: string }) {
  return (
    <div className="flex flex-1 items-start gap-2">
      <div className="mt-0.5 shrink-0 text-[#1a1a18] dark:text-[#f0ede8]">{icon}</div>
      <div>
        <p className="text-[12px] font-medium text-[#1a1a18] dark:text-[#f0ede8]">{title}</p>
        <p className="text-[11px] leading-relaxed text-[#888780]">{sub}</p>
      </div>
    </div>
  );
}

function DetailCol({ head, body }: { head: string; body: string }) {
  return (
    <div>
      <p className="mb-3 text-[11px] tracking-[0.1em] text-[#888780] uppercase">{head}</p>
      <p className="text-[13px] leading-relaxed text-[#5f5e5a] dark:text-[#b4b2a9]">{body}</p>
    </div>
  );
}

function StarIcon({ filled }: { filled: boolean }) {
  return (
    <svg
      width="12"
      height="12"
      viewBox="0 0 12 12"
      fill={filled ? "#e49b2a" : "none"}
      stroke={filled ? "none" : "#ccc"}
      strokeWidth="1"
    >
      <polygon points="6,1 7.5,4.5 11,5 8.5,7.5 9.2,11 6,9.2 2.8,11 3.5,7.5 1,5 4.5,4.5" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <path d="M2 8L6 12L14 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function ClockIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <circle cx="8" cy="8" r="5.5" stroke="currentColor" strokeWidth="1.2" />
      <path d="M8 5V8L10 10" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
    </svg>
  );
}

function LockIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <rect x="2" y="6" width="12" height="8" rx="1.5" stroke="currentColor" strokeWidth="1.2" />
      <path d="M5 6V4C5 2.9 6.3 2 8 2C9.7 2 11 2.9 11 4V6" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
    </svg>
  );
}

function HeartIcon({ filled = false }: { filled?: boolean }) {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill={filled ? "currentColor" : "none"}>
      <path d="M8 14C8 14 2 10 2 6C2 4 4 2 6 2C7 2 8 3 8 3C8 3 9 2 10 2C12 2 14 4 14 6C14 10 8 14 8 14Z" stroke="currentColor" strokeWidth="1.2" />
    </svg>
  );
}
