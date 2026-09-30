import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";
import { db } from "@/server/db";
import { users } from "@/server/db/schema/user";
import { AuthValidationService } from "./authValidation.service";

export type AuthenticatedUser = {
  id: string;
  name: string | null;
  email: string;
};

export type RegistrationResult =
  | { success: true; user: AuthenticatedUser }
  | { success: false; reason: "INVALID_DATA" | "EMAIL_ALREADY_EXISTS" };

const dummyPasswordHash = "$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2uheWG/igi.";

function isUniqueViolation(error: unknown): boolean {
  return typeof error === "object" && error !== null && "code" in error && error.code === "23505";
}

export class AuthenticationService {
  static async authenticate(credentials: unknown): Promise<AuthenticatedUser | null> {
    const validatedCredentials = AuthValidationService.validateCredentials(credentials);
    if (!validatedCredentials) return null;

    const [existingUser] = await db.select().from(users).where(eq(users.email, validatedCredentials.email)).limit(1);
    const passwordHash = existingUser?.passwordHash ?? dummyPasswordHash;
    const isPasswordValid = await bcrypt.compare(validatedCredentials.password, passwordHash);

    if (!existingUser || !isPasswordValid) return null;

    return {
      id: String(existingUser.id),
      name: existingUser.name,
      email: existingUser.email,
    };
  }

  static async register(data: unknown): Promise<RegistrationResult> {
    const validatedData = AuthValidationService.validateRegistration(data);
    if (!validatedData) return { success: false, reason: "INVALID_DATA" };

    const [existingUser] = await db.select({ id: users.id }).from(users).where(eq(users.email, validatedData.email)).limit(1);
    if (existingUser) return { success: false, reason: "EMAIL_ALREADY_EXISTS" };

    const passwordHash = await bcrypt.hash(validatedData.password, 12);

    try {
      const [createdUser] = await db
        .insert(users)
        .values({
          name: validatedData.name,
          email: validatedData.email,
          passwordHash,
        })
        .returning({
          id: users.id,
          name: users.name,
          email: users.email,
        });

      return {
        success: true,
        user: {
          id: String(createdUser.id),
          name: createdUser.name,
          email: createdUser.email,
        },
      };
    } catch (error) {
      if (isUniqueViolation(error)) return { success: false, reason: "EMAIL_ALREADY_EXISTS" };
      throw error;
    }
  }
}
