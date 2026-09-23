import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";
import { db } from "@/server/db";
import { users } from "@/server/db/schema/user";

export const { auth, signIn, signOut } = NextAuth({
  providers: [
    Credentials({
      credentials: {
        email: {},
        password: {},
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }
        const email = String(credentials.email);
        const password = String(credentials.password);

        const [user] = await db.select().from(users).where(eq(users.email, email)).limit(1);

        if (!user) return null;

        const validPassword = await bcrypt.compare(password, user.passwordHash);

        if (!validPassword) return null;

        return {
          id: String(user.id),
          email: user.email,
          name: user.name,
        };
      },
    }),
  ],
});
