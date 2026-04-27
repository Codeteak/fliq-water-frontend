"use client";

const ACCESS_KEY = "access_token";
const REFRESH_KEY = "refresh_token";
const USER_KEY = "auth_user";
const ACCESS_COOKIE = "wf_access_token";
const AUTH_EVENT = "wf-auth-change";

function notifyAuthChange() {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new Event(AUTH_EVENT));
}

function setCookie(name: string, value: string, maxAgeSeconds: number) {
  document.cookie = `${name}=${encodeURIComponent(value)}; path=/; max-age=${maxAgeSeconds}; samesite=lax`;
}

function clearCookie(name: string) {
  document.cookie = `${name}=; path=/; max-age=0; samesite=lax`;
}

export function getAccessToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(ACCESS_KEY);
}

export function getRefreshToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(REFRESH_KEY);
}

export function setTokens(accessToken: string, refreshToken: string, expiresIn: number) {
  if (typeof window === "undefined") return;
  localStorage.setItem(ACCESS_KEY, accessToken);
  localStorage.setItem(REFRESH_KEY, refreshToken);
  setCookie(ACCESS_COOKIE, accessToken, Math.max(expiresIn, 60));
  notifyAuthChange();
}

export function setAuthUser(user: { id: string; name: string; phone: string }) {
  if (typeof window === "undefined") return;
  localStorage.setItem(USER_KEY, JSON.stringify(user));
  notifyAuthChange();
}

export function getAuthUser(): { id: string; name: string; phone: string } | null {
  if (typeof window === "undefined") return null;
  const value = localStorage.getItem(USER_KEY);
  if (!value) return null;
  try {
    const parsed = JSON.parse(value) as { id: string; name: string; phone: string };
    if (!parsed?.id || !parsed?.name) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function clearTokens() {
  if (typeof window === "undefined") return;
  localStorage.removeItem(ACCESS_KEY);
  localStorage.removeItem(REFRESH_KEY);
  localStorage.removeItem(USER_KEY);
  clearCookie(ACCESS_COOKIE);
  notifyAuthChange();
}
