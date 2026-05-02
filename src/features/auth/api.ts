"use client";

import { API_ENDPOINTS } from "@/lib/constants";
import { api } from "@/lib/api";
import { clearTokens, getRefreshToken, setAuthUser, setTokens } from "@/lib/auth-token";
import { useCartStore } from "@/store/cart.store";
import { toAuthSession, toOtpSentResponse } from "@/features/auth/mappers";
import {
  loginWithOtpSchema,
  loginWithPasswordSchema,
  logoutRequestSchema,
  refreshRequestSchema,
  registerStepOneSchema,
  registerStepTwoSchema,
  sendLoginOtpSchema,
} from "@/features/auth/schemas";

export async function registerStepOne(input: unknown) {
  const payload = registerStepOneSchema.parse(input);
  const response = await api.post(API_ENDPOINTS.auth.register, payload);
  return toOtpSentResponse(response.data);
}

export async function registerStepTwo(input: unknown) {
  const payload = registerStepTwoSchema.parse(input);
  const response = await api.post(API_ENDPOINTS.auth.register, payload);
  const session = toAuthSession(response.data);
  setTokens(session.accessToken, session.refreshToken, session.expiresIn);
  setAuthUser(session.user);
  return session;
}

export async function loginWithPassword(input: unknown) {
  const payload = loginWithPasswordSchema.parse(input);
  const response = await api.post(API_ENDPOINTS.auth.login, payload);
  const session = toAuthSession(response.data);
  setTokens(session.accessToken, session.refreshToken, session.expiresIn);
  setAuthUser(session.user);
  return session;
}

/** Step 1 of OTP login: POST /api/auth/send-login-otp with { phone } → SMS */
export async function sendLoginOtp(input: unknown) {
  const payload = sendLoginOtpSchema.parse(input);
  const response = await api.post(API_ENDPOINTS.auth.sendLoginOtp, payload);
  try {
    return toOtpSentResponse(response.data);
  } catch {
    return { sent: true, message: "OTP sent to your phone." };
  }
}

/** Step 2 of OTP login: POST /api/auth/login with { phone, otp } */
export async function loginWithOtp(input: unknown) {
  const payload = loginWithOtpSchema.parse(input);
  const response = await api.post(API_ENDPOINTS.auth.login, payload);
  const session = toAuthSession(response.data);
  setTokens(session.accessToken, session.refreshToken, session.expiresIn);
  setAuthUser(session.user);
  return session;
}

export async function refreshTokens() {
  const refreshToken = getRefreshToken();
  const payload = refreshRequestSchema.parse({ refreshToken });
  const response = await api.post(API_ENDPOINTS.auth.refresh, payload);
  const session = toAuthSession(response.data);
  setTokens(session.accessToken, session.refreshToken, session.expiresIn);
  setAuthUser(session.user);
  return session;
}

export async function logout() {
  const clearSessionData = () => {
    clearTokens();
    useCartStore.getState().clearCart();
  };

  const refreshToken = getRefreshToken();
  if (!refreshToken) {
    clearSessionData();
    return { success: true };
  }

  const payload = logoutRequestSchema.parse({ refreshToken });
  try {
    await api.post(API_ENDPOINTS.auth.logout, payload);
  } catch {
    // If network/server logout fails, still clear local session
    // so user can sign out without crashing UI.
  } finally {
    clearSessionData();
  }
  return { success: true };
}
