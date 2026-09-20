import type { Prisma, Gender } from "@/generated/prisma/client";

export type ProductSort = "newest" | "price_asc" | "price_desc";
export type ProductGender = Gender;

export type ProductSearchParams = {
  category?: string;
  gender?: ProductGender;
  minPrice?: number;
  maxPrice?: number;
  sort: ProductSort;
  page: number;
};

export const PRODUCT_PAGE_SIZE = 24;

function parseNumber(input: string | null): number | undefined {
  if (!input) return undefined;
  const n = Number(input);
  return Number.isFinite(n) && n > 0 ? n : undefined;
}

function parseGender(input: string | null): ProductGender | undefined {
  if (!input) return undefined;
  const upper = input.toUpperCase();
  if (upper === "MEN" || upper === "WOMEN" || upper === "UNISEX") {
    return upper as ProductGender;
  }
  return undefined;
}

function parseSort(input: string | null): ProductSort {
  switch (input) {
    case "price_asc":
    case "price_desc":
    case "newest":
      return input;
    default:
      return "newest";
  }
}

export function parseProductSearchParams(
  params: URLSearchParams | Record<string, string | string[] | undefined>,
): ProductSearchParams {
  const get = (key: string): string | null => {
    if (params instanceof URLSearchParams) return params.get(key);
    const raw = params[key];
    if (Array.isArray(raw)) return raw[0] ?? null;
    return raw ?? null;
  };

  const pageRaw = parseNumber(get("page"));
  return {
    category: get("category") ?? undefined,
    gender: parseGender(get("gender")),
    minPrice: parseNumber(get("minPrice")),
    maxPrice: parseNumber(get("maxPrice")),
    sort: parseSort(get("sort")),
    page: pageRaw ? Math.floor(pageRaw) : 1,
  };
}

export function buildProductWhere(
  params: ProductSearchParams,
): Prisma.ProductWhereInput {
  const variantPriceFilter: Prisma.IntFilter | undefined = (() => {
    if (!params.minPrice && !params.maxPrice) return undefined;
    return {
      ...(params.minPrice && { gte: params.minPrice * 100 }),
      ...(params.maxPrice && { lte: params.maxPrice * 100 }),
    };
  })();

  return {
    isActive: true,
    ...(params.category && { category: { slug: params.category } }),
    ...(params.gender && { gender: params.gender }),
    ...(variantPriceFilter && {
      variants: { some: { price: variantPriceFilter } },
    }),
  };
}

export function minVariantPrice(variants: { price: number }[]): number {
  if (variants.length === 0) return Number.POSITIVE_INFINITY;
  return variants.reduce((min, v) => (v.price < min ? v.price : min), variants[0].price);
}

export function sortProducts<T extends { variants: { price: number }[]; createdAt: Date }>(
  products: T[],
  sort: ProductSort,
): T[] {
  if (sort === "newest") {
    return [...products].sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }
  const dir = sort === "price_asc" ? 1 : -1;
  return [...products].sort((a, b) => (minVariantPrice(a.variants) - minVariantPrice(b.variants)) * dir);
}

export function paginate<T>(items: T[], page: number, pageSize = PRODUCT_PAGE_SIZE) {
  const total = items.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const safePage = Math.min(Math.max(1, page), totalPages);
  const start = (safePage - 1) * pageSize;
  return {
    items: items.slice(start, start + pageSize),
    total,
    totalPages,
    page: safePage,
    pageSize,
  };
}
