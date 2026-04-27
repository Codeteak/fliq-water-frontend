"use client";

import { useRouter } from "next/navigation";
import { useSyncExternalStore } from "react";
import { getAccessToken, getAuthUser } from "@/lib/auth-token";

const AUTH_EVENT = "wf-auth-change";

function subscribeAuth(callback: () => void): () => void {
  if (typeof window === "undefined") return () => {};
  const handler = () => callback();
  window.addEventListener("storage", handler);
  window.addEventListener(AUTH_EVENT, handler);
  return () => {
    window.removeEventListener("storage", handler);
    window.removeEventListener(AUTH_EVENT, handler);
  };
}

function getAuthSnapshot(): string {
  const token = getAccessToken() ?? "";
  const name = getAuthUser()?.name ?? "";
  return `${token}::${name}`;
}

function getServerAuthSnapshot(): string {
  return "::";
}

export function useAuth() {
  const router = useRouter();
  const snapshot = useSyncExternalStore(subscribeAuth, getAuthSnapshot, getServerAuthSnapshot);
  const [token, userName] = snapshot.split("::");
  const isAuthenticated = Boolean(token);

  const signOut = async () => {
    try {
      const { logout } = await import("@/features/auth/api");
      await logout();
    } catch {
      // Avoid unhandled promise rejections in UI events.
    } finally {
      router.push("/auth/login");
      router.refresh();
    }
  };

  return { isAuthenticated, userName, signOut };
}
