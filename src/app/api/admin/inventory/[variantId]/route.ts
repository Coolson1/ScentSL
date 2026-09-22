import { NextResponse } from "next/server";
import { z } from "zod";
import { auth, requireStaff } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { notifyBackInStock } from "@/lib/notifications/service";

const patchSchema = z.object({
  stock: z.number().int().min(0, "Stock cannot be negative"),
});

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ variantId: string }> },
) {
  const session = await auth();
  const denied = requireStaff(session);
  if (denied) return denied;

  const { variantId } = await params;

  const body = await req.json().catch(() => null);
  const parsed = patchSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid stock value" },
      { status: 400 },
    );
  }

  const variant = await prisma.productVariant.findUnique({
    where: { id: variantId },
    include: { product: true },
  });
  if (!variant) {
    return NextResponse.json({ error: "Variant not found" }, { status: 404 });
  }

  const newStock = parsed.data.stock;

  const updated = await prisma.productVariant.update({
    where: { id: variantId },
    data: { stock: newStock },
  });

  // Trigger back in stock notification if stock was previously 0 and is now > 0
  if (variant.stock === 0 && newStock > 0 && variant.product) {
    await notifyBackInStock(
      variant.product.id,
      variant.product.name,
      variant.product.slug
    ).catch(console.error);
  }

  return NextResponse.json({ variant: updated });
}
