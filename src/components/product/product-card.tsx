"use client";

import { useCartStore } from "@/store/cart.store";
import type { Product } from "@/types/product";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, ShoppingBasket } from "lucide-react";

interface ProductCardProps {
  product: Product;
  priorityImage?: boolean;
}

export function ProductCard({ product, priorityImage = false }: ProductCardProps) {
  const addItem = useCartStore((state) => state.addItem);
  const [added, setAdded] = useState(false);
  const [wished, setWished] = useState(false);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [showImageControls, setShowImageControls] = useState(false);
  const touchStartXRef = useRef<number | null>(null);
  const controlsHideTimerRef = useRef<number | null>(null);
  const fallbackImage = "https://images.unsplash.com/photo-1548839140-29a749e1cf4d?w=800&q=80";
  const images = useMemo(() => {
    const rawImages = [product.imageUrl, ...(product.photoUrls ?? [])];
    const cleaned = rawImages.filter(
      (value): value is string => typeof value === "string" && value.trim().length > 0,
    );
    return cleaned.length > 0 ? Array.from(new Set(cleaned)) : [fallbackImage];
  }, [product.imageUrl, product.photoUrls]);

  useEffect(() => {
    if (images.length <= 1) return;
    const timer = window.setInterval(() => {
      setActiveImageIndex((previous) => (previous + 1) % images.length);
    }, 3000);
    return () => window.clearInterval(timer);
  }, [images]);

  const currentImage = images[activeImageIndex] ?? fallbackImage;

  const handleAdd = () => {
    addItem({ product, quantity: 1, deliveryDate: new Date().toISOString() });
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  const goNext = () => setActiveImageIndex((prev) => (prev + 1) % images.length);
  const goPrev = () => setActiveImageIndex((prev) => (prev - 1 + images.length) % images.length);
  const hasMultipleImages = images.length > 1;

  const showControlsTemporarily = () => {
    if (!hasMultipleImages) return;
    setShowImageControls(true);
    if (controlsHideTimerRef.current !== null) {
      window.clearTimeout(controlsHideTimerRef.current);
    }
    controlsHideTimerRef.current = window.setTimeout(() => {
      setShowImageControls(false);
    }, 1400);
  };

  useEffect(() => {
    return () => {
      if (controlsHideTimerRef.current !== null) {
        window.clearTimeout(controlsHideTimerRef.current);
      }
    };
  }, []);

  return (
    <div className="group flex h-full w-full flex-col overflow-hidden rounded-2xl border border-sky-100/70 bg-white shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md">

      {/* Image area */}
      <div
        className="relative aspect-[4/3] overflow-hidden bg-sky-50/70"
        onMouseEnter={() => hasMultipleImages && setShowImageControls(true)}
        onMouseLeave={() => setShowImageControls(false)}
        onWheel={showControlsTemporarily}
        onTouchStart={(event) => {
          touchStartXRef.current = event.touches[0]?.clientX ?? null;
          showControlsTemporarily();
        }}
        onTouchMove={showControlsTemporarily}
        onTouchEnd={(event) => {
          const touchStartX = touchStartXRef.current;
          const touchEndX = event.changedTouches[0]?.clientX;
          if (touchStartX == null || touchEndX == null) return;
          const deltaX = touchEndX - touchStartX;
          if (Math.abs(deltaX) > 36) {
            if (deltaX < 0) goNext();
            if (deltaX > 0) goPrev();
          }
          touchStartXRef.current = null;
          showControlsTemporarily();
        }}
      >
        <Link href={`/product/${product.slug}`} className="absolute inset-0 block" aria-label={`View ${product.name}`}>
          <Image
            src={currentImage}
            alt={product.name}
            fill
            priority={priorityImage}
            loading={priorityImage ? "eager" : "lazy"}
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 50vw, 25vw"
            className="object-cover transition-transform duration-400 group-hover:scale-105"
          />
        </Link>

        {/* Wishlist button */}
        <button
          onClick={() => setWished(!wished)}
          className="absolute right-1.5 top-1.5 flex h-7 w-7 sm:h-9 sm:w-9 items-center justify-center rounded-full bg-white/95 shadow-sm transition-transform hover:scale-105"
        >
          <svg
            width="12"
            height="12"
            viewBox="0 0 24 24"
            fill={wished ? "#ff4d6d" : "none"}
            stroke={wished ? "#ff4d6d" : "#aaa"}
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="sm:w-[14px] sm:h-[14px]"
          >
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
          </svg>
        </button>

        {hasMultipleImages && (
          <>
            <button
              type="button"
              onClick={goPrev}
              className={`absolute left-2 top-1/2 z-10 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full border border-white/80 bg-white/95 text-slate-700 shadow-sm transition-all duration-200 sm:h-9 sm:w-9 ${
                showImageControls ? "opacity-100" : "pointer-events-none opacity-0"
              }`}
              aria-label="Previous image"
            >
              <ChevronLeft className="h-4 w-4 sm:h-5 sm:w-5" />
            </button>
            <button
              type="button"
              onClick={goNext}
              className={`absolute right-2 top-1/2 z-10 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full border border-white/80 bg-white/95 text-slate-700 shadow-sm transition-all duration-200 sm:h-9 sm:w-9 ${
                showImageControls ? "opacity-100" : "pointer-events-none opacity-0"
              }`}
              aria-label="Next image"
            >
              <ChevronRight className="h-4 w-4 sm:h-5 sm:w-5" />
            </button>
            <div className="absolute bottom-1.5 left-1/2 flex -translate-x-1/2 gap-1">
              {images.map((_, index) => (
                <button
                  key={index}
                  type="button"
                  aria-label={`Go to image ${index + 1}`}
                  onClick={() => setActiveImageIndex(index)}
                  className={`h-1 w-1 sm:h-1.5 sm:w-1.5 rounded-full ${
                    index === activeImageIndex ? "bg-white" : "bg-white/60"
                  }`}
                />
              ))}
            </div>
          </>
        )}
      </div>

      {/* Body */}
      <div className="flex flex-1 flex-col p-2 sm:p-4">
        <Link href={`/product/${product.slug}`} className="truncate text-sm font-semibold leading-5 text-slate-900 hover:underline sm:text-base sm:leading-6">
          {product.name}
        </Link>

        {/* Hide description on mobile to save space */}
        <p className="mt-1 hidden line-clamp-2 text-xs leading-relaxed text-slate-500 sm:mt-2 sm:block">
          {product.description}
        </p>

        <p className="mt-1 text-[10px] text-slate-600 sm:mt-2 sm:text-xs">
          Deposit: Rs. {product.depositPerCan ?? 0}
        </p>
        <p className="text-[10px] text-slate-700 sm:text-xs">
          Rs. {product.orderValuePerCan ?? product.price}/can
        </p>

        {/* Price + CTA */}
        <div className="mt-auto flex items-center justify-between gap-2 pt-2 sm:pt-3">
          <div className="rounded-full bg-sky-600 px-3 py-1.5 text-sm font-bold leading-none text-white sm:px-4 sm:text-base">
            Rs. {product.price}
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2">
            <Link
              href={`/product/${product.slug}`}
              className="hidden sm:block text-xs text-slate-700 underline"
            >
              View
            </Link>
            <button
              onClick={handleAdd}
              aria-label={added ? "Added to cart" : "Add to cart"}
              className={`inline-flex h-9 w-9 items-center justify-center rounded-full p-0 transition-all duration-150 active:scale-95 ${
                added ? "text-slate-900" : "text-emerald-600 hover:text-emerald-700"
              }`}
            >
              <ShoppingBasket className="h-5 w-5 sm:h-6 sm:w-6" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}