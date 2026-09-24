import NextAuth, { type Session } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import Credentials from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";
import type { Role } from "@/generated/prisma/enums";
import { prisma } from "./prisma";
import { getAppBaseUrl } from "./url";

const resolvedBaseUrl = getAppBaseUrl();

if (!process.env.NEXTAUTH_URL || (process.env.NEXTAUTH_URL.includes("localhost") && !resolvedBaseUrl.includes("localhost"))) {
  process.env.NEXTAUTH_URL = resolvedBaseUrl;
}
if (!process.env.AUTH_URL || (process.env.AUTH_URL.includes("localhost") && !resolvedBaseUrl.includes("localhost"))) {
  process.env.AUTH_URL = resolvedBaseUrl;
}

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const NEXTAUTH_SECRET = process.env.NEXTAUTH_SECRET || process.env.AUTH_SECRET;
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
    "NextAuth secret is missing. Set NEXTAUTH_SECRET or AUTH_SECRET in your Vercel environment variables.",
  );
}

if (!NEXTAUTH_URL) {
  console.warn(
    "NextAuth URL is missing. Set NEXTAUTH_URL in your environment.",
  );
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  secret: NEXTAUTH_SECRET || "scentsl_default_auth_secret_key_2026",
  trustHost: true,
  useSecureCookies: process.env.NODE_ENV === "production",
  adapter: PrismaAdapter(prisma),
  session: { strategy: "jwt" },
  pages: { signIn: "/auth/signin" },
  providers: [
    GoogleProvider({
      clientId: GOOGLE_CLIENT_ID!,
      clientSecret: GOOGLE_CLIENT_SECRET!,
      allowDangerousEmailAccountLinking: true,
      checks: ["state"],
    }),
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        const rawEmail = (credentials.email as string).trim();
        const inputPassword = credentials.password as string;

        // Check ADMIN_EMAIL and ADMIN_PASSWORD environment variables
        const envAdminEmail = process.env.ADMIN_EMAIL?.trim();
        const envAdminPassword = process.env.ADMIN_PASSWORD;

        if (
          envAdminEmail &&
          envAdminPassword &&
          rawEmail.toLowerCase() === envAdminEmail.toLowerCase() &&
          inputPassword === envAdminPassword
        ) {
          let adminUser = await prisma.user.findFirst({
            where: { email: { equals: envAdminEmail, mode: "insensitive" } },
          });

          if (!adminUser) {
            const hashedPassword = await bcrypt.hash(envAdminPassword, 10);
            adminUser = await prisma.user.create({
              data: {
                email: envAdminEmail,
                name: "Admin",
                password: hashedPassword,
                role: "ADMIN",
                isActive: true,
              },
            });
          } else if (adminUser.role !== "ADMIN" || adminUser.isActive === false) {
            adminUser = await prisma.user.update({
              where: { id: adminUser.id },
              data: { role: "ADMIN", isActive: true },
            });
          }

          return {
            id: adminUser.id,
            email: adminUser.email,
            name: adminUser.name,
            image: adminUser.image,
            role: adminUser.role,
          };
        }

        // Standard database user authentication
        const user = await prisma.user.findFirst({
          where: {
            email: {
              equals: rawEmail,
              mode: "insensitive",
            },
          },
        });

        if (!user || !user.password) return null;
        if (user.isActive === false) return null;

        const valid = await bcrypt.compare(inputPassword, user.password);
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
  cookies: {
    pkceCodeVerifier: {
      name:
        process.env.NODE_ENV === "production"
          ? "__Secure-authjs.pkce.code_verifier"
          : "authjs.pkce.code_verifier",
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: process.env.NODE_ENV === "production",
      },
    },
  },
  callbacks: {
    async redirect({ url, baseUrl }) {
      if (url.startsWith("/")) {
        return url;
      }
      try {
        const appBase = getAppBaseUrl();
        const targetUrl = new URL(url);
        if ((targetUrl.hostname === "localhost" || targetUrl.hostname === "127.0.0.1") && !appBase.includes("localhost")) {
          return `${targetUrl.pathname}${targetUrl.search}${targetUrl.hash}`;
        }
        const currentOrigin = new URL(appBase).origin;
        if (targetUrl.origin === currentOrigin || targetUrl.origin === new URL(baseUrl).origin) {
          return url;
        }
      } catch {
        // Ignored invalid URL string
      }
      return "/";
    },
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id as string;
        token.role = (user as any).role ?? "CUSTOMER";
      }
      return token;
    },
    async session({ session, token }) {
      if (token?.id) {
        session.user.id = token.id as string;
        session.user.role = ((token.role as Role) ?? "CUSTOMER");
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
