import { env } from "@/lib/env";

export const APP_CONFIG = {
  appName: "WaterFlow",
  frontendUrl: env.NEXT_PUBLIC_APP_URL,
  apiBaseUrl: env.NEXT_PUBLIC_API_URL,
} as const;

export const API_ENDPOINTS = {
  auth: {
    register: "/api/auth/register",
    sendLoginOtp: "/api/auth/send-login-otp",
    login: "/api/auth/login",
    refresh: "/api/auth/refresh",
    logout: "/api/auth/logout",
  },
  products: {
    list: "/api/products",
    detail: (id: string) => `/api/products/${id}`,
  },
  addresses: {
    list: "/api/addresses",
    add: "/api/addresses",
    update: (id: string) => `/api/addresses/${id}`,
    remove: (id: string) => `/api/addresses/${id}`,
  },
  deposits: {
    publicConfig: "/api/deposits/public-config",
    walletMe: "/api/deposits/wallet/me",
    topUp: "/api/deposits/wallet/me/top-up",
  },
  orders: {
    quote: "/api/orders/quote",
    create: "/api/orders",
    listMy: "/api/orders/my",
    track: (id: string) => `/api/orders/${id}/track`,
  },
} as const;
