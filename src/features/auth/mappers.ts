import type { AuthSession, RegisterOtpSentResponse } from "@/types/auth";
import { authSessionSchema, otpSentResponseSchema } from "@/features/auth/schemas";

export function toAuthSession(payload: unknown): AuthSession {
  const parsed = authSessionSchema.parse(payload);
  return {
    accessToken: parsed.accessToken,
    refreshToken: parsed.refreshToken,
    expiresIn: parsed.expiresIn,
    user: parsed.user,
  };
}

export function toOtpSentResponse(payload: unknown): RegisterOtpSentResponse {
  const parsed = otpSentResponseSchema.parse(payload);
  return parsed;
}
