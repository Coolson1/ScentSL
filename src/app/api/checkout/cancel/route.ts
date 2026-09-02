import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  return handleCancel(req);
}

export async function POST(req: Request) {
  return handleCancel(req);
}

async function handleCancel(req: Request) {
  const { searchParams } = new URL(req.url);
  const orderId = searchParams.get("orderId");

  if (orderId) {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { payments: { where: { status: "PENDING" } } },
    });

    if (order && order.paymentStatus === "PENDING") {
      // Mark the order as CANCELLED for both fulfillment and payment
      await prisma.order.update({
        where: { id: orderId },
        data: { 
          paymentStatus: "CANCELLED",
          status: "CANCELLED" 
        },
      });
      
      // Mark all pending payments for this order as CANCELLED
      for (const p of order.payments) {
        await prisma.payment.update({
          where: { id: p.id },
          data: { status: "CANCELLED" },
        });
      }
    }
  }

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const url = `${baseUrl}/checkout?cancelled=true`;
  
  // Use 303 See Other to ensure the browser converts a POST to a GET
  return NextResponse.redirect(url, { status: 303 });
}
