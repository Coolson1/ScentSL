import { NextResponse } from "next/server";
import { z } from "zod";
import { auth, requireStaff } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { OrderStatus } from "@/generated/prisma/enums";

const STATUSES = Object.values(OrderStatus) as [OrderStatus, ...OrderStatus[]];

const patchSchema = z.object({
  status: z.enum(STATUSES),
});

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await auth();
  const denied = requireStaff(session);
  if (denied) return denied;

  const { id } = await params;

  const body = await req.json().catch(() => null);
  const parsed = patchSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid status" }, { status: 400 });
  }

  const existing = await prisma.order.findUnique({ where: { id } });
  if (!existing) {
    return NextResponse.json({ error: "Order not found" }, { status: 404 });
  }

  const newStatus = parsed.data.status;
  const updateData: { status: OrderStatus; paymentStatus?: "CANCELLED" | "PAID" } = {
    status: newStatus,
  };
  if (newStatus === "CANCELLED") {
    updateData.paymentStatus = "CANCELLED";
  } else if (newStatus === "PAID") {
    updateData.paymentStatus = "PAID";
  }

  const order = await prisma.order.update({
    where: { id },
    data: updateData,
  });

  return NextResponse.json({ order });
}
