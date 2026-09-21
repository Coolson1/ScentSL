import type { MetadataRoute } from "next";

const DOMAIN = "https://www.scentsl.com";

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
