import NextAuth, { type Session } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import Credentials from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";
import type { Role } from "@/generated/prisma/enums";
import { prisma } from "./prisma";

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const NEXTAUTH_SECRET = process.env.NEXTAUTH_SECRET;
const NEXTAUTH_URL = process.env.NEXTAUTH_URL;

if (!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET) {
  console.warn(
    "Google OAuth credentials are missing. Set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET in your environment.",
  );
}

if (
  GOOGLE_CLIENT_ID?.includes("google_client_id_placeholder") ||
  GOOGLE_CLIENT_SECRET?.includes("google_client_secret_placeholder")
) {
  console.warn(
    "Google OAuth uses placeholder credentials. Replace GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET with your real Google OAuth client values.",
  );
}

if (!NEXTAUTH_SECRET) {
  console.warn(
    "NextAuth secret is missing. Set NEXTAUTH_SECRET in your environment.",
  );
}

if (!NEXTAUTH_URL) {
  console.warn(
    "NextAuth URL is missing. Set NEXTAUTH_URL in your environment.",
  );
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  trustHost: true,
  adapter: PrismaAdapter(prisma),
  session: { strategy: "jwt" },
  pages: { signIn: "/auth/signin" },
  providers: [
    GoogleProvider({
      clientId: GOOGLE_CLIENT_ID!,
      clientSecret: GOOGLE_CLIENT_SECRET!,
    }),
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        const user = await prisma.user.findUnique({
          where: { email: credentials.email as string },
        });

        if (!user || !user.password || !user.isActive) return null;

        const valid = await bcrypt.compare(
          credentials.password as string,
          user.password,
        );
        if (!valid) return null;

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.image,
          role: user.role,
        };
      },
    }),
  ],
  callbacks: {
    async redirect({ url, baseUrl }) {
      let effectiveBaseUrl = baseUrl;
      const isLocalhost =
        baseUrl.includes("localhost") || baseUrl.includes("127.0.0.1");

      if (isLocalhost) {
        const envUrl =
          process.env.NEXT_PUBLIC_APP_URL ||
          process.env.NEXTAUTH_URL ||
          (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : null);

        if (envUrl && !envUrl.includes("localhost")) {
          effectiveBaseUrl = envUrl.startsWith("http")
            ? envUrl
            : `https://${envUrl}`;
        }
      }

      effectiveBaseUrl = effectiveBaseUrl.replace(/\/+$/, "");

      if (url.startsWith("/")) {
        return `${effectiveBaseUrl}${url}`;
      }
      try {
        if (new URL(url).origin === new URL(effectiveBaseUrl).origin) {
          return url;
        }
      } catch {
        // Ignored invalid URL string
      }
      return effectiveBaseUrl;
    },
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id as string;
        token.role = user.role;
      }
      return token;
    },
    async session({ session, token }) {
      if (token?.id) {
        session.user.id = token.id as string;
        session.user.role = token.role as Role;
      }
      return session;
    },
  },
  events: {
    async signIn({ user, account }) {
      console.info("NextAuth signIn", {
        email: user?.email,
        provider: account?.provider,
      });
    },
  },
  logger: {
    error(error) {
      // Log full error with stack and possible cause for easier debugging
      console.error("NextAuth logger error", error);
      if (error && (error as any).stack) console.error((error as any).stack);
      if (error && (error as any).cause) console.error("cause:", (error as any).cause);
    },
    warn(code) {
      console.warn("NextAuth logger warn", code);
    },
    debug(code) {
      if (process.env.NODE_ENV !== "production") {
        console.debug("NextAuth logger debug", code);
      }
    },
  },
});

export function requireStaff(session: Session | null) {
  if (!session || !["ADMIN", "STAFF"].includes(session.user?.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  return null;
}

export function requireAdmin(session: Session | null) {
  if (!session || session.user?.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  return null;
}
