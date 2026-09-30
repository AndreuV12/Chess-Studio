import { z } from "zod";
import { emailSchema, newPasswordSchema } from "@/app/api/auth/schemas";

export const registerRequestSchema = z
  .object({
    name: z.string().trim().min(2).max(255),
    email: emailSchema,
    password: newPasswordSchema,
    passwordConfirmation: newPasswordSchema,
  })
  .strict()
  .refine(({ password, passwordConfirmation }) => password === passwordConfirmation, {
    message: "Passwords do not match",
    path: ["passwordConfirmation"],
  });

export const registeredUserSchema = z.object({
  id: z.number().int().positive(),
  name: z.string().nullable(),
  email: emailSchema,
});

export const registerResponseSchema = z.object({
  user: registeredUserSchema,
});

export type RegisterRequest = z.infer<typeof registerRequestSchema>;
export type RegisterResponse = z.infer<typeof registerResponseSchema>;
