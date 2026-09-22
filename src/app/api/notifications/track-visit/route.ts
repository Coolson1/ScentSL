import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ success: true, guest: true });
  }

  const userId = session.user.id;
  const now = new Date();

  await prisma.userActivityTracker.upsert({
    where: { userId },
    create: {
      userId,
      lastVisitedAt: now,
      reEngagementCount: 0, // Reset re-engagement count upon visit
    },
    update: {
      lastVisitedAt: now,
      reEngagementCount: 0,
    },
  });

  return NextResponse.json({ success: true });
}
