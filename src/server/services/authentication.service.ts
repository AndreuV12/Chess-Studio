import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";
import { db } from "@/server/db";
import { users, type NewUser, type User } from "@/server/db/schema/user";

export type RegistrationResult =
  | { success: true; user: User }
  | { success: false; reason: "EMAIL_ALREADY_EXISTS" };

const dummyPasswordHash = "$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2uheWG/igi.";

function isUniqueViolation(error: unknown): boolean {
  return typeof error === "object" && error !== null && "code" in error && error.code === "23505";
}

export class AuthenticationService {
  static async authenticate(email: User["email"], password: string): Promise<User | null> {
    const [existingUser] = await db.select().from(users).where(eq(users.email, email)).limit(1);
    const passwordHash = existingUser?.passwordHash ?? dummyPasswordHash;
    const isPasswordValid = await bcrypt.compare(password, passwordHash);

    if (!existingUser || !isPasswordValid) return null;

    return existingUser;
  }

  static async register(data: Pick<NewUser, "name" | "email">, password: string): Promise<RegistrationResult> {
    const [existingUser] = await db.select({ id: users.id }).from(users).where(eq(users.email, data.email)).limit(1);
    if (existingUser) return { success: false, reason: "EMAIL_ALREADY_EXISTS" };

    const passwordHash = await bcrypt.hash(password, 12);

    try {
      const [createdUser] = await db
        .insert(users)
        .values({
          name: data.name,
          email: data.email,
          passwordHash,
        })
        .returning();

      return { success: true, user: createdUser };
    } catch (error) {
      if (isUniqueViolation(error)) return { success: false, reason: "EMAIL_ALREADY_EXISTS" };
      throw error;
    }
  }
}
