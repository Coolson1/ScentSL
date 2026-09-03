import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  return handleCancel(req);
}

export async function POST(req: Request) {
  return handleCancel(req);
}

async function handleCancel(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const orderId = searchParams.get("orderId");

    if (orderId) {
      const order = await prisma.order.findUnique({
        where: { id: orderId },
        include: { payments: { where: { status: "PENDING" } } },
      });

      if (order && order.paymentStatus === "PENDING") {
        await prisma.order.update({
          where: { id: orderId },
          data: {
            paymentStatus: "CANCELLED",
            status: "CANCELLED",
          },
        });

        for (const p of order.payments) {
          await prisma.payment.update({
            where: { id: p.id },
            data: { status: "CANCELLED" },
          });
        }
      }
    }
  } catch (err) {
    console.error("[Checkout Cancel] Error updating order:", err);
    // Continue to redirect even if DB update fails
  }

  // Next.js standard redirect using the incoming request URL as base origin
  const targetUrl = new URL("/checkout?cancelled=true", req.url);
  return NextResponse.redirect(targetUrl);
}
