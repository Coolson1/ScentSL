import webpush from "web-push";
import { prisma } from "@/lib/prisma";

// Default VAPID details fallback
const defaultPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || "";
const defaultPrivateKey = process.env.VAPID_PRIVATE_KEY || "";
const defaultSubject = process.env.VAPID_SUBJECT || "mailto:support@scentsl.com";

if (defaultPublicKey && defaultPrivateKey) {
  try {
    webpush.setVapidDetails(defaultSubject, defaultPublicKey, defaultPrivateKey);
  } catch (err) {
    console.warn("[WebPush] Initial VAPID setup notice:", err);
  }
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
 * Automatically deactivates expired/invalid (404/410) endpoints from the database.
 */
export async function sendWebPush(
  subscription: { id: string; endpoint: string; p256dh: string; auth: string },
  payload: PushNotificationPayload
): Promise<boolean> {
  const currentPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || defaultPublicKey;
  const currentPrivateKey = process.env.VAPID_PRIVATE_KEY || defaultPrivateKey;
  const currentSubject = process.env.VAPID_SUBJECT || defaultSubject;

  if (!currentPublicKey || !currentPrivateKey) {
    console.warn("[WebPush] VAPID keys missing in environment. Skipping send.");
    return false;
  }

  try {
    webpush.setVapidDetails(currentSubject, currentPublicKey, currentPrivateKey);
  } catch (setErr) {
    console.warn("[WebPush] setVapidDetails notice:", setErr);
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
