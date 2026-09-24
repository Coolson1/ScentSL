"use client";

import { useEffect, useState } from "react";
import { requestAndSubscribePush, unsubscribePush } from "@/lib/notifications/client";

type Preferences = {
  marketing: boolean;
  recommendations: boolean;
  cartReminders: boolean;
  reEngagement: boolean;
};

export function NotificationSettings() {
  const [isPushSupported, setIsPushSupported] = useState(true);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isTogglingPush, setIsTogglingPush] = useState(false);
  const [preferences, setPreferences] = useState<Preferences>({
    marketing: true,
    recommendations: true,
    cartReminders: true,
    reEngagement: true,
  });
  const [isLoadingPref, setIsLoadingPref] = useState(true);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window === "undefined" || !("serviceWorker" in navigator) || !("PushManager" in window)) {
      setIsPushSupported(false);
      return;
    }

    navigator.serviceWorker.ready.then((reg) => {
      reg.pushManager.getSubscription().then((sub) => {
        setIsSubscribed(!!sub);
      });
    });

    fetchPreferences();
  }, []);

  const fetchPreferences = async () => {
    try {
      const res = await fetch("/api/notifications/preferences");
      if (res.ok) {
        const data = await res.json();
        if (data.preferences) {
          setPreferences({
            marketing: data.preferences.marketing,
            recommendations: data.preferences.recommendations,
            cartReminders: data.preferences.cartReminders,
            reEngagement: data.preferences.reEngagement,
          });
        }
      }
    } catch {
      // Silent catch
    } finally {
      setIsLoadingPref(false);
    }
  };

  const handleToggleDevicePush = async () => {
    setIsTogglingPush(true);
    setStatusMessage(null);

    if (isSubscribed) {
      const success = await unsubscribePush();
      if (success) {
        setIsSubscribed(false);
        setStatusMessage("Push notifications disabled for this device.");
      } else {
        setStatusMessage("Failed to disable push notifications.");
      }
    } else {
      const res = await requestAndSubscribePush();
      if (res.success) {
        setIsSubscribed(true);
        setStatusMessage("Push notifications enabled on this device! ✨");
      } else {
        setStatusMessage(res.error || "Permission denied or failed to enable.");
      }
    }
    setIsTogglingPush(false);
  };

  const handlePrefChange = async (key: keyof Preferences, value: boolean) => {
    const updated = { ...preferences, [key]: value };
    setPreferences(updated);

    try {
      await fetch("/api/notifications/preferences", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ [key]: value }),
      });
    } catch {
      setStatusMessage("Failed to update preferences on server.");
    }
  };

  if (!isPushSupported) {
    return (
      <div className="rounded-2xl border border-ink/15 bg-parchment-soft p-6 shadow-sm">
        <h3 className="font-display text-lg font-medium text-ink">Web Push Notifications</h3>
        <p className="mt-2 font-serif text-sm text-ink/65">
          Push notifications are not supported by your current browser or device.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-ink/15 bg-parchment-soft p-4 sm:p-8 shadow-sm space-y-6 sm:space-y-8">
      <div>
        <span className="text-[10px] uppercase tracking-[0.3em] text-brand-gold font-medium">
          Maison ScentSL
        </span>
        <h3 className="mt-1 font-display text-xl font-light text-ink">
          Notification Preferences
        </h3>
        <p className="mt-1 font-serif text-xs sm:text-sm text-ink/75">
          Manage how and when you receive updates regarding your orders, bag reminders, and new releases.
        </p>
      </div>

      {statusMessage && (
        <div className="rounded-xl border border-brand-gold/30 bg-brand-gold/10 p-3 text-xs font-medium text-ink">
          {statusMessage}
        </div>
      )}

      {/* Device Subscription Toggle */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-xl border border-ink/10 bg-parchment/60 p-4">
        <div>
          <h4 className="font-display text-sm font-medium text-ink">Browser Push Permission</h4>
          <p className="font-serif text-xs text-ink/65">
            {isSubscribed
              ? "This browser is currently registered for ScentSL Web Push notifications."
              : "Enable Web Push on this browser to get instant alerts."}
          </p>
        </div>
        <button
          onClick={handleToggleDevicePush}
          disabled={isTogglingPush}
          className={`w-full sm:w-auto shrink-0 rounded-full px-5 py-2.5 text-[10px] uppercase tracking-[0.2em] transition-all font-medium text-center ${
            isSubscribed
              ? "border border-ink/20 bg-transparent text-ink hover:border-brand-gold hover:text-brand-gold"
              : "bg-ink text-parchment hover:bg-brand-gold hover:text-ink shadow-xs"
          }`}
        >
          {isTogglingPush
            ? "Updating..."
            : isSubscribed
            ? "Disable on this Device"
            : "Enable Web Push"}
        </button>
      </div>

      {/* Optional Notification Categories */}
      <div className="space-y-4">
        <h4 className="font-display text-sm font-semibold uppercase tracking-wider text-ink border-b border-ink/10 pb-2">
          Notification Categories
        </h4>

        {/* Essential Category (always on) */}
        <div className="flex items-start justify-between gap-4 py-2 border-b border-ink/5">
          <div>
            <span className="inline-block rounded-full bg-emerald-500/10 px-2 py-0.5 text-[9px] uppercase tracking-widest text-emerald-600 font-semibold mb-1">
              Essential
            </span>
            <h5 className="font-display text-sm font-medium text-ink">Order & Payment Updates</h5>
            <p className="font-serif text-xs text-ink/65">
              Order confirmations, payment statuses, dispatch, out-for-delivery, and delivery tracking notifications.
            </p>
          </div>
          <span className="text-xs font-semibold text-emerald-600 shrink-0">Always Active</span>
        </div>

        {/* Marketing / Product Announcements */}
        <div className="flex items-start justify-between gap-4 py-2 border-b border-ink/5">
          <div>
            <h5 className="font-display text-sm font-medium text-ink">New Fragrances & Collections</h5>
            <p className="font-serif text-xs text-ink/65">
              Be the first to know when luxury new fragrances, restocks, or seasonal collections drop.
            </p>
          </div>
          <input
            type="checkbox"
            checked={preferences.marketing}
            onChange={(e) => handlePrefChange("marketing", e.target.checked)}
            disabled={isLoadingPref}
            className="size-5 rounded border-ink/30 text-brand-gold focus:ring-brand-gold cursor-pointer"
          />
        </div>

        {/* Personalized Recommendations */}
        <div className="flex items-start justify-between gap-4 py-2 border-b border-ink/5">
          <div>
            <h5 className="font-display text-sm font-medium text-ink">Personalized Recommendations</h5>
            <p className="font-serif text-xs text-ink/65">
              Curated scent recommendations tailored to your wishlist items and previous purchases.
            </p>
          </div>
          <input
            type="checkbox"
            checked={preferences.recommendations}
            onChange={(e) => handlePrefChange("recommendations", e.target.checked)}
            disabled={isLoadingPref}
            className="size-5 rounded border-ink/30 text-brand-gold focus:ring-brand-gold cursor-pointer"
          />
        </div>

        {/* Cart Reminders */}
        <div className="flex items-start justify-between gap-4 py-2 border-b border-ink/5">
          <div>
            <h5 className="font-display text-sm font-medium text-ink">Bag & Cart Reminders</h5>
            <p className="font-serif text-xs text-ink/65">
              Gentle reminders if you leave items behind in your shopping bag.
            </p>
          </div>
          <input
            type="checkbox"
            checked={preferences.cartReminders}
            onChange={(e) => handlePrefChange("cartReminders", e.target.checked)}
            disabled={isLoadingPref}
            className="size-5 rounded border-ink/30 text-brand-gold focus:ring-brand-gold cursor-pointer"
          />
        </div>

        {/* Re-engagement */}
        <div className="flex items-start justify-between gap-4 py-2">
          <div>
            <h5 className="font-display text-sm font-medium text-ink">Re-engagement Reminders</h5>
            <p className="font-serif text-xs text-ink/65">
              Occasional reminders when you haven't visited ScentSL in a while.
            </p>
          </div>
          <input
            type="checkbox"
            checked={preferences.reEngagement}
            onChange={(e) => handlePrefChange("reEngagement", e.target.checked)}
            disabled={isLoadingPref}
            className="size-5 rounded border-ink/30 text-brand-gold focus:ring-brand-gold cursor-pointer"
          />
        </div>
      </div>
    </div>
  );
}
