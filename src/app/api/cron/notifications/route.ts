import { NextResponse } from "next/server";
import {
  runCartAbandonmentJob,
  runReEngagementJob,
  runPersonalizedRecommendationsJob,
} from "@/lib/notifications/service";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const authHeader = req.headers.get("authorization");
  const secretKey = searchParams.get("key") || (authHeader ? authHeader.replace("Bearer ", "") : "");

  const expectedSecret = process.env.CRON_SECRET || "scentsl_cron_secret_dev_2026";

  if (secretKey !== expectedSecret) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const jobType = searchParams.get("job") || "all";

  const results: Record<string, unknown> = {};

  if (jobType === "all" || jobType === "cart") {
    results.cart = await runCartAbandonmentJob();
  }

  if (jobType === "all" || jobType === "reengagement") {
    results.reengagement = await runReEngagementJob();
  }

  if (jobType === "all" || jobType === "recommendations") {
    results.recommendations = await runPersonalizedRecommendationsJob();
  }

  return NextResponse.json({
    success: true,
    timestamp: new Date().toISOString(),
    results,
  });
}
