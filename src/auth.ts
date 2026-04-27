import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { z } from "zod";

const credentialsSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

export const { handlers, signIn, signOut, auth } = NextAuth({
  session: { strategy: "jwt" },
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(rawCredentials) {
        const parsed = credentialsSchema.safeParse(rawCredentials);
        if (!parsed.success) return null;

        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/login`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(parsed.data),
        });

        if (!response.ok) return null;
        const user = (await response.json()) as {
          id: string;
          email: string;
          name?: string;
          accessToken?: string;
        };

        return {
          id: user.id,
          email: user.email,
          name: user.name ?? user.email,
          ...(user.accessToken ? { accessToken: user.accessToken } : {}),
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user && "accessToken" in user && typeof user.accessToken === "string") {
        token.accessToken = user.accessToken;
      }
      return token;
    },
    async session({ session, token }) {
      if (typeof token.sub === "string") {
        session.user.id = token.sub;
      }
      if (typeof token.accessToken === "string") {
        session.accessToken = token.accessToken;
      }
      return session;
    },
  },
});
