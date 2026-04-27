import { APP_CONFIG } from "@/lib/constants";

export async function serverApi<T>(
  path: string,
  init?: RequestInit & { revalidate?: number },
): Promise<T> {
  const response = await fetch(`${APP_CONFIG.apiBaseUrl}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
    next: { revalidate: init?.revalidate ?? 60 },
  });

  if (!response.ok) {
    throw new Error(`API request failed: ${response.status}`);
  }

  return (await response.json()) as T;
}
