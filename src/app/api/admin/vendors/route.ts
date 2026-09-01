import { NextResponse } from "next/server";
import { z } from "zod";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { VendorStatus } from "@/generated/prisma/enums";

const vendorSchema = z.object({
  businessName: z.string().min(2, "Business name is required"),
  ownerName: z.string().optional().nullable(),
  phone: z.string().optional().nullable(),
  whatsapp: z.string().optional().nullable(),
  email: z.string().email("Invalid email").optional().or(z.literal("")).nullable(),
  address: z.string().optional().nullable(),
  description: z.string().optional().nullable(),
  logo: z.string().optional().nullable(),
  status: z.nativeEnum(VendorStatus).default(VendorStatus.ACTIVE),
  commissionRate: z.number().min(0, "Commission cannot be negative").max(100, "Commission cannot exceed 100%").default(2.0),
});

export async function GET(req: Request) {
  const session = await auth();
  if (!session || (session.user?.role !== "ADMIN" && session.user?.role !== "STAFF")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const statusParam = searchParams.get("status");
  const search = searchParams.get("q");

  const where: any = {};
  if (statusParam && Object.values(VendorStatus).includes(statusParam as VendorStatus)) {
    where.status = statusParam;
  }
  if (search) {
    where.OR = [
      { businessName: { contains: search, mode: "insensitive" } },
      { ownerName: { contains: search, mode: "insensitive" } },
      { email: { contains: search, mode: "insensitive" } },
    ];
  }

  const vendors = await prisma.vendor.findMany({
    where,
    include: {
      _count: {
        select: { products: true, orderItems: true },
      },
      orderItems: {
        select: {
          price: true,
          quantity: true,
          commissionAmount: true,
          vendorAmount: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  const vendorsWithMetrics = vendors.map((v) => {
    const totalSales = v.orderItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const totalCommission = v.orderItems.reduce((sum, item) => sum + item.commissionAmount, 0);
    const totalVendorAmount = v.orderItems.reduce((sum, item) => sum + item.vendorAmount, 0);

    const { orderItems, ...rest } = v;
    return {
      ...rest,
      totalSales,
      totalCommission,
      totalVendorAmount,
    };
  });

  return NextResponse.json({ vendors: vendorsWithMetrics });
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session || session.user?.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const parsed = vendorSchema.parse(body);

    const vendor = await prisma.vendor.create({
      data: {
        businessName: parsed.businessName,
        ownerName: parsed.ownerName || null,
        phone: parsed.phone || null,
        whatsapp: parsed.whatsapp || null,
        email: parsed.email || null,
        address: parsed.address || null,
        description: parsed.description || null,
        logo: parsed.logo || null,
        status: parsed.status,
        commissionRate: parsed.commissionRate,
      },
    });

    return NextResponse.json({ vendor }, { status: 201 });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: err.issues[0]?.message ?? "Invalid input" }, { status: 400 });
    }
    return NextResponse.json({ error: "Failed to create vendor" }, { status: 500 });
  }
}
