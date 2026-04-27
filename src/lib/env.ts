function getApiUrlEnvValue(fallback: string): string {
  const value = process.env.NEXT_PUBLIC_API_URL;
  if (!value || value.trim().length === 0) {
    if (typeof window !== "undefined") {
      console.warn(`Missing NEXT_PUBLIC_API_URL, falling back to ${fallback}`);
    }
    return fallback;
  }
  return value;
}

function normalizeApiBaseUrl(url: string): string {
  const trimmed = url.trim().replace(/\/+$/, "");
  return trimmed.endsWith("/api") ? trimmed.slice(0, -4) : trimmed;
}

export const env = {
  NEXT_PUBLIC_API_URL: normalizeApiBaseUrl(
    getApiUrlEnvValue("https://fliq-water-backend.neerbottle.workers.dev/api"),
  ),
  NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3002",
  AUTH_URL: process.env.AUTH_URL ?? "http://localhost:3002",
};
