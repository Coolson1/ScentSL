import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/**
 * GET /api/orders/[id]/status
 *
 * Lightweight polling endpoint for the success page to check payment state.
 * Does not require authentication (works for guest orders too).
 * Returns minimal data only.
 */
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: orderId } = await params;

  try {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      select: {
        id: true,
        orderNumber: true,
        status: true,
        paymentStatus: true,
      },
    });

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    return NextResponse.json({
      orderId: order.id,
      orderNumber: order.orderNumber,
      status: order.status,
      paymentStatus: order.paymentStatus,
    });
  } catch (err) {
    console.error("[OrderStatus] Error:", err);
    return NextResponse.json(
      { error: "Failed to fetch order status" },
      { status: 500 }
    );
  }
}
