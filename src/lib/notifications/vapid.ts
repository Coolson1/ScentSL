import webpush from "web-push";
import { prisma } from "@/lib/prisma";

// Ensure VAPID details are configured from environment variables
const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || "";
const privateKey = process.env.VAPID_PRIVATE_KEY || "";
const subject = process.env.VAPID_SUBJECT || "mailto:support@scentsl.com";

if (publicKey && privateKey) {
  webpush.setVapidDetails(subject, publicKey, privateKey);
}

export type PushNotificationPayload = {
  title: string;
  message: string;
  url?: string;
  icon?: string;
  badge?: string;
  tag?: string;
  data?: Record<string, unknown>;
};

/**
 * Send a web push notification to a single PushSubscription record.
 * Automatically deletes expired/invalid (404/410) endpoints from the database.
 */
export async function sendWebPush(
  subscription: { id: string; endpoint: string; p256dh: string; auth: string },
  payload: PushNotificationPayload
): Promise<boolean> {
  if (!publicKey || !privateKey) {
    console.warn("[WebPush] VAPID keys not configured. Skipping send.");
    return false;
  }

  const pushSubscription = {
    endpoint: subscription.endpoint,
    keys: {
      p256dh: subscription.p256dh,
      auth: subscription.auth,
    },
  };

  const payloadString = JSON.stringify({
    title: payload.title,
    body: payload.message,
    icon: payload.icon || "/icons/icon-192.png",
    badge: payload.badge || "/icons/icon-192.png",
    tag: payload.tag,
    data: {
      url: payload.url || "/",
      ...payload.data,
    },
  });

  try {
    await webpush.sendNotification(pushSubscription, payloadString, {
      TTL: 60 * 60 * 24, // 24 hours
    });
    return true;
  } catch (err: unknown) {
    const error = err as { statusCode?: number; endpoint?: string };
    // 404 Not Found or 410 Gone means the subscription is no longer valid
    if (error.statusCode === 404 || error.statusCode === 410) {
      console.log(`[WebPush] Subscription expired (${error.statusCode}). Deactivating subscription ${subscription.id}`);
      try {
        await prisma.pushSubscription.update({
          where: { id: subscription.id },
          data: { active: false },
        });
      } catch (dbErr) {
        console.error("[WebPush] Failed to mark subscription inactive:", dbErr);
      }
    } else {
      console.error("[WebPush] Error sending push notification:", err);
    }
    return false;
  }
}
