import { z } from "zod";

export const phoneSchema = z.string().regex(/^[0-9]{10}$/, "Phone must be 10 digits");
export const otpSchema = z.string().regex(/^[0-9]{6}$/, "OTP must be 6 digits");

export const registerStepOneSchema = z.object({
  phone: phoneSchema,
  name: z.string().min(1).optional(),
  password: z.string().min(6).optional(),
});

export const registerStepTwoSchema = registerStepOneSchema.extend({
  otp: otpSchema,
});

export const loginWithPasswordSchema = z.object({
  phone: phoneSchema,
  password: z.string().min(6),
});

export const loginWithOtpSchema = z.object({
  phone: phoneSchema,
  otp: otpSchema,
});

export const authUserSchema = z.object({
  id: z.string(),
  phone: phoneSchema,
  name: z.string(),
  role: z.literal("customer"),
});

export const authSessionSchema = z.object({
  accessToken: z.string(),
  refreshToken: z.string(),
  expiresIn: z.number(),
  user: authUserSchema,
});

export const otpSentResponseSchema = z.object({
  sent: z.boolean(),
  message: z.string(),
});

export const refreshRequestSchema = z.object({
  refreshToken: z.string(),
});

export const logoutRequestSchema = z.object({
  refreshToken: z.string(),
});
