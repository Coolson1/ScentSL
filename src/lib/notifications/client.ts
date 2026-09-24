export function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

/**
 * Register service worker and subscribe browser to push notifications.
 * Works for both anonymous visitors and authenticated users.
 */
export async function requestAndSubscribePush(): Promise<{
  success: boolean;
  subscription?: PushSubscription;
  error?: string;
}> {
  if (
    typeof window === "undefined" ||
    !("serviceWorker" in navigator) ||
    !("PushManager" in window)
  ) {
    return {
      success: false,
      error: "Push notifications are not supported in this browser.",
    };
  }

  try {
    const permission = await Notification.requestPermission();
    if (permission !== "granted") {
      return { success: false, error: `Notification permission ${permission}.` };
    }

    let registration = await navigator.serviceWorker.getRegistration();
    if (!registration) {
      registration = await navigator.serviceWorker.register("/sw.js");
    }
    registration = await navigator.serviceWorker.ready;

    // Check if browser already has an active push subscription
    let subscription = await registration.pushManager.getSubscription();

    let vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
    if (!vapidPublicKey) {
      try {
        const keyRes = await fetch("/api/push/subscribe", { method: "GET" });
        if (keyRes.ok) {
          const keyData = await keyRes.json();
          vapidPublicKey = keyData.publicKey;
        }
      } catch {
        // Fallback
      }
    }

    if (!subscription && vapidPublicKey) {
      try {
        const convertedKey = urlBase64ToUint8Array(vapidPublicKey);
        subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: convertedKey as unknown as BufferSource,
        });
      } catch (subErr) {
        console.warn("[Push] pushManager.subscribe notice:", subErr);
        const subMsg = subErr instanceof Error ? subErr.message : String(subErr);
        return { success: false, error: `Push service subscription failed: ${subMsg}` };
      }
    }

    if (subscription) {
      await sendSubscriptionToBackend(subscription);
    }

    return { success: true, subscription: subscription || undefined };
  } catch (err) {
    console.error("[Push] Subscription error:", err);
    return {
      success: false,
      error: err instanceof Error ? err.message : "Failed to enable notifications.",
    };
  }
}

/**
 * Post a PushSubscription object to the backend endpoint (/api/push/subscribe).
 */
export async function sendSubscriptionToBackend(subscription: PushSubscription): Promise<boolean> {
  try {
    const subJson = subscription.toJSON();
    if (!subJson.endpoint || !subJson.keys?.p256dh || !subJson.keys?.auth) {
      return false;
    }

    const payload = {
      endpoint: subJson.endpoint,
      keys: {
        p256dh: subJson.keys.p256dh,
        auth: subJson.keys.auth,
      },
      userAgent: typeof navigator !== "undefined" ? navigator.userAgent : undefined,
    };

    const res = await fetch("/api/push/subscribe", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    return res.ok;
  } catch (err) {
    console.error("[Push] Failed to send subscription to backend:", err);
    return false;
  }
}

/**
 * Sync existing browser push subscription with backend.
 * Ensures active=true and associates current session's userId if authenticated.
 */
export async function syncPushSubscriptionWithServer(): Promise<boolean> {
  if (
    typeof window === "undefined" ||
    !("serviceWorker" in navigator) ||
    !("PushManager" in window) ||
    Notification.permission !== "granted"
  ) {
    return false;
  }

  try {
    const registration = await navigator.serviceWorker.ready;
    const subscription = await registration.pushManager.getSubscription();

    if (subscription) {
      return await sendSubscriptionToBackend(subscription);
    }
    return false;
  } catch (err) {
    console.error("[Push] Sync error:", err);
    return false;
  }
}

/**
 * Unsubscribe browser push notification.
 */
export async function unsubscribePush(): Promise<boolean> {
  if (typeof window === "undefined" || !("serviceWorker" in navigator)) return false;

  try {
    const registration = await navigator.serviceWorker.ready;
    const subscription = await registration.pushManager.getSubscription();
    if (subscription) {
      const endpoint = subscription.endpoint;
      await subscription.unsubscribe();

      await fetch("/api/push/subscribe", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ endpoint }),
      });
    }
    return true;
  } catch (err) {
    console.error("[Push] Failed to unsubscribe:", err);
    return false;
  }
}

export async function trackUserVisit() {
  if (typeof window === "undefined") return;
  try {
    await fetch("/api/notifications/track-visit", { method: "POST" });
  } catch {
    // Silent catch
  }
}
