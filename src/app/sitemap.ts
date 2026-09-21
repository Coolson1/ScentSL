import type { MetadataRoute } from "next";
import { prisma, withRetry } from "@/lib/prisma";

const DOMAIN = "https://www.scentsl.com";

export const revalidate = 3600; // Revalidate sitemap every hour

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();

  // 1. Static public pages
  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: `${DOMAIN}`,
      lastModified: now,
      changeFrequency: "daily",
      priority: 1.0,
    },
    {
      url: `${DOMAIN}/products`,
      lastModified: now,
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${DOMAIN}/privacy`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.3,
    },
    {
      url: `${DOMAIN}/terms`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.3,
    },
    {
      url: `${DOMAIN}/refund-policy`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.3,
    },
    {
      url: `${DOMAIN}/cookie-policy`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.3,
    },
    {
      url: `${DOMAIN}/data-deletion`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.3,
    },
  ];

  // 2. Safely fetch active public products and categories with fallback
  try {
    const [products, categories] = await withRetry(() =>
      Promise.all([
        prisma.product.findMany({
          where: { isActive: true },
          select: { slug: true, createdAt: true },
          orderBy: { createdAt: "desc" },
        }),
        prisma.category.findMany({
          select: { slug: true },
          orderBy: { name: "asc" },
        }),
      ]),
    );

    // Dynamic product URLs (/products/[slug])
    const productRoutes: MetadataRoute.Sitemap = products.map((product) => ({
      url: `${DOMAIN}/products/${product.slug}`,
      lastModified: product.createdAt ?? now,
      changeFrequency: "weekly",
      priority: 0.8,
    }));

    // Category filtered URLs (/products?category=[slug])
    const categoryRoutes: MetadataRoute.Sitemap = categories.map((category) => ({
      url: `${DOMAIN}/products?category=${category.slug}`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.7,
    }));

    return [...staticRoutes, ...categoryRoutes, ...productRoutes];
  } catch (error) {
    console.error("[Sitemap] Dynamic route fetch failed, returning static fallback:", error);
    // Never crash or 404 — return static public routes if DB lookup fails
    return staticRoutes;
  }
}
