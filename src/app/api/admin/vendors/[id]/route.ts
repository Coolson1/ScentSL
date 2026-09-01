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

  const totalSales = vendor.orderItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );
  const totalCommission = vendor.orderItems.reduce(
    (sum, item) => sum + item.commissionAmount,
    0
  );
  const totalVendorAmount = vendor.orderItems.reduce(
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

  const productCount = await prisma.product.count({ where: { vendorId: id } });
  const orderItemCount = await prisma.orderItem.count({ where: { vendorId: id } });

  if (productCount > 0 || orderItemCount > 0) {
    return NextResponse.json(
      {
        error: `Cannot delete vendor with ${productCount} products and ${orderItemCount} order items. Suspend or reassign products first.`,
      },
      { status: 400 }
    );
  }

  await prisma.vendor.delete({ where: { id } });

  return NextResponse.json({ success: true });
}
