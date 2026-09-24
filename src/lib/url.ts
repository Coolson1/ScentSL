/**
 * src/lib/url.ts
 * Utility for resolving the application's base URL dynamically across
 * local development, Vercel preview, and production environments.
 */

export function getAppBaseUrl(): string {
  // 1. Client-side browser context: use the window's actual origin
  if (typeof window !== "undefined" && window.location?.origin) {
    return window.location.origin;
  }

  // 2. Explicit public app URL if defined and not pointing to localhost
  const appUrl = process.env.NEXT_PUBLIC_APP_URL;
  if (appUrl && !appUrl.includes("localhost")) {
    return appUrl.startsWith("http") ? appUrl.replace(/\/+$/, "") : `https://${appUrl.replace(/\/+$/, "")}`;
  }

  // 3. Explicit NextAuth URL if defined and not pointing to localhost
  const authUrl = process.env.NEXTAUTH_URL || process.env.AUTH_URL;
  if (authUrl && !authUrl.includes("localhost")) {
    return authUrl.startsWith("http") ? authUrl.replace(/\/+$/, "") : `https://${authUrl.replace(/\/+$/, "")}`;
  }

  // 4. Vercel deployment URLs (automatically set on preview & production deployments)
  if (process.env.VERCEL_PROJECT_PRODUCTION_URL && process.env.VERCEL_ENV === "production") {
    return `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL.replace(/\/+$/, "")}`;
  }
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL.replace(/\/+$/, "")}`;
  }

  // 5. Explicit appUrl / authUrl fallbacks (including local dev if set)
  if (appUrl) {
    return appUrl.startsWith("http") ? appUrl.replace(/\/+$/, "") : `https://${appUrl.replace(/\/+$/, "")}`;
  }
  if (authUrl) {
    return authUrl.startsWith("http") ? authUrl.replace(/\/+$/, "") : `https://${authUrl.replace(/\/+$/, "")}`;
  }

  // 6. Default fallback for local development
  return "http://localhost:3000";
}
