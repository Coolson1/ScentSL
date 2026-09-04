import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { z } from "zod";

import { auth } from "@/lib/auth";
import { CART_SESSION_COOKIE, getCartWithItems } from "@/lib/cart";
import { createCheckoutSession, MonimeLineItem } from "@/lib/monime";
import { prisma } from "@/lib/prisma";
import { rateLimit } from "@/lib/rate-limit";

const checkoutSchema = z.object({
  recipientName: z.string().min(2),
  phone: z.string().min(6),
  streetAddress: z.string().min(3),
  city: z.string().min(2),
  deliveryZoneId: z.string().min(1),
  guestEmail: z.string().email().optional().or(z.literal("")),
  couponCode: z.string().optional(),
});

function getBaseUrl(): string {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.NEXTAUTH_URL;
  if (appUrl) {
    // Ensure protocol is present — users often set just the domain
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

export async function POST(req: Request) {
  try {
    const ip = req.headers.get("x-forwarded-for")?.split(",")[0] || "unknown";
    const { success } = await rateLimit(`checkout-${ip}`, { limit: 15, intervalMs: 60_000 });
    if (!success) {
      return NextResponse.json(
        { error: "Too many checkout requests. Please wait a minute before trying again." },
        { status: 429 }
      );
    }

    const session = await auth();
    const cookieStore = await cookies();
    const userId = session?.user?.id ?? null;
    const sessionId = cookieStore.get(CART_SESSION_COOKIE)?.value ?? null;

    // ── 1. Parse & validate input ─────────────────────────
    const body = await req.json().catch(() => ({}));
    const parsed = checkoutSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid checkout information", details: parsed.error.flatten() },
        { status: 400 }
      );
    }
    const data = parsed.data;

    // ── 2. Find the bag ────────────────────────────────────
    const cart = await getCartWithItems({
      userId,
      sessionId: userId ? null : sessionId,
    });

    if (!cart || cart.items.length === 0) {
      return NextResponse.json(
        { error: "Your bag is empty. Add items before checking out." },
        { status: 400 }
      );
    }

    // ── 3. Fetch fresh variant data from DB ───────────────
    const variantIds = cart.items.map((i) => i.variantId);
    const variants = await prisma.productVariant.findMany({
      where: { id: { in: variantIds } },
      include: {
        product: { include: { vendor: true } },
      },
    });

    // Validate stock
    for (const cartItem of cart.items) {
      const variant = variants.find((v) => v.id === cartItem.variantId);
      if (!variant || !variant.product.isActive) {
        return NextResponse.json(
          { error: `"${variant?.product.name ?? cartItem.variantId}" is no longer available.` },
          { status: 400 }
        );
      }
      if (variant.stock < cartItem.quantity) {
        return NextResponse.json(
          { error: `Not enough stock for "${variant.product.name} (${variant.size})". Only ${variant.stock} left.` },
          { status: 400 }
        );
      }
    }

    // ── 4. Validate delivery zone ──────────────────────────
    const zone = await prisma.deliveryZone.findUnique({
      where: { id: data.deliveryZoneId },
    });
    if (!zone || !zone.isActive) {
      return NextResponse.json(
        { error: "Selected delivery zone is invalid or inactive" },
        { status: 400 }
      );
    }
    const deliveryFee = zone.fee;

    // ── 5. Calculate totals server-side ───────────────────
    const subtotal = cart.items.reduce((sum, cartItem) => {
      const variant = variants.find((v) => v.id === cartItem.variantId)!;
      return sum + variant.price * cartItem.quantity;
    }, 0);

    // ── 6. Validate & apply coupon ────────────────────────
    let discount = 0;
    let couponId: string | null = null;
    if (data.couponCode) {
      const coupon = await prisma.coupon.findUnique({
        where: { code: data.couponCode.toUpperCase() },
      });
      if (coupon && coupon.isActive) {
        if (coupon.expiresAt && coupon.expiresAt < new Date()) {
          return NextResponse.json({ error: "This coupon has expired." }, { status: 400 });
        }
        if (coupon.maxUses && coupon.usedCount >= coupon.maxUses) {
          return NextResponse.json({ error: "This coupon has reached its usage limit." }, { status: 400 });
        }
        if (coupon.minOrder && subtotal < coupon.minOrder) {
          return NextResponse.json(
            { error: `This coupon requires a minimum order of ${coupon.minOrder / 100}.` },
            { status: 400 }
          );
        }
        if (coupon.type === "PERCENTAGE") {
          discount = Math.round((subtotal * coupon.value) / 100);
        } else {
          discount = coupon.value;
        }
        discount = Math.min(discount, subtotal);
        couponId = coupon.id;
      }
    }

    const total = Math.max(0, subtotal + deliveryFee - discount);

    // ── 7-10. Transactionally create address, order, payment & update coupon ──
    const { address, order, payment } = await prisma.$transaction(async (tx) => {
      const address = await tx.address.create({
        data: {
          userId,
          recipientName: data.recipientName,
          phone: data.phone,
          streetAddress: data.streetAddress,
          city: data.city,
          deliveryZoneId: data.deliveryZoneId,
        },
      });

      const order = await tx.order.create({
        data: {
          userId,
          guestEmail: data.guestEmail || null,
          status: "PENDING",
          paymentStatus: "PENDING",
          subtotal,
          deliveryFee,
          discount,
          total,
          deliveryZoneId: data.deliveryZoneId,
          addressId: address.id,
          couponId,
          items: {
            create: cart.items.map((cartItem) => {
              const variant = variants.find((v) => v.id === cartItem.variantId)!;
              const product = variant.product;
              const vendor = product.vendor;
              const itemPrice = variant.price;
              const itemSubtotal = itemPrice * cartItem.quantity;
              const commissionRate = vendor?.commissionRate ?? 2.0;
              const commissionAmount = Math.round(itemSubtotal * (commissionRate / 100));
              const vendorAmount = itemSubtotal - commissionAmount;
              return {
                variantId: cartItem.variantId,
                productId: product.id,
                vendorId: product.vendorId || vendor?.id || null,
                quantity: cartItem.quantity,
                price: itemPrice,
                commissionRate,
                commissionAmount,
                vendorAmount,
              };
            }),
          },
        },
      });

      if (couponId) {
        await tx.coupon.update({
          where: { id: couponId },
          data: { usedCount: { increment: 1 } },
        });
      }

      const payment = await tx.payment.create({
        data: {
          orderId: order.id,
          amount: total,
          currency: "SLE",
          status: "PENDING",
        },
      });

      return { address, order, payment };
    });

    // ── 11. Create Monime checkout session ────────────────
    const successUrl = `${APP_URL}/checkout/success?orderId=${order.id}&sid={CHECKOUT_SESSION_ID}`;
    const cancelUrl = `${APP_URL}/api/checkout/cancel?orderId=${order.id}`;

    const monimeLineItems: MonimeLineItem[] = cart.items.map((cartItem) => {
      const variant = variants.find((v) => v.id === cartItem.variantId)!;
      return {
        name: `${variant.product.name} (${variant.size})`,
        price: { currency: "SLE", value: variant.price },
        type: "custom",
        quantity: cartItem.quantity,
      };
    });

    if (deliveryFee > 0) {
      monimeLineItems.push({
        name: `Delivery (${zone.name})`,
        price: { currency: "SLE", value: deliveryFee },
        type: "custom",
        quantity: 1,
      });
    }

    let monimeSession: { id: string; redirectUrl: string };
    try {
      monimeSession = await createCheckoutSession({
        orderId: order.id,
        orderNumber: order.orderNumber ?? order.id,
        lineItems: monimeLineItems,
        successUrl,
        cancelUrl,
      });
    } catch (monimeErr) {
      const errMsg = monimeErr instanceof Error ? monimeErr.message : String(monimeErr);
      console.error("[Checkout] Monime session creation failed:", errMsg);
      // Mark payment as failed so user can retry
      await prisma.payment.update({
        where: { id: payment.id },
        data: { status: "FAILED", failedAt: new Date() },
      });
      await prisma.order.update({
        where: { id: order.id },
        data: { paymentStatus: "FAILED" },
      });
      return NextResponse.json(
        { error: `Payment gateway error: ${errMsg}` },
        { status: 502 }
      );
    }

    // ── 12. Save Monime session ID ─────────────────────────
    await Promise.all([
      prisma.order.update({
        where: { id: order.id },
        data: { monimeSessionId: monimeSession.id },
      }),
      prisma.payment.update({
        where: { id: payment.id },
        data: { monimeSessionId: monimeSession.id },
      }),
    ]);

    return NextResponse.json({
      success: true,
      orderId: order.id,
      orderNumber: order.orderNumber,
      redirectUrl: monimeSession.redirectUrl,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("[Checkout] Unhandled error:", message, err);
    return NextResponse.json(
      {
        error: "Failed to process checkout. Please try again.",
        ...(process.env.NODE_ENV !== "production" && { debug: message }),
      },
      { status: 500 }
    );
  }
}
