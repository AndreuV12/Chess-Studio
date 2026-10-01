import { z } from "zod";

export const emailSchema = z.email().max(255);
export const loginPasswordSchema = z.string().min(1).max(72);
export const newPasswordSchema = z.string().min(8).max(72);

export const loginRequestSchema = z
  .object({
    email: emailSchema,
    password: loginPasswordSchema,
  })
  .strict();

export const loginResponseSchema = z.object({
  authenticated: z.literal(true),
});

export const sessionUserIdSchema = z.coerce.number().int().positive();

export const callbackUrlSchema = z
  .string()
  .refine((callbackUrl) => callbackUrl.startsWith("/") && !callbackUrl.startsWith("//"))
  .catch("/");

export type LoginRequest = z.infer<typeof loginRequestSchema>;
export type LoginResponse = z.infer<typeof loginResponseSchema>;
