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
    if (userId) {
      // Mark all notifications belonging to this specific user as read
      await prisma.notificationLog.updateMany({
        where: { userId, isRead: false },
        data: { isRead: true },
      });

      // Handle unread shared broadcast notifications by creating user-specific read copies
      const unreadGlobals = await prisma.notificationLog.findMany({
        where: { userId: null, isRead: false },
      });

      for (const globalNotif of unreadGlobals) {
        const existing = await prisma.notificationLog.findFirst({
          where: {
            userId,
            title: globalNotif.title,
            createdAt: globalNotif.createdAt,
          },
        });
        if (!existing) {
          await prisma.notificationLog.create({
            data: {
              userId,
              type: globalNotif.type,
              category: globalNotif.category,
              title: globalNotif.title,
              message: globalNotif.message,
              url: globalNotif.url,
              relatedEntityId: globalNotif.relatedEntityId,
              isRead: true,
              deliveryStatus: globalNotif.deliveryStatus,
            },
          });
        }
      }
    } else {
      // Guest fallback
      await prisma.notificationLog.updateMany({
        where: { userId: null, isRead: false },
        data: { isRead: true },
      });
    }
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

  // If this notification belongs to this specific user, mark it read
  if (notification.userId === userId) {
    const updated = await prisma.notificationLog.update({
      where: { id },
      data: { isRead: true },
    });
    return NextResponse.json({ notification: updated });
  }

  // If this is a shared global notification and user is logged in, create a user-specific read copy
  if (userId && notification.userId === null) {
    const existingCopy = await prisma.notificationLog.findFirst({
      where: {
        userId,
        title: notification.title,
        createdAt: notification.createdAt,
      },
    });

    if (existingCopy) {
      const updated = await prisma.notificationLog.update({
        where: { id: existingCopy.id },
        data: { isRead: true },
      });
      return NextResponse.json({ notification: updated });
    }

    const userCopy = await prisma.notificationLog.create({
      data: {
        userId,
        type: notification.type,
        category: notification.category,
        title: notification.title,
        message: notification.message,
        url: notification.url,
        relatedEntityId: notification.relatedEntityId,
        isRead: true,
        deliveryStatus: notification.deliveryStatus,
      },
    });
    return NextResponse.json({ notification: userCopy });
  }

  // Guest fallback
  const updated = await prisma.notificationLog.update({
    where: { id },
    data: { isRead: true },
  });

  return NextResponse.json({ notification: updated });
}

