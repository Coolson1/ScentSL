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

  // Use the official Monime signature header
  const signatureHeader =
    req.headers.get("monime-signature") ||
    req.headers.get("Monime-Signature");

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

  // Parse the event type based on the official Monime webhook event shape (event.name)
  // Fallbacks for older test shapes
  const eventPayload = event?.event as Record<string, unknown> | undefined;
  const eventType =
    (eventPayload?.name as string) ||
    (event?.type as string) ||
    (event?.event as string) ||
    (event?.eventType as string);
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

    // Wrap all state updates in a single ACID transaction
    await prisma.$transaction(async (tx) => {
      // 1. Atomic update to prevent race conditions
      const updateResult = await tx.payment.updateMany({
        where: { 
          id: payment.id,
          status: { not: "PAID" }
        },
        data: {
          status: "PAID",
          paidAt: now,
          webhookProcessedAt: now,
          rawWebhookPayload: rawBody,
        },
      });

      if (updateResult.count === 0) {
        console.log(
          "[Webhook/Monime] Payment already processed concurrently for session:",
          monimeSessionId
        );
        return;
      }

      // 2. Update order status
      await tx.order.update({
        where: { id: order.id },
        data: {
          status: "PAID",
          paymentStatus: "PAID",
        },
      });

      // 3. Decrement stock for each order item
      for (const item of order.items) {
        await tx.productVariant.update({
          where: { id: item.variantId },
          data: { stock: { decrement: item.quantity } },
        });
      }

      // 4. Clear the customer's bag
      if (order.userId) {
        const userCart = await tx.cart.findUnique({
          where: { userId: order.userId },
        });
        if (userCart) {
          await tx.cartItem.deleteMany({ where: { cartId: userCart.id } });
        }
      }
    });

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

  // Atomic update to ensure we don't overwrite a PAID status
  // and handle concurrent webhooks
  const updateResult = await prisma.payment.updateMany({
    where: { 
      id: payment.id,
      status: { not: "PAID" }
    },
    data: {
      status: newStatus,
      failedAt: new Date(),
      webhookProcessedAt: new Date(),
    },
  });

  if (updateResult.count === 0) return;

  await prisma.order.update({
    where: { id: payment.orderId },
    // Update both paymentStatus and fulfillment status for cancellations/failures
    data: { 
      paymentStatus: newStatus,
      ...(newStatus === "CANCELLED" || newStatus === "EXPIRED" || newStatus === "FAILED" ? { status: "CANCELLED" } : {})
    },
  });

  console.log(
    `[Webhook/Monime] Order ${payment.orderId} payment marked ${newStatus}`
  );
}
