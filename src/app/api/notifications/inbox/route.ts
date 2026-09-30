import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  let session = null;
  try {
    session = await auth();
  } catch (authErr) {
    console.warn("[API/Notifications/Inbox] Session resolution notice:", authErr);
  }

  const userId = session?.user?.id || null;
  const { searchParams } = new URL(req.url);
  const limit = Math.min(parseInt(searchParams.get("limit") || "20", 10), 50);

  if (!userId) {
    const notifications = await prisma.notificationLog.findMany({
      where: { userId: null },
      orderBy: { createdAt: "desc" },
      take: limit,
    });
    const unreadCount = await prisma.notificationLog.count({
      where: { userId: null, isRead: false },
    });
    return NextResponse.json(
      { notifications, unreadCount },
      { headers: { "Cache-Control": "no-store, max-age=0" } }
    );
  }

  // 1. Fetch user-specific notification logs
  const userNotifications = await prisma.notificationLog.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    take: limit,
  });

  const userNotificationKeys = new Set(
    userNotifications.map((n) => `${n.title}-${n.type}-${new Date(n.createdAt).getTime()}`)
  );

  // 2. Fetch shared broadcast notifications (userId: null)
  const sharedNotifications = await prisma.notificationLog.findMany({
    where: { userId: null },
    orderBy: { createdAt: "desc" },
    take: limit,
  });

  // Filter out any shared notifications that already have a user-specific record
  const uniqueShared = sharedNotifications.filter(
    (n) => !userNotificationKeys.has(`${n.title}-${n.type}-${new Date(n.createdAt).getTime()}`)
  );

  // 3. Merge, sort, and slice to requested limit
  const combined = [...userNotifications, ...uniqueShared]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, limit);

  const unreadCount = combined.filter((n) => !n.isRead).length;

  return NextResponse.json(
    { notifications: combined, unreadCount },
    {
      headers: { "Cache-Control": "no-store, max-age=0" },
    }
  );
}

