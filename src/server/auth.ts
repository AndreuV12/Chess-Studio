import NextAuth, { CredentialsSignin } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { loginRequestSchema } from "@/app/api/auth/schemas";
import { AuthenticationService } from "@/server/services/authentication.service";

export const { handlers, auth, signIn, signOut } = NextAuth({
  trustHost: true,
  pages: {
    signIn: "/login",
  },
  session: {
    strategy: "jwt",
  },
  logger: {
    error(error) {
      if (error instanceof CredentialsSignin) return;
      console.error("[Auth]", error);
    },
  },
  callbacks: {
    session({ session, token }) {
      if (session.user && token.sub) {
        session.user.id = token.sub;
      }

      return session;
    },
  },
  providers: [
    Credentials({
      credentials: {
        email: {},
        password: {},
      },
      async authorize(credentials) {
        const result = loginRequestSchema.safeParse({
          email: credentials?.email,
          password: credentials?.password,
        });
        if (!result.success) return null;

        const user = await AuthenticationService.authenticate(result.data.email, result.data.password);
        if (!user) return null;

        return {
          id: String(user.id),
          name: user.name,
          email: user.email,
        };
      },
    }),
  ],
});
