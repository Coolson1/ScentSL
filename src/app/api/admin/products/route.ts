import { NextResponse } from "next/server";
import { auth, requireStaff } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { productInputSchema } from "@/lib/validators/product";

export async function GET(req: Request) {
  const session = await auth();
  const denied = requireStaff(session);
  if (denied) return denied;

  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q")?.trim() ?? "";

  const products = await prisma.product.findMany({
    where: q
      ? { name: { contains: q, mode: "insensitive" } }
      : undefined,
    include: {
      category: true,
      vendor: { select: { id: true, businessName: true } },
      _count: { select: { variants: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ products });
}

export async function POST(req: Request) {
  const session = await auth();
  const denied = requireStaff(session);
  if (denied) return denied;

  const body = await req.json().catch(() => null);
  const parsed = productInputSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid input", issues: parsed.error.flatten() },
      { status: 400 },
    );
  }
  const data = parsed.data;

  // Slug uniqueness
  const existing = await prisma.product.findUnique({ where: { slug: data.slug } });
  if (existing) {
    return NextResponse.json({ error: "Slug already in use" }, { status: 409 });
  }

  const product = await prisma.product.create({
    data: {
      name: data.name,
      slug: data.slug,
      description: data.description,
      categoryId: data.categoryId,
      vendorId: data.vendorId || null,
      images: data.images,
      isFeatured: data.isFeatured,
      isPopular: data.isPopular,
      isActive: data.isActive,
      variants: {
        create: data.variants.map((v) => ({
          size: v.size,
          price: v.price,
          stock: v.stock,
          sku: v.sku ?? null,
        })),
      },
    },
    include: { variants: true, category: true, vendor: true },
  });

  return NextResponse.json({ product }, { status: 201 });
}
