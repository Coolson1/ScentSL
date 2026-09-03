import { NextResponse } from "next/server";
import { z } from "zod";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { VendorStatus } from "@/generated/prisma/enums";

const vendorUpdateSchema = z.object({
  businessName: z.string().min(2, "Business name is required").optional(),
  ownerName: z.string().optional().nullable(),
  phone: z.string().optional().nullable(),
  whatsapp: z.string().optional().nullable(),
  email: z.string().email("Invalid email").optional().or(z.literal("")).nullable(),
  address: z.string().optional().nullable(),
  description: z.string().optional().nullable(),
  logo: z.string().optional().nullable(),
  status: z.nativeEnum(VendorStatus).optional(),
  commissionRate: z.number().min(0, "Commission cannot be negative").max(100, "Commission cannot exceed 100%").optional(),
});

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session || (session.user?.role !== "ADMIN" && session.user?.role !== "STAFF")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  const vendor = await prisma.vendor.findUnique({
    where: { id },
    include: {
      products: {
        include: {
          category: { select: { name: true } },
          variants: { select: { price: true, stock: true } },
        },
        orderBy: { createdAt: "desc" },
      },
      orderItems: {
        include: {
          order: {
            select: {
              id: true,
              status: true,
              paymentStatus: true,
              createdAt: true,
              user: { select: { name: true, email: true } },
              guestEmail: true,
            },
          },
          product: { select: { name: true } },
          variant: { select: { size: true } },
        },
        orderBy: { order: { createdAt: "desc" } },
      },
    },
  });

  if (!vendor) {
    return NextResponse.json({ error: "Vendor not found" }, { status: 404 });
  }

  const paidItems = vendor.orderItems.filter(
    (item) => item.order.paymentStatus === "PAID" && item.order.status !== "CANCELLED"
  );
  const totalSales = paidItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );
  const totalCommission = paidItems.reduce(
    (sum, item) => sum + item.commissionAmount,
    0
  );
  const totalVendorAmount = paidItems.reduce(
    (sum, item) => sum + item.vendorAmount,
    0
  );

  return NextResponse.json({
    vendor: {
      ...vendor,
      totalSales,
      totalCommission,
      totalVendorAmount,
    },
  });
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session || session.user?.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  try {
    const body = await req.json();
    const parsed = vendorUpdateSchema.parse(body);

    const vendor = await prisma.vendor.update({
      where: { id },
      data: {
        ...(parsed.businessName && { businessName: parsed.businessName }),
        ...(parsed.ownerName !== undefined && { ownerName: parsed.ownerName || null }),
        ...(parsed.phone !== undefined && { phone: parsed.phone || null }),
        ...(parsed.whatsapp !== undefined && { whatsapp: parsed.whatsapp || null }),
        ...(parsed.email !== undefined && { email: parsed.email || null }),
        ...(parsed.address !== undefined && { address: parsed.address || null }),
        ...(parsed.description !== undefined && { description: parsed.description || null }),
        ...(parsed.logo !== undefined && { logo: parsed.logo || null }),
        ...(parsed.status && { status: parsed.status }),
        ...(parsed.commissionRate !== undefined && { commissionRate: parsed.commissionRate }),
      },
    });

    return NextResponse.json({ vendor });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: err.issues[0]?.message ?? "Invalid input" }, { status: 400 });
    }
    return NextResponse.json({ error: "Failed to update vendor" }, { status: 500 });
  }
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session || session.user?.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  const products = await prisma.product.findMany({
    where: { vendorId: id },
    select: { id: true },
  });
  const productIds = products.map((p) => p.id);

  if (productIds.length > 0) {
    const variants = await prisma.productVariant.findMany({
      where: { productId: { in: productIds } },
      select: { id: true },
    });
    const variantIds = variants.map((v) => v.id);

    if (variantIds.length > 0) {
      await prisma.orderItem.deleteMany({
        where: { variantId: { in: variantIds } },
      });
      await prisma.cartItem.deleteMany({
        where: { variantId: { in: variantIds } },
      });
      await prisma.productVariant.deleteMany({
        where: { id: { in: variantIds } },
      });
    }

    await prisma.wishlistItem.deleteMany({
      where: { productId: { in: productIds } },
    });
    await prisma.review.deleteMany({
      where: { productId: { in: productIds } },
    });
    await prisma.product.deleteMany({
      where: { id: { in: productIds } },
    });
  }

  // Also vendor might have direct orderItems linked via vendorId
  await prisma.orderItem.deleteMany({
    where: { vendorId: id },
  });

  await prisma.vendor.delete({ where: { id } });

  return NextResponse.json({ success: true });
}
