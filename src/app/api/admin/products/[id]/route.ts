import { NextResponse } from "next/server";
import { auth, requireStaff } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { productInputSchema } from "@/lib/validators/product";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await auth();
  const denied = requireStaff(session);
  if (denied) return denied;

  const { id } = await params;

  const body = await req.json().catch(() => null);
  const parsed = productInputSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid input", issues: parsed.error.flatten() },
      { status: 400 },
    );
  }
  const data = parsed.data;

  const current = await prisma.product.findUnique({
    where: { id },
    include: { variants: true },
  });
  if (!current) {
    return NextResponse.json({ error: "Product not found" }, { status: 404 });
  }

  if (data.slug !== current.slug) {
    const slugTaken = await prisma.product.findUnique({
      where: { slug: data.slug },
    });
    if (slugTaken && slugTaken.id !== id) {
      return NextResponse.json({ error: "Slug already in use" }, { status: 409 });
    }
  }

  const incomingIds = data.variants
    .map((v) => v.id)
    .filter((vid): vid is string => Boolean(vid));

  const variantsToDelete = current.variants.filter(
    (v) => !incomingIds.includes(v.id),
  );

  // Block deletion of variants referenced by orders — keeps order history intact.
  if (variantsToDelete.length > 0) {
    const referenced = await prisma.orderItem.count({
      where: { variantId: { in: variantsToDelete.map((v) => v.id) } },
    });
    if (referenced > 0) {
      return NextResponse.json(
        {
          error:
            "Cannot remove a variant that appears in past orders. Set stock to 0 instead.",
        },
        { status: 409 },
      );
    }
  }

  const product = await prisma.$transaction(async (tx) => {
    await tx.product.update({
      where: { id },
      data: {
        name: data.name,
        slug: data.slug,
        description: data.description,
        categoryId: data.categoryId,
        vendorId: data.vendorId || null,
        images: data.images,
        isFeatured: data.isFeatured,
        isActive: data.isActive,
      },
    });

    if (variantsToDelete.length > 0) {
      await tx.productVariant.deleteMany({
        where: { id: { in: variantsToDelete.map((v) => v.id) } },
      });
    }

    for (const v of data.variants) {
      if (v.id) {
        await tx.productVariant.update({
          where: { id: v.id },
          data: {
            size: v.size,
            price: v.price,
            stock: v.stock,
            sku: v.sku ?? null,
          },
        });
      } else {
        await tx.productVariant.create({
          data: {
            productId: id,
            size: v.size,
            price: v.price,
            stock: v.stock,
            sku: v.sku ?? null,
          },
        });
      }
    }

    return tx.product.findUnique({
      where: { id },
      include: { variants: true, category: true, vendor: true },
    });
  });

  return NextResponse.json({ product });
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await auth();
  const denied = requireStaff(session);
  if (denied) return denied;

  const { id } = await params;

  const product = await prisma.product.findUnique({ where: { id } });
  if (!product) {
    return NextResponse.json({ error: "Product not found" }, { status: 404 });
  }

  const orderRefs = await prisma.orderItem.count({ where: { productId: id } });

  if (orderRefs > 0) {
    await prisma.product.update({
      where: { id },
      data: { isActive: false },
    });
    return NextResponse.json({ softDeleted: true });
  }

  await prisma.product.delete({ where: { id } });
  return NextResponse.json({ deleted: true });
}
