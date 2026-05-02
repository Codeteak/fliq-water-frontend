"use client";

import { Search, ShoppingCart } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { useEffect, useLayoutEffect, useMemo, useState } from "react";
import { useCartStore } from "@/store/cart.store";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { MobileNav } from "@/components/common/mobile-nav";
import { cn } from "@/lib/utils";
import { API_ENDPOINTS, APP_CONFIG } from "@/lib/constants";
import { toProducts } from "@/features/products/mappers";
import { getProductImageSrc } from "@/lib/product-image";
import type { Product } from "@/types/product";

const HEADER_PRODUCTS_CACHE_KEY = "wf-header-products-cache-v1";

export function AppHeader() {
  const cartCount = useCartStore((state) => state.items.length);
  const { isAuthenticated, userName, signOut } = useAuth();
  const [scrolled, setScrolled] = useState(false);
  const [heroVideoPlaying, setHeroVideoPlaying] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [products, setProducts] = useState<Product[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [productsLoaded, setProductsLoaded] = useState(false);

  useLayoutEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 0);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (!searchOpen || productsLoaded) return;
    let alive = true;

    const fetchProducts = async () => {
      setLoadingProducts(true);
      try {
        const cached = typeof window !== "undefined" ? window.localStorage.getItem(HEADER_PRODUCTS_CACHE_KEY) : null;
        if (cached) {
          try {
            const parsed = JSON.parse(cached) as Product[];
            if (alive && Array.isArray(parsed) && parsed.length > 0) {
              setProducts(parsed);
              setProductsLoaded(true);
              setLoadingProducts(false);
            }
          } catch {
            // ignore malformed cache
          }
        }

        const response = await fetch(`${APP_CONFIG.apiBaseUrl}${API_ENDPOINTS.products.list}`, {
          cache: "no-store",
        });
        if (!response.ok) return;
        const payload = (await response.json()) as unknown;
        if (!alive) return;
        const list = Array.isArray(payload)
          ? payload
          : (payload as { data?: unknown; items?: unknown }).data ??
            (payload as { data?: unknown; items?: unknown }).items ??
            [];
        const normalized = toProducts(list);
        setProducts(normalized);
        if (typeof window !== "undefined") {
          window.localStorage.setItem(HEADER_PRODUCTS_CACHE_KEY, JSON.stringify(normalized));
        }
        setProductsLoaded(true);
      } finally {
        if (alive) setLoadingProducts(false);
      }
    };

    void fetchProducts();
    return () => {
      alive = false;
    };
  }, [productsLoaded, searchOpen]);

  const filteredProducts = useMemo(() => {
    const keyword = searchQuery.trim().toLowerCase();
    if (!keyword) return [];
    return products
      .filter((product) => {
        const hay = `${product.name} ${product.description} ${product.category ?? ""}`.toLowerCase();
        return hay.includes(keyword);
      })
      .slice(0, 12);
  }, [products, searchQuery]);

  const isVideoHeader = heroVideoPlaying && !scrolled;

  useLayoutEffect(() => {
    const onHeroVideoState = (event: Event) => {
      const customEvent = event as CustomEvent<boolean>;
      setHeroVideoPlaying(Boolean(customEvent.detail));
    };
    window.addEventListener("hero-video-state", onHeroVideoState as EventListener);
    return () => window.removeEventListener("hero-video-state", onHeroVideoState as EventListener);
  }, []);

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-30 transition-[border-color,background-color,backdrop-filter] duration-200",
        isVideoHeader ? "bg-transparent backdrop-blur-none md:text-white" : "bg-background/95 backdrop-blur",
        isVideoHeader && "md:[&_a]:text-white md:[&_button]:text-white md:[&_svg]:text-white md:[&_.text-muted-foreground]:text-white/85",
        scrolled && "border-b border-border"
      )}
    >
      <div className="mx-auto flex h-16 w-full max-w-screen-2xl items-center justify-between px-3 sm:px-4">
        <MobileNav
          isAuthenticated={isAuthenticated}
          signOut={signOut}
          user={isAuthenticated ? { name: userName || "Customer" } : undefined}
        />

        <Link
          href="/"
          className="absolute left-1/2 flex -translate-x-1/2 items-center gap-1.5 font-semibold md:static md:translate-x-0"
        >
          <Image
            src="/without-bg-logo.png"
            alt="Fliq Water"
            width={104}
            height={28}
            className="object-contain"
            style={{ width: "auto", height: "28px" }}
            priority
          />
        </Link>

        <div className="flex items-center gap-1 md:hidden">
          <Button
            variant="ghost"
            size="icon"
            className="h-11 w-11"
            aria-label="Search products"
            onClick={() => setSearchOpen((v) => !v)}
          >
              <Search className="h-5 w-5" />
          </Button>
          <Link href="/cart" aria-label="Open cart" className="relative">
            <Button
              variant="outline"
              size="icon"
              className={cn("h-11 w-11", isVideoHeader && "md:border-transparent md:bg-white/90 md:text-black")}
            >
              <ShoppingCart className={cn("h-5 w-5", isVideoHeader && "md:text-black")} />
            </Button>
            {cartCount > 0 ? (
              <span className="absolute -right-0.5 -top-0.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-sky-600 px-1 text-[10px] font-semibold text-white">
                {cartCount}
              </span>
            ) : null}
          </Link>
        </div>

        <nav className="hidden items-center gap-2 md:flex">
          <Link href="/products">
            <Button variant="ghost">Products</Button>
          </Link>
          <Link href="/orders">
            <Button variant="ghost">Orders</Button>
          </Link>
          <Link href="/account">
            <Button variant="ghost">Account</Button>
          </Link>
          <div className="relative hidden lg:block">
            <Search className="text-muted-foreground pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
            <input
              value={searchQuery}
              onFocus={() => setSearchOpen(true)}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search products"
              className="h-10 w-56 rounded-full border bg-background/85 pr-3 pl-9 text-sm outline-none transition focus:w-64 focus:ring-2 focus:ring-sky-500/30"
            />
          </div>
          <Button variant="ghost" size="icon" className="h-11 w-11 lg:hidden" onClick={() => setSearchOpen((v) => !v)}>
            <Search className="h-5 w-5" />
          </Button>
          <Link href="/cart" aria-label="Open cart" className="relative">
            <Button variant="outline" size="icon" className="h-11 w-11">
              <ShoppingCart className="h-5 w-5" />
            </Button>
            {cartCount > 0 ? (
              <span className="absolute -right-0.5 -top-0.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-sky-600 px-1 text-[10px] font-semibold text-white">
                {cartCount}
              </span>
            ) : null}
          </Link>
          {isAuthenticated ? (
            <>
              <span className="text-sm text-muted-foreground">Hi, {userName || "Customer"}</span>
              <Button variant="ghost" onClick={signOut}>
                Logout
              </Button>
            </>
          ) : (
            <>
              <Link href="/auth/login">
                <Button variant="ghost">Login</Button>
              </Link>
            </>
          )}
        </nav>
      </div>

      {searchOpen && (
        <div className="border-border/70 bg-background/95 border-t backdrop-blur">
          <div className="mx-auto w-full max-w-screen-2xl px-3 py-2 sm:px-4">
            <div className="relative lg:hidden">
              <Search className="text-muted-foreground pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
              <input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search products"
                className="h-10 w-full rounded-full border bg-background/85 pr-3 pl-9 text-sm outline-none ring-sky-500/30 focus:ring-2"
              />
            </div>

            {searchQuery.trim().length > 0 ? (
              <div className="scrollbar-hide mt-2 flex gap-2 overflow-x-auto pb-1">
                {loadingProducts ? (
                  <p className="text-muted-foreground py-2 text-sm">Searching products...</p>
                ) : filteredProducts.length === 0 ? (
                  <p className="text-muted-foreground py-2 text-sm">No products found for "{searchQuery}"</p>
                ) : (
                  filteredProducts.map((product) => {
                    const imageSrc = getProductImageSrc(product);
                    return (
                      <Link
                        key={product.id}
                        href={`/product/${product.slug}`}
                        className="group bg-card hover:bg-muted/40 min-w-[165px] overflow-hidden rounded-2xl border shadow-sm transition sm:min-w-[180px]"
                        onClick={() => {
                          setSearchOpen(false);
                          setSearchQuery("");
                        }}
                      >
                        <div className="bg-muted relative aspect-[4/3] w-full overflow-hidden">
                          {imageSrc ? (
                            <Image
                              src={imageSrc}
                              alt={product.name}
                              fill
                              className="object-cover transition-transform duration-200 group-hover:scale-105"
                              sizes="180px"
                            />
                          ) : null}
                        </div>
                        <div className="space-y-1 p-2">
                          <p className="truncate text-xs font-semibold sm:text-sm">{product.name}</p>
                          <div className="flex items-center justify-between">
                            <p className="rounded-full bg-sky-600 px-2 py-1 text-[10px] font-bold text-white sm:text-xs">
                              Rs. {product.price}
                            </p>
                            <span className="text-muted-foreground text-[10px] sm:text-xs">View</span>
                          </div>
                        </div>
                      </Link>
                    );
                  })
                )}
              </div>
            ) : null}
          </div>
        </div>
      )}
    </header>
  );
}
