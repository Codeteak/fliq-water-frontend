import { ProductCard } from "@/components/product/product-card";
import { HomeHero } from "@/components/home/home-hero";
import { getProducts } from "@/features/products/api";

export const dynamic = "force-dynamic";

export default async function Home() {
  const products = await getProducts().catch((error) => {
    console.error("[home-page] Failed to load products", error);
    return [];
  });
  const featuredProducts = products.slice(0, 8);
  const popularProducts = products.slice(8, 16);
  const latestProducts = products.slice(16, 24);
  const hasAnyProducts = products.length > 0;

  return (
    <>
      <HomeHero />
      <div className="mx-auto w-full max-w-screen-2xl px-3 py-8 sm:px-4 sm:py-10 md:py-12">
        {!hasAnyProducts ? (
          <p className="rounded-md border border-dashed p-8 text-sm text-muted-foreground">
            Products are unavailable right now. Please check again.
          </p>
        ) : (
          <section className="space-y-10 sm:space-y-12">
            {[
              {
                title: "Featured products",
                description: "Handpicked essentials for your everyday hydration needs.",
                items: featuredProducts,
              },
              {
                title: "Popular products",
                description: "Most loved choices from customers across your area.",
                items: popularProducts.length > 0 ? popularProducts : featuredProducts,
              },
              {
                title: "Latest products",
                description: "Fresh arrivals and newly stocked water products.",
                items: latestProducts.length > 0 ? latestProducts : featuredProducts,
              },
            ].map((group) => (
              <div key={group.title} className="space-y-5 sm:space-y-6">
                <div className="space-y-2 sm:space-y-3">
                  <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">{group.title}</h2>
                  <p className="max-w-2xl text-sm text-slate-600 sm:text-base">{group.description}</p>
                </div>
                <div className="flex snap-x snap-mandatory gap-3 overflow-x-auto pt-1 pb-2 scrollbar-hide sm:gap-4 sm:pt-2">
                  {group.items.map((product, index) => (
                    <div
                      key={`${group.title}-${product.id}`}
                      className="w-[165px] shrink-0 snap-start sm:w-[210px] md:w-[220px]"
                    >
                      <ProductCard product={product} priorityImage={index === 0} />
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </section>
        )}
      </div>
    </>
  );
}
