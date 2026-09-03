import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import {
  calculateCouponDiscount,
  couponErrorMessage,
  validateCoupon,
} from "@/lib/coupon";
import { applyCouponSchema } from "@/lib/validators/checkout";
import { rateLimit } from "@/lib/rate-limit";

export async function POST(req: Request) {
  // Rate limit coupon application to prevent brute-forcing promo codes (max 10 tries per min)
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0] || "unknown";
  const { success } = await rateLimit(`coupon-${ip}`, { limit: 10, intervalMs: 60_000 });
  if (!success) {
    return NextResponse.json(
      { error: "Too many coupon attempts. Please wait a minute before trying again." },
      { status: 429 }
    );
  }

  const json = await req.json().catch(() => null);
  const parsed = applyCouponSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
  const { code, subtotal } = parsed.data;

  const coupon = await prisma.coupon.findUnique({
    where: { code: code.toUpperCase() },
  });

  const error = validateCoupon(coupon, subtotal);
  if (error || !coupon) {
    return NextResponse.json(
      { error: couponErrorMessage(error ?? "not_found") },
      { status: 400 },
    );
  }

  const discount = calculateCouponDiscount(coupon, subtotal);
  return NextResponse.json({
    discount,
    code: coupon.code,
    type: coupon.type,
    value: coupon.value,
  });
}
