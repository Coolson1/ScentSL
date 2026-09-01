import { NextResponse } from "next/server";
import { z } from "zod";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const checkoutSchema = z.object({
  recipientName: z.string().min(2),
  phone: z.string().min(6),
  streetAddress: z.string().min(3),
  city: z.string().min(2),
  deliveryZoneId: z.string().min(1),
  guestEmail: z.string().email().optional().or(z.literal("")),
  couponCode: z.string().optional(),
});

export async function POST(req: Request) {
  try {
    const session = await auth();
    const userId = session?.user?.id ?? null;

    const body = await req.json().catch(() => ({}));
    const parsed = checkoutSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid checkout information", details: parsed.error.flatten() },
        { status: 400 }
      );
    }
    const data = parsed.data;

    // Find Cart (user cart or session cart)
    const cart = await prisma.cart.findFirst({
      where: userId ? { userId } : {},
      include: {
        items: {
          include: {
            variant: true,
          },
        },
      },
    });

    // If no cart found in DB or empty, fetch cart items directly from request or active items
    const cartItems = await prisma.cartItem.findMany({
      where: cart ? { cartId: cart.id } : { cart: { userId } },
      include: {
        variant: {
          include: {
            product: {
              include: {
                vendor: true,
              },
            },
          },
        },
      },
    });

    if (cartItems.length === 0) {
      return NextResponse.json(
        { error: "Your bag is empty. Add items before checking out." },
        { status: 400 }
      );
    }

    // Calculate subtotal
    const subtotal = cartItems.reduce(
      (sum, item) => sum + item.variant.price * item.quantity,
      0
    );

    // Fetch delivery zone fee
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

    // Coupon discount logic
    let discount = 0;
    let couponId: string | null = null;
    if (data.couponCode) {
      const coupon = await prisma.coupon.findUnique({
        where: { code: data.couponCode.toUpperCase() },
      });
      if (coupon && coupon.isActive) {
        if (coupon.type === "PERCENTAGE") {
          discount = Math.round((subtotal * coupon.value) / 100);
        } else {
          discount = coupon.value;
        }
        couponId = coupon.id;
      }
    }

    const total = Math.max(0, subtotal + deliveryFee - discount);

    // Create delivery address
    const address = await prisma.address.create({
      data: {
        userId,
        recipientName: data.recipientName,
        phone: data.phone,
        streetAddress: data.streetAddress,
        city: data.city,
        deliveryZoneId: data.deliveryZoneId,
      },
    });

    // Create Order with Vendor-linked OrderItems
    const order = await prisma.order.create({
      data: {
        userId,
        guestEmail: data.guestEmail || null,
        status: "PENDING",
        subtotal,
        deliveryFee,
        discount,
        total,
        deliveryZoneId: data.deliveryZoneId,
        addressId: address.id,
        couponId,
        items: {
          create: cartItems.map((ci) => {
            const product = ci.variant.product;
            const vendor = product.vendor;

            const itemPrice = ci.variant.price;
            const itemSubtotal = itemPrice * ci.quantity;
            const commissionRate = vendor?.commissionRate ?? 2.0;

            const commissionAmount = Math.round(
              itemSubtotal * (commissionRate / 100)
            );
            const vendorAmount = itemSubtotal - commissionAmount;

            return {
              variantId: ci.variantId,
              productId: product.id,
              vendorId: product.vendorId || vendor?.id || null,
              quantity: ci.quantity,
              price: itemPrice,
              commissionRate,
              commissionAmount,
              vendorAmount,
            };
          }),
        },
      },
      include: {
        items: true,
      },
    });

    // Decrement stock for ordered variants
    for (const ci of cartItems) {
      await prisma.productVariant.update({
        where: { id: ci.variantId },
        data: { stock: { decrement: ci.quantity } },
      });
    }

    // Clear cart items
    if (cart) {
      await prisma.cartItem.deleteMany({ where: { cartId: cart.id } });
    }

    return NextResponse.json({
      success: true,
      orderId: order.id,
      redirectUrl: `/checkout/success?orderId=${order.id}`,
    });
  } catch (err) {
    console.error("Checkout Error:", err);
    return NextResponse.json(
      { error: "Failed to process checkout. Please try again." },
      { status: 500 }
    );
  }
}
