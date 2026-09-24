import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

const pushSubscriptionSchema = z
  .object({
    endpoint: z.string().url("Valid subscription endpoint URL is required"),
    keys: z
      .object({
        p256dh: z.string().min(1, "p256dh key is required"),
        auth: z.string().min(1, "auth key is required"),
      })
      .optional(),
    p256dh: z.string().optional(),
    auth: z.string().optional(),
    userAgent: z.string().optional(),
  })
  .refine(
    (data) => (data.keys?.p256dh || data.p256dh) && (data.keys?.auth || data.auth),
    {
      message: "Subscription must contain p256dh and auth keys",
    }
  );

export async function POST(req: Request) {
  try {
    const session = await auth();
    const userId = session?.user?.id || null;

    const body = await req.json().catch(() => null);
    if (!body) {
      return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
    }

    const parsed = pushSubscriptionSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid subscription payload", issues: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { endpoint, keys, userAgent } = parsed.data;
    const p256dh = keys?.p256dh || parsed.data.p256dh!;
    const authKey = keys?.auth || parsed.data.auth!;

    // Check if subscription with this endpoint already exists
    const existing = await prisma.pushSubscription.findUnique({
      where: { endpoint },
    });

    let subscription;

    if (existing) {
      // Update/reactivate subscription
      subscription = await prisma.pushSubscription.update({
        where: { endpoint },
        data: {
          active: true,
          p256dh,
          auth: authKey,
          userAgent: userAgent || existing.userAgent,
          updatedAt: new Date(),
          // If visitor is signed in now, associate their userId
          ...(userId ? { userId } : {}),
        },
      });
    } else {
      // Create new subscription
      subscription = await prisma.pushSubscription.create({
        data: {
          endpoint,
          p256dh,
          auth: authKey,
          userId,
          active: true,
          userAgent,
        },
      });
    }

    // Ensure default notification preferences exist if user is authenticated
    if (userId) {
      await prisma.userNotificationPreference.upsert({
        where: { userId },
        create: { userId },
        update: {},
      }).catch(() => null);
    }

    return NextResponse.json({
      success: true,
      subscription,
    });
  } catch (err) {
    console.error("[API/Push/Subscribe] Error:", err);
    return NextResponse.json(
      { error: "Failed to save push subscription" },
      { status: 500 }
    );
  }
}

export async function DELETE(req: Request) {
  try {
    const body = await req.json().catch(() => null);
    const endpoint = body?.endpoint;

    if (!endpoint || typeof endpoint !== "string") {
      return NextResponse.json({ error: "Missing subscription endpoint" }, { status: 400 });
    }

    await prisma.pushSubscription.updateMany({
      where: { endpoint },
      data: { active: false },
    });

    return NextResponse.json({ success: true, message: "Subscription deactivated" });
  } catch (err) {
    console.error("[API/Push/Subscribe] Delete error:", err);
    return NextResponse.json(
      { error: "Failed to unsubscribe" },
      { status: 500 }
    );
  }
}

export async function GET() {
  const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || "";
  return NextResponse.json({ publicKey });
}
