import { NextResponse } from "next/server";
import { z } from "zod";
import { auth, requireStaff } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { OrderStatus } from "@/generated/prisma/enums";
import {
  notifyOrderDispatched,
  notifyOutForDelivery,
  notifyOrderDelivered,
  notifyOrderCancelled,
} from "@/lib/notifications/service";

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

  // Trigger push notifications if status actually changed
  if (existing.status !== newStatus) {
    if (newStatus === "SHIPPED") {
      await notifyOrderDispatched(order).catch(console.error);
    } else if (newStatus === "PROCESSING") {
      await notifyOutForDelivery(order).catch(console.error);
    } else if (newStatus === "DELIVERED") {
      await notifyOrderDelivered(order).catch(console.error);
    } else if (newStatus === "CANCELLED") {
      await notifyOrderCancelled(order).catch(console.error);
    }
  }

  return NextResponse.json({ order });
}
