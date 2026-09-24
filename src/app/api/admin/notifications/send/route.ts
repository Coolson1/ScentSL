import { NextResponse } from "next/server";
import { z } from "zod";
import { auth, requireStaff } from "@/lib/auth";
import { sendNotificationBroadcast, sendNotificationToUser } from "@/lib/notifications/service";

const adminSendSchema = z.object({
  targetType: z.enum(["ALL", "SPECIFIC_USER", "WISHLIST_INTEREST"]),
  targetId: z.string().optional(),
  title: z.string().min(1, "Title is required"),
  message: z.string().min(1, "Message is required"),
  url: z.string().optional(),
});

export async function POST(req: Request) {
  const session = await auth();
  const denied = requireStaff(session);
  if (denied) return denied;

  const body = await req.json().catch(() => null);
  const parsed = adminSendSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid payload", issues: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const { targetType, targetId, title, message, url } = parsed.data;

  try {
    if (targetType === "SPECIFIC_USER" && targetId) {
      const res = await sendNotificationToUser({
        userId: targetId,
        type: "BROADCAST_ANNOUNCEMENT",
        category: "SHOPPING",
        title,
        message,
        url: url || "/products",
        idempotencyKey: `admin-broadcast-${targetId}-${Date.now()}`,
      });
      return NextResponse.json({ success: true, count: res.count });
    }

    const res = await sendNotificationBroadcast({
      type: "BROADCAST_ANNOUNCEMENT",
      category: "SHOPPING",
      title,
      message,
      url: url || "/products",
      idempotencyKeyPrefix: `admin-broadcast-${Date.now()}`,
    });

    return NextResponse.json({ success: true, count: res.totalSent });
  } catch (err) {
    console.error("[Admin/Notifications/Send] Error:", err);
    return NextResponse.json({ error: "Failed to send notification" }, { status: 500 });
  }
}
