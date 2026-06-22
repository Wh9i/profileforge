import { z } from "zod";

export const registerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(50),
  email: z.string().email("Invalid email address"),
  username: z
    .string()
    .min(3, "Username must be at least 3 characters")
    .max(30)
    .regex(/^[a-zA-Z0-9_-]+$/, "Only letters, numbers, underscores and hyphens"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Must contain an uppercase letter")
    .regex(/[0-9]/, "Must contain a number"),
});

export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

export const forgotPasswordSchema = z.object({
  email: z.string().email("Invalid email address"),
});

export const resetPasswordSchema = z.object({
  token: z.string(),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Must contain an uppercase letter")
    .regex(/[0-9]/, "Must contain a number"),
});

export const profileUpdateSchema = z.object({
  displayName: z.string().max(50).optional(),
  bio: z.string().max(500).optional(),
  accentColor: z.string().optional(),
  secondaryColor: z.string().optional(),
  textColor: z.string().optional(),
  fontFamily: z.string().optional(),
  backgroundType: z.enum(["SOLID", "GRADIENT", "IMAGE", "VIDEO", "GIF", "PARTICLES"]).optional(),
  effectType: z.enum(["NONE", "GLASS", "NEON", "GLOW", "RAIN", "SNOW", "STARS", "MATRIX"]).optional(),
  mouseEffect: z.enum(["NONE", "TRAIL", "SPARKLE", "RIPPLE", "MAGNETIC"]).optional(),
  glassOpacity: z.number().min(0).max(1).optional(),
  neonIntensity: z.number().min(0).max(1).optional(),
  animationSpeed: z.number().min(0.1).max(3).optional(),
  showVisitorCount: z.boolean().optional(),
  showFollowers: z.boolean().optional(),
  showLikes: z.boolean().optional(),
  musicAutoplay: z.boolean().optional(),
  musicLoop: z.boolean().optional(),
  musicVolume: z.number().min(0).max(1).optional(),
  avatarUrl: z.string().url().optional().nullable(),
  bannerUrl: z.string().url().optional().nullable(),
  backgroundUrl: z.string().url().optional().nullable(),
  backgroundVideo: z.string().url().optional().nullable(),
});

export const socialLinkSchema = z.object({
  platform: z.string().min(1),
  url: z.string().url("Invalid URL"),
  label: z.string().max(50).optional(),
  icon: z.string().optional(),
  order: z.number().int().optional(),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
export type ProfileUpdateInput = z.infer<typeof profileUpdateSchema>;
export type SocialLinkInput = z.infer<typeof socialLinkSchema>;
