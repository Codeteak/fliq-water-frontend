import { API_ENDPOINTS, APP_CONFIG } from "@/lib/constants";
import { toProduct, toProducts } from "@/features/products/mappers";
import type { Product } from "@/types/product";

function unwrapCollection(payload: unknown): unknown {
  if (Array.isArray(payload)) return payload;
  if (payload && typeof payload === "object") {
    const maybe = payload as { data?: unknown; items?: unknown };
    if (Array.isArray(maybe.data)) return maybe.data;
    if (Array.isArray(maybe.items)) return maybe.items;
  }
  return payload;
}

async function fetchJsonWithRetry(
  url: string,
  init: RequestInit,
  retries = 2,
): Promise<unknown> {
  let lastError: unknown;
  for (let attempt = 0; attempt <= retries; attempt += 1) {
    try {
      const response = await fetch(url, init);
      if (!response.ok) {
        const contentType = response.headers.get("content-type") ?? "unknown";
        const bodySnippet = (await response.text()).slice(0, 220);
        throw new Error(
          `Request failed (${response.status}) content-type=${contentType} body="${bodySnippet}"`,
        );
      }
      return (await response.json()) as unknown;
    } catch (error) {
      lastError = error;
      console.error(
        `[products-api] Attempt ${attempt + 1}/${retries + 1} failed for ${url}`,
        error,
      );
      if (attempt < retries) {
        await new Promise((resolve) => setTimeout(resolve, 250 * (attempt + 1)));
      }
    }
  }
  throw lastError ?? new Error("Request failed");
}

export async function getProducts(): Promise<Product[]> {
  const payload = await fetchJsonWithRetry(
    `${APP_CONFIG.apiBaseUrl}${API_ENDPOINTS.products.list}`,
    { cache: "no-store" },
  );
  return toProducts(unwrapCollection(payload));
}

export async function getProductById(id: string): Promise<Product> {
  const payload = await fetchJsonWithRetry(
    `${APP_CONFIG.apiBaseUrl}${API_ENDPOINTS.products.detail(id)}`,
    { cache: "no-store" },
  );
  return toProduct(payload);
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  const products = await getProducts();
  return products.find((product) => product.slug === slug) ?? null;
}
