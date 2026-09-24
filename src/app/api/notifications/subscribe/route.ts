import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

const subscribeSchema = z.object({
  endpoint: z.string().url(),
  p256dh: z.string().min(1),
  auth: z.string().min(1),
  userAgent: z.string().optional(),
});

export async function POST(req: Request) {
  try {
    const session = await auth();
    const userId = session?.user?.id || null;

    const body = await req.json().catch(() => null);
    const parsed = subscribeSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid subscription payload", issues: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { endpoint, p256dh, auth: authKey, userAgent } = parsed.data;

    const subscription = await prisma.pushSubscription.upsert({
      where: { endpoint },
      create: {
        userId,
        endpoint,
        p256dh,
        auth: authKey,
        userAgent,
      },
      update: {
        userId: userId || undefined,
        p256dh,
        auth: authKey,
        userAgent,
        updatedAt: new Date(),
      },
    });

    // Ensure default notification preferences exist for authenticated user
    if (userId) {
      await prisma.userNotificationPreference.upsert({
        where: { userId },
        create: { userId },
        update: {},
      });
    }

    return NextResponse.json({ success: true, subscription });
  } catch (err) {
    console.error("[API/Notifications/Subscribe] Error:", err);
    return NextResponse.json({ error: "Failed to save subscription" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const body = await req.json().catch(() => null);
    const endpoint = body?.endpoint;
    if (!endpoint || typeof endpoint !== "string") {
      return NextResponse.json({ error: "Missing endpoint" }, { status: 400 });
    }

    await prisma.pushSubscription.deleteMany({
      where: { endpoint },
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[API/Notifications/Subscribe] Delete error:", err);
    return NextResponse.json({ error: "Failed to delete subscription" }, { status: 500 });
  }
}
