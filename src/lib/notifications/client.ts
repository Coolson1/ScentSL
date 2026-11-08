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

async function resolveVapidPublicKey(): Promise<string> {
  let vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || "";
  if (!vapidPublicKey) {
    try {
      const keyRes = await fetch("/api/push/subscribe", {
        method: "GET",
        cache: "no-store",
      });
      if (keyRes.ok) {
        const keyData = await keyRes.json();
        vapidPublicKey = keyData.publicKey || "";
      }
    } catch {
      // Fallback
    }
  }
  return vapidPublicKey.trim();
}

async function ensureServiceWorkerRegistration(): Promise<ServiceWorkerRegistration> {
  let registration = await navigator.serviceWorker.getRegistration("/");
  if (!registration) {
    registration = await navigator.serviceWorker.getRegistration();
  }
  if (!registration) {
    registration = await navigator.serviceWorker.register("/sw.js", {
      scope: "/",
      updateViaCache: "none",
    });
  }
  return await navigator.serviceWorker.ready;
}

async function getExistingBrowserSubscriptionFast(): Promise<PushSubscription | null> {
  try {
    const subPromise = (async () => {
      let reg = await navigator.serviceWorker.getRegistration("/");
      if (!reg) {
        reg = await navigator.serviceWorker.getRegistration();
      }
      if (!reg) return null;
      return await reg.pushManager.getSubscription();
    })();

    const timeoutPromise = new Promise<null>((resolve) =>
      setTimeout(() => resolve(null), 1500)
    );

    return await Promise.race([subPromise, timeoutPromise]);
  } catch {
    return null;
  }
}

async function ensureBrowserSubscription(
  registration: ServiceWorkerRegistration
): Promise<{ subscription: PushSubscription | null; error?: string }> {
  let subscription = await registration.pushManager.getSubscription();
  if (subscription) {
    return { subscription };
  }

  const vapidPublicKey = await resolveVapidPublicKey();
  if (!vapidPublicKey) {
    return {
      subscription: null,
      error: "Push configuration key is missing on the server.",
    };
  }

  const convertedKey = urlBase64ToUint8Array(vapidPublicKey);

  try {
    subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: convertedKey as unknown as BufferSource,
    });
    return { subscription };
  } catch (subErr) {
    // Handle case where a stale subscription with a different applicationServerKey exists
    try {
      const existing = await registration.pushManager.getSubscription();
      if (existing) {
        await existing.unsubscribe();
      }
      subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: convertedKey as unknown as BufferSource,
      });
      return { subscription };
    } catch (retryErr) {
      console.warn("[Push] pushManager.subscribe notice:", subErr, retryErr);
      const subMsg = subErr instanceof Error ? subErr.message : String(subErr);
      return {
        subscription: null,
        error: `Push service subscription failed: ${subMsg}`,
      };
    }
  }
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
    !("Notification" in window) ||
    !("serviceWorker" in navigator) ||
    !("PushManager" in window)
  ) {
    return {
      success: false,
      error:
        "To enable push notifications on iPhone/iPad, tap Share and select 'Add to Home Screen', then open ScentSL from your Home Screen.",
    };
  }

  try {
    let permission = Notification.permission;
    if (permission !== "granted") {
      permission = await Notification.requestPermission();
    }
    if (permission !== "granted") {
      return {
        success: false,
        error:
          permission === "denied"
            ? "Notifications are blocked in your browser settings. Please allow notifications for this site in your browser address bar and try again."
            : `Notification permission ${permission}.`,
      };
    }

    const registration = await ensureServiceWorkerRegistration();
    const { subscription, error } = await ensureBrowserSubscription(registration);

    if (!subscription) {
      return {
        success: false,
        error: error || "Could not create a push subscription on this device.",
      };
    }

    const saved = await sendSubscriptionToBackend(subscription);
    if (!saved) {
      return {
        success: false,
        error: "Failed to register your notification subscription with the server.",
      };
    }

    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("scentsl:push-subscribed"));
    }

    return { success: true, subscription };
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
      cache: "no-store",
    });

    if (!res.ok) return false;

    const data = await res.json().catch(() => ({}));
    try {
      const userKey = data?.userId || "guest";
      localStorage.setItem("scentsl_push_optin_v3", subJson.endpoint);
      localStorage.setItem(`scentsl_push_optin_v3_${userKey}`, subJson.endpoint);
    } catch {
      // Ignore localStorage errors
    }

    return true;
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
    !("Notification" in window) ||
    !("serviceWorker" in navigator) ||
    !("PushManager" in window) ||
    Notification.permission !== "granted"
  ) {
    return false;
  }

  try {
    const registration = await ensureServiceWorkerRegistration();
    const { subscription } = await ensureBrowserSubscription(registration);

    if (subscription) {
      const ok = await sendSubscriptionToBackend(subscription);
      if (ok && typeof window !== "undefined") {
        window.dispatchEvent(new CustomEvent("scentsl:push-subscribed"));
      }
      return ok;
    }
    return false;
  } catch (err) {
    console.error("[Push] Sync error:", err);
    return false;
  }
}

/**
 * Check if the current user & browser are actively subscribed in both the browser AND the database,
 * AND that the current user session has explicitly confirmed push notifications on this device.
 */
export async function checkAndSyncPushSubscription(): Promise<{
  supported: boolean;
  permission: NotificationPermission | "unsupported";
  subscribed: boolean;
}> {
  if (typeof window === "undefined") {
    return { supported: false, permission: "unsupported", subscribed: false };
  }

  const supported =
    "Notification" in window &&
    "serviceWorker" in navigator &&
    "PushManager" in window;

  if (!supported) {
    return { supported: false, permission: "unsupported", subscribed: false };
  }

  const permission = Notification.permission;
  if (permission !== "granted") {
    try {
      localStorage.removeItem("scentsl_push_optin_v3");
    } catch {
      // Ignore storage errors
    }
    return { supported: true, permission, subscribed: false };
  }

  try {
    const existing = await getExistingBrowserSubscriptionFast();
    if (!existing) {
      try {
        localStorage.removeItem("scentsl_push_optin_v3");
      } catch {
        // Ignore storage errors
      }
      return { supported: true, permission, subscribed: false };
    }

    const res = await fetch(
      `/api/push/subscribe?endpoint=${encodeURIComponent(existing.endpoint)}`,
      { method: "GET", cache: "no-store" }
    );
    if (!res.ok) {
      return { supported: true, permission, subscribed: false };
    }

    const data = await res.json();
    const userKey = data?.userId || "guest";
    let verifiedEndpoint: string | null = null;
    try {
      verifiedEndpoint = localStorage.getItem(`scentsl_push_optin_v3_${userKey}`);
    } catch {
      // Ignore storage errors
    }

    const isConfirmedForUser =
      Boolean(data.subscribed) && verifiedEndpoint === existing.endpoint;

    if (!isConfirmedForUser) {
      try {
        localStorage.removeItem("scentsl_push_optin_v3");
      } catch {
        // Ignore storage errors
      }
    }

    return {
      supported: true,
      permission,
      subscribed: isConfirmedForUser,
    };
  } catch {
    return { supported: true, permission, subscribed: false };
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
    try {
      localStorage.removeItem("scentsl_push_optin_v3");
      Object.keys(localStorage).forEach((key) => {
        if (
          key.startsWith("scentsl_push_verified_") ||
          key.startsWith("scentsl_push_optin_v3_")
        ) {
          localStorage.removeItem(key);
        }
      });
    } catch {
      // Ignore storage errors
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
