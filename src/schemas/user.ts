import { z } from "zod";

// E.164 India mobile (§9.1).
export const phoneSchema = z
  .string()
  .regex(/^\+91[6-9]\d{9}$/, "Mobile number doesn't look right");

export const OtpRequestInput = z.object({
  phone: phoneSchema,
});
export type OtpRequestInput = z.infer<typeof OtpRequestInput>;

export const OtpLoginInput = z.object({
  phone: phoneSchema,
  otp: z.string().regex(/^\d{6}$/, "Enter the 6-digit code"),
});
export type OtpLoginInput = z.infer<typeof OtpLoginInput>;

export const PasswordLoginInput = z.object({
  email: z.string().email("Enter a valid email"),
  password: z.string().min(1, "Enter your password"),
});
export type PasswordLoginInput = z.infer<typeof PasswordLoginInput>;

// Login accepts either flow (§8.3).
export const LoginInput = z.union([OtpLoginInput, PasswordLoginInput]);
export type LoginInput = z.infer<typeof LoginInput>;

export const RoleSwitchInput = z.object({
  persona: z.enum(["citizen", "officer", "admin"]),
});
export type RoleSwitchInput = z.infer<typeof RoleSwitchInput>;

// Profile settings (§6.2.8).
export const UpdateSettingsInput = z.object({
  language: z.enum(["en", "hi"]).optional(),
  aiAssistLevel: z.enum(["full", "reduced", "off"]).optional(),
  showOnLeaderboard: z.boolean().optional(),
});
export type UpdateSettingsInput = z.infer<typeof UpdateSettingsInput>;
