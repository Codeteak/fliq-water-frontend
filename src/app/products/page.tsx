import { ProductCard } from "@/components/product/product-card";
import { getProducts } from "@/features/products/api";
import Link from "next/link";

interface ProductsPageProps {
  searchParams: Promise<{ category?: string }>;
}

export default async function ProductsPage({ searchParams }: ProductsPageProps) {
  const { category } = await searchParams;
  const products = await getProducts();
  const categories = Array.from(new Set(products.map((item) => item.category).filter(Boolean)));
  const filteredProducts = category
    ? products.filter((product) => (product.category ?? "").toLowerCase() === category.toLowerCase())
    : products;

  return (
    <div className="mx-auto w-full max-w-screen-2xl px-3 py-5 sm:px-4 sm:py-6">
      <h1 className="mb-3 text-xl font-semibold sm:mb-4 sm:text-2xl">Products</h1>
      <div className="mb-4 flex gap-2 overflow-x-auto pb-1 sm:mb-5 sm:flex-wrap sm:overflow-visible">
        <Link
          href="/products"
          className={`shrink-0 rounded-full border px-3 py-1 text-xs sm:text-sm ${!category ? "bg-black text-white" : ""}`}
        >
          All
        </Link>
        {categories.map((item) => (
          <Link
            key={item}
            href={`/products?category=${encodeURIComponent(item ?? "")}`}
            className={`shrink-0 rounded-full border px-3 py-1 text-xs sm:text-sm ${category === item ? "bg-black text-white" : ""}`}
          >
            {item}
          </Link>
        ))}
      </div>
      {filteredProducts.length === 0 ? (
        <div className="rounded-md border border-dashed p-10 text-center text-muted-foreground">
          No products found for this category.
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-2 sm:gap-3 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
          {filteredProducts.map((product, index) => (
            <ProductCard key={product.id} product={product} priorityImage={index === 0} />
          ))}
        </div>
      )}
    </div>
  );
}
