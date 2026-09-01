import Link from "next/link";
import { notFound } from "next/navigation";

import { prisma } from "@/lib/prisma";
import { ProductForm } from "@/components/admin/ProductForm";

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const [product, categories, vendors] = await Promise.all([
    prisma.product.findUnique({
      where: { id },
      include: { variants: { orderBy: { price: "asc" } } },
    }),
    prisma.category.findMany({
      orderBy: { name: "asc" },
      select: { id: true, name: true },
    }),
    prisma.vendor.findMany({
      orderBy: { businessName: "asc" },
      select: { id: true, businessName: true, status: true },
    }),
  ]);

  if (!product) notFound();

  return (
    <div className="space-y-6">
      <header>
        <Link
          href="/admin/products"
          className="text-xs uppercase tracking-widest text-muted-foreground hover:text-brand-gold"
        >
          ← Back to products
        </Link>
        <h1 className="mt-2 font-serif text-3xl text-brand-black">
          Edit product
        </h1>
        <p className="text-sm text-muted-foreground">{product.name}</p>
      </header>

      <ProductForm
        categories={categories}
        vendors={vendors}
        defaults={{
          id: product.id,
          name: product.name,
          slug: product.slug,
          categoryId: product.categoryId,
          vendorId: product.vendorId,
          description: product.description,
          images: product.images,
          isFeatured: product.isFeatured,
          isActive: product.isActive,
          variants: product.variants.map((v) => ({
            id: v.id,
            size: v.size,
            price: v.price,
            stock: v.stock,
            sku: v.sku,
          })),
        }}
      />
    </div>
  );
}
