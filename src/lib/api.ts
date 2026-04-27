"use client";

import axios, { AxiosError, type InternalAxiosRequestConfig } from "axios";
import { API_ENDPOINTS, APP_CONFIG } from "@/lib/constants";
import { clearTokens, getAccessToken, getRefreshToken, setTokens } from "@/lib/auth-token";
import { normalizeError } from "@/lib/error";
import { useUIStore } from "@/store/ui.store";

export const api = axios.create({
  baseURL: APP_CONFIG.apiBaseUrl,
  withCredentials: true,
  timeout: 15000,
  headers: { "Content-Type": "application/json" },
});

const bareApi = axios.create({
  baseURL: APP_CONFIG.apiBaseUrl,
  withCredentials: true,
  timeout: 15000,
  headers: { "Content-Type": "application/json" },
});

let refreshPromise: Promise<string | null> | null = null;

async function refreshAccessToken(): Promise<string | null> {
  if (refreshPromise) return refreshPromise;
  refreshPromise = (async () => {
    const refreshToken = getRefreshToken();
    if (!refreshToken) return null;

    const response = await bareApi.post(API_ENDPOINTS.auth.refresh, { refreshToken });
    const data = response.data as { accessToken: string; refreshToken: string; expiresIn: number };
    setTokens(data.accessToken, data.refreshToken, data.expiresIn);
    return data.accessToken;
  })();

  try {
    return await refreshPromise;
  } catch {
    clearTokens();
    return null;
  } finally {
    refreshPromise = null;
  }
}

api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  useUIStore.getState().setLoading(true);
  const token = getAccessToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => {
    useUIStore.getState().setLoading(false);
    return response;
  },
  async (error: unknown) => {
    useUIStore.getState().setLoading(false);
    const axiosError = error as AxiosError;
    const originalRequest = axiosError.config as (InternalAxiosRequestConfig & { _retry?: boolean }) | undefined;

    if (axiosError.response?.status === 401 && originalRequest && !originalRequest._retry) {
      originalRequest._retry = true;
      const newAccessToken = await refreshAccessToken();
      if (newAccessToken) {
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        return api(originalRequest);
      }
    }

    const parsed = normalizeError(error, "Unexpected API error");
    if (parsed.statusCode && parsed.statusCode >= 500) {
      useUIStore.getState().setToast({
        type: "error",
        message: "Server error. Please try again.",
      });
    }
    return Promise.reject(new Error(parsed.message));
  },
);
