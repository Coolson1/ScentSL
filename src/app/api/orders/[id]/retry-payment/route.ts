import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { createCheckoutSession, MonimeLineItem } from "@/lib/monime";
import { randomUUID } from "node:crypto";

function getBaseUrl(): string {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL;
  if (appUrl) {
    if (!appUrl.startsWith("http://") && !appUrl.startsWith("https://")) {
      return `https://${appUrl}`;
    }
    return appUrl.replace(/\/+$/, "");
  }
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }
  return "http://localhost:3000";
}

const APP_URL = getBaseUrl();

/**
 * POST /api/orders/[id]/retry-payment
 *
 * Creates a new Monime checkout session for an existing unpaid order.
 * Safe to call multiple times — only proceeds if paymentStatus is not PAID.
 */
export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: orderId } = await params;

  try {
    const session = await auth();
    const userId = session?.user?.id ?? null;

    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        items: {
          include: {
            variant: { include: { product: true } },
          },
        },
        deliveryZone: true,
      },
    });

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    // Auth: must own the order (or be admin/staff)
    const authSession = await auth();
    const isAdmin = authSession?.user?.role === "ADMIN" || authSession?.user?.role === "STAFF";
    if (order.userId && order.userId !== userId && !isAdmin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    // Cannot retry a paid order
    if (order.paymentStatus === "PAID") {
      return NextResponse.json(
        { error: "This order has already been paid." },
        { status: 400 }
      );
    }

    // Only allow retry for PENDING, FAILED, CANCELLED, EXPIRED
    const retryableStatuses = ["PENDING", "FAILED", "CANCELLED", "EXPIRED"];
    if (!retryableStatuses.includes(order.paymentStatus)) {
      return NextResponse.json(
        { error: `Cannot retry payment for order in status: ${order.paymentStatus}` },
        { status: 400 }
      );
    }

    // Create a new Payment record for this retry attempt
    const idempotencyKey = randomUUID();
    const payment = await prisma.payment.create({
      data: {
        orderId: order.id,
        amount: order.total,
        currency: "SLE",
        status: "PENDING",
        idempotencyKey,
      },
    });

    // Build line items from existing order items (prices are snapshotted in DB)
    const monimeLineItems: MonimeLineItem[] = order.items.map((item) => ({
      name: `${item.variant.product.name} (${item.variant.size})`,
      price: { currency: "SLE", value: item.price },
      type: "custom",
      quantity: item.quantity,
    }));

    if (order.deliveryFee > 0) {
      monimeLineItems.push({
        name: `Delivery (${order.deliveryZone.name})`,
        price: { currency: "SLE", value: order.deliveryFee },
        type: "custom",
        quantity: 1,
      });
    }

    const successUrl = `${APP_URL}/checkout/success?orderId=${order.id}&sid={CHECKOUT_SESSION_ID}`;
    const cancelUrl = `${APP_URL}/api/checkout/cancel?orderId=${order.id}`;

    let monimeSession: { id: string; redirectUrl: string };
    try {
      monimeSession = await createCheckoutSession({
        orderId: order.id,
        orderNumber: order.orderNumber || order.id,
        lineItems: monimeLineItems,
        successUrl,
        cancelUrl,
      });
    } catch (monimeErr) {
      console.error("[RetryPayment] Monime session creation failed:", monimeErr);
      await prisma.payment.update({
        where: { id: payment.id },
        data: { status: "FAILED", failedAt: new Date() },
      });
      return NextResponse.json(
        { error: "Failed to create payment session. Please try again." },
        { status: 502 }
      );
    }

    // Update payment and order with new session ID
    await prisma.$transaction([
      prisma.payment.update({
        where: { id: payment.id },
        data: { monimeSessionId: monimeSession.id },
      }),
      prisma.order.update({
        where: { id: order.id },
        data: {
          monimeSessionId: monimeSession.id,
          paymentStatus: "PENDING",
          status: "PENDING",
        },
      }),
    ]);

    return NextResponse.json({
      success: true,
      orderId: order.id,
      redirectUrl: monimeSession.redirectUrl,
    });
  } catch (err) {
    console.error("[RetryPayment] Error:", err);
    return NextResponse.json(
      { error: "Failed to process retry. Please try again." },
      { status: 500 }
    );
  }
}
