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

  const notifications = await prisma.notificationLog.findMany({
    where: userId
      ? { OR: [{ userId }, { userId: null }] }
      : { userId: null },
    orderBy: { createdAt: "desc" },
    take: limit,
  });

  const unreadCount = await prisma.notificationLog.count({
    where: userId
      ? { OR: [{ userId }, { userId: null }], isRead: false }
      : { userId: null, isRead: false },
  });

  return NextResponse.json(
    { notifications, unreadCount },
    {
      headers: { "Cache-Control": "no-store, max-age=0" },
    }
  );
}
