"use client";

import Link from "next/link";
import { ShoppingCart } from "lucide-react";
import { useCartStore } from "@/store/cart.store";

export function FabCartButton() {
  const cartCount = useCartStore((state) => state.items.length);

  if (cartCount === 0) return null;

  return (
    <Link
      href="/cart"
      className="fixed bottom-5 right-4 z-40 flex h-14 min-w-14 items-center justify-center rounded-full bg-sky-600 px-4 text-white shadow-lg shadow-sky-500/30 md:hidden"
      aria-label="Open cart"
    >
      <ShoppingCart className="h-5 w-5" />
      <span className="ml-2 text-sm font-semibold">{cartCount}</span>
    </Link>
  );
}
