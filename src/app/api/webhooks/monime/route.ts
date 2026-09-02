import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyWebhookSignature } from "@/lib/monime";

/**
 * POST /api/webhooks/monime
 *
 * Monime sends payment events here. We verify the signature,
 * then idempotently update the order and decrement stock.
 *
 * This is the ONLY place where an order gets marked PAID
 * and stock gets decremented.
 */
export async function POST(req: Request) {
  // ── 1. Read raw body for signature verification ──────────
  const rawBody = await req.text();

  // Try multiple possible Monime signature headers
  const signatureHeader =
    req.headers.get("monime-signature") ||
    req.headers.get("x-monime-signature") ||
    req.headers.get("x-hub-signature-256");

  // ── 2. Verify signature ───────────────────────────────────
  const isValid = await verifyWebhookSignature(rawBody, signatureHeader);
  if (!isValid) {
    console.warn("[Webhook/Monime] Invalid signature. Headers:", {
      "monime-signature": req.headers.get("monime-signature"),
      "x-monime-signature": req.headers.get("x-monime-signature"),
    });
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  // ── 3. Parse event ─────────────────────────────────────────
  let event: Record<string, unknown>;
  try {
    event = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const eventType =
    (event.type as string) ||
    (event.event as string) ||
    (event.eventType as string);
  console.log("[Webhook/Monime] Received event:", eventType);

  // Extract the checkout session from the event payload
  // Monime may nest it under event.data, event.result, or the top level
  const sessionData =
    (event.data as Record<string, unknown>) ||
    (event.result as Record<string, unknown>) ||
    event;

  const monimeSessionId =
    (sessionData.id as string) ||
    (sessionData.checkoutSessionId as string) ||
    (sessionData.sessionId as string);

  if (!monimeSessionId) {
    console.warn("[Webhook/Monime] No session ID in event:", event);
    return NextResponse.json({ received: true });
  }

  // ── 4. Handle checkout_session.completed ──────────────────
  if (
    eventType === "checkout_session.completed" ||
    eventType === "checkout.completed" ||
    eventType === "payment.completed" ||
    (sessionData.status === "completed")
  ) {
    await handlePaymentSuccess(monimeSessionId, rawBody);
  }

  // ── 5. Handle failed/cancelled/expired ────────────────────
  else if (
    eventType === "checkout_session.failed" ||
    eventType === "payment.failed" ||
    sessionData.status === "failed"
  ) {
    await handlePaymentFailed(monimeSessionId, "FAILED");
  } else if (
    eventType === "checkout_session.cancelled" ||
    sessionData.status === "cancelled"
  ) {
    await handlePaymentFailed(monimeSessionId, "CANCELLED");
  } else if (
    eventType === "checkout_session.expired" ||
    sessionData.status === "expired"
  ) {
    await handlePaymentFailed(monimeSessionId, "EXPIRED");
  }

  return NextResponse.json({ received: true });
}

async function handlePaymentSuccess(
  monimeSessionId: string,
  rawBody: string
) {
  // ── Idempotency: find payment by session ID ──────────────
  const payment = await prisma.payment.findUnique({
    where: { monimeSessionId },
    include: {
      order: {
        include: { items: true },
      },
    },
  });

  if (!payment) {
    console.warn(
      "[Webhook/Monime] No payment found for session:",
      monimeSessionId
    );
    return;
  }

  // Already processed — idempotent exit
  if (payment.status === "PAID") {
    console.log(
      "[Webhook/Monime] Payment already processed for session:",
      monimeSessionId
    );
    return;
  }

  const order = payment.order;

  // ── Mark PAID + decrement stock + clear bag (sequential, Neon HTTP compatible) ─
  try {
    const now = new Date();

    // Update payment record
    await prisma.payment.update({
      where: { id: payment.id },
      data: {
        status: "PAID",
        paidAt: now,
        webhookProcessedAt: now,
        rawWebhookPayload: rawBody,
      },
    });

    // Update order
    await prisma.order.update({
      where: { id: order.id },
      data: {
        status: "PAID",
        paymentStatus: "PAID",
      },
    });

    // Decrement stock for each order item
    await Promise.all(
      order.items.map((item) =>
        prisma.productVariant.update({
          where: { id: item.variantId },
          data: { stock: { decrement: item.quantity } },
        })
      )
    );

    // Clear the customer's bag
    if (order.userId) {
      const userCart = await prisma.cart.findUnique({
        where: { userId: order.userId },
      });
      if (userCart) {
        await prisma.cartItem.deleteMany({ where: { cartId: userCart.id } });
      }
    }

    console.log(
      `[Webhook/Monime] Order ${order.id} (${order.orderNumber}) marked PAID`

    );
  } catch (err) {
    console.error(
      "[Webhook/Monime] Transaction failed for session:",
      monimeSessionId,
      err
    );
    throw err; // Let Monime retry
  }
}

async function handlePaymentFailed(
  monimeSessionId: string,
  newStatus: "FAILED" | "CANCELLED" | "EXPIRED"
) {
  const payment = await prisma.payment.findUnique({
    where: { monimeSessionId },
  });

  if (!payment || payment.status === "PAID") return;

  await prisma.$transaction([
    prisma.payment.update({
      where: { id: payment.id },
      data: {
        status: newStatus,
        failedAt: new Date(),
        webhookProcessedAt: new Date(),
      },
    }),
    prisma.order.update({
      where: { id: payment.orderId },
      // Update both paymentStatus and fulfillment status for cancellations/failures
      data: { 
        paymentStatus: newStatus,
        ...(newStatus === "CANCELLED" || newStatus === "EXPIRED" || newStatus === "FAILED" ? { status: "CANCELLED" } : {})
      },
    }),
  ]);

  console.log(
    `[Webhook/Monime] Order ${payment.orderId} payment marked ${newStatus}`
  );
}
