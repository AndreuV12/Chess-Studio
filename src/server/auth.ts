import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { AuthenticationService } from "@/server/services/authentication.service";

export const { handlers, auth, signIn, signOut } = NextAuth({
  trustHost: true,
  pages: {
    signIn: "/login",
  },
  session: {
    strategy: "jwt",
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
        return AuthenticationService.authenticate(credentials);
      },
    }),
  ],
});
