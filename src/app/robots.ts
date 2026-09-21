import type { MetadataRoute } from "next";

const BASE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL ||
  process.env.NEXT_PUBLIC_APP_URL ||
  "https://scentsl.com"
).replace(/\/+$/, "");

const DOMAIN = BASE_URL.includes("localhost") || BASE_URL.includes("vercel.app")
  ? "https://scentsl.com"
  : BASE_URL;

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/admin",
          "/admin/*",
          "/account",
          "/account/*",
          "/cart",
          "/checkout",
          "/checkout/*",
          "/auth",
          "/auth/*",
          "/dashboard",
          "/dashboard/*",
          "/api",
          "/api/*",
        ],
      },
    ],
    sitemap: `${DOMAIN}/sitemap.xml`,
  };
}
