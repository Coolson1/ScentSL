import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  let session = null;
  try {
    session = await auth();
  } catch (authErr) {
    console.warn("[API/Notifications/Inbox/MarkRead] Session check notice:", authErr);
  }

  const userId = session?.user?.id || null;
  const { id } = await params;

  if (id === "mark-all-read") {
    await prisma.notificationLog.updateMany({
      where: userId
        ? { OR: [{ userId }, { userId: null }], isRead: false }
        : { userId: null, isRead: false },
      data: { isRead: true },
    });
    return NextResponse.json({ success: true });
  }

  const notification = await prisma.notificationLog.findFirst({
    where: userId
      ? { id, OR: [{ userId }, { userId: null }] }
      : { id, userId: null },
  });

  if (!notification) {
    return NextResponse.json({ error: "Notification not found" }, { status: 404 });
  }

  const updated = await prisma.notificationLog.update({
    where: { id },
    data: { isRead: true },
  });

  return NextResponse.json({ notification: updated });
}
