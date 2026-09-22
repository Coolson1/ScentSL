import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const patchSchema = z.object({
  marketing: z.boolean().optional(),
  recommendations: z.boolean().optional(),
  cartReminders: z.boolean().optional(),
  reEngagement: z.boolean().optional(),
});

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = session.user.id;

  const pref = await prisma.userNotificationPreference.upsert({
    where: { userId },
    create: { userId },
    update: {},
  });

  return NextResponse.json({ preferences: pref });
}

export async function PATCH(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = session.user.id;
  const body = await req.json().catch(() => null);
  const parsed = patchSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  const updated = await prisma.userNotificationPreference.upsert({
    where: { userId },
    create: {
      userId,
      ...parsed.data,
    },
    update: parsed.data,
  });

  return NextResponse.json({ preferences: updated });
}
