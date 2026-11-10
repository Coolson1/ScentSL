"use client";

import { useEffect, useState, useCallback } from "react";
import { usePathname } from "next/navigation";
import Image from "next/image";
import {
  checkAndSyncPushSubscription,
  requestAndSubscribePush,
  trackUserVisit,
} from "@/lib/notifications/client";

export function NotificationOptIn() {
  const pathname = usePathname();
  const [isSubscribed, setIsSubscribed] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [permissionState, setPermissionState] = useState<NotificationPermission | "unsupported">("default");
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  const verifySubscription = useCallback(async () => {
    if (typeof window === "undefined") return;

    // Show the prompt on first visit, but respect a prior dismissal.
    try {
      const dismissed =
        localStorage.getItem("scentsl_push_opt_in_dismissed") === "true";
      const savedV3 = localStorage.getItem("scentsl_push_optin_v3");
      const hasPermission =
        "Notification" in window && Notification.permission === "granted";

      if (!savedV3 || !hasPermission) {
        setIsSubscribed(false);
        setShowModal(!dismissed);
      }
    } catch {
      setIsSubscribed(false);
      setShowModal(true);
    }

    const status = await checkAndSyncPushSubscription();
    setPermissionState(status.permission);

    if (status.subscribed) {
      setIsSubscribed(true);
      setShowModal(false);
    } else {
      setIsSubscribed(false);
      try {
        setShowModal(
          localStorage.getItem("scentsl_push_opt_in_dismissed") !== "true"
        );
      } catch {
        setShowModal(true);
      }
    }
  }, []);

  useEffect(() => {
    trackUserVisit();
    verifySubscription();
  }, [pathname, verifySubscription]);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const handleSubscribed = () => {
      setIsSubscribed(true);
      setShowModal(false);
    };

    const handleVisibility = () => {
      if (document.visibilityState === "visible") {
        verifySubscription();
      }
    };

    window.addEventListener("scentsl:push-subscribed", handleSubscribed);
    document.addEventListener("visibilitychange", handleVisibility);

    return () => {
      window.removeEventListener("scentsl:push-subscribed", handleSubscribed);
      document.removeEventListener("visibilitychange", handleVisibility);
    };
  }, [verifySubscription]);

  const handleEnable = async () => {
    setIsSubmitting(true);
    setStatusMessage(null);

    const res = await requestAndSubscribePush();
    setIsSubmitting(false);

    if (res.success) {
      setIsSuccess(true);
      setIsSubscribed(true);
      setStatusMessage("Push notifications enabled on this device!");
      setTimeout(() => {
        setShowModal(false);
        setIsSuccess(false);
      }, 1200);
    } else {
      if (typeof window !== "undefined" && "Notification" in window) {
        setPermissionState(Notification.permission);
      }
      setStatusMessage(res.error || "Could not enable push notifications. Please try again.");
    }
  };

  const handleDismiss = () => {
    try {
      localStorage.setItem("scentsl_push_opt_in_dismissed", "true");
    } catch (error) {
      console.error("[Push] Failed to save notification prompt dismissal:", error);
    }
    setShowModal(false);
  };

  if (isSubscribed && !isSuccess) {
    return null;
  }

  // If the user temporarily minimized the modal while unsubscribed, keep a persistent floating button so they can subscribe anytime
  if (!showModal) {
    return (
      <button
        type="button"
        onClick={() => {
          setStatusMessage(null);
          setShowModal(true);
        }}
        className="fixed bottom-20 right-4 sm:bottom-6 sm:right-6 z-[65] inline-flex items-center gap-2.5 rounded-full border border-brand-gold bg-ink px-4 py-2.5 text-[10px] uppercase tracking-[0.22em] text-parchment shadow-2xl transition-all hover:bg-brand-gold hover:text-ink focus-visible:outline-2 focus-visible:outline-brand-gold animate-in fade-in duration-200"
      >
        Enable Push Alerts
      </button>
    );
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="push-opt-in-title"
      className="fixed inset-0 z-[70] flex items-center justify-center bg-ink/60 p-4 backdrop-blur-xs animate-in fade-in duration-200"
    >
      <div className="relative w-full max-w-md rounded-2xl border border-brand-gold/40 bg-parchment-soft p-6 sm:p-7 shadow-2xl">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="relative overflow-hidden rounded-full border border-brand-gold/50 shadow-xs shrink-0">
              <Image
                src="/scentsl.jpeg"
                alt="ScentSL Logo"
                width={40}
                height={40}
                className="size-10 rounded-full object-cover"
              />
            </div>
            <div>
              <span className="inline-block rounded-full bg-brand-gold/15 px-2.5 py-0.5 text-[9px] uppercase tracking-[0.25em] text-brand-gold font-medium">
                Maison ScentSL
              </span>
              <h4
                id="push-opt-in-title"
                className="mt-1 font-display text-lg font-medium text-ink"
              >
                Enable Push Notifications
              </h4>
            </div>
          </div>

          <button
            type="button"
            onClick={handleDismiss}
            className="rounded-full p-1 text-xs text-ink/45 transition-colors hover:text-ink"
            aria-label="Minimize notification prompt"
          >
            ✕
          </button>
        </div>

        <p className="mt-3.5 font-serif text-sm leading-relaxed text-ink/80">
          Subscribe to receive instant push notifications on your device for order confirmations, payment updates, delivery tracking, and new fragrance arrivals.
        </p>

        {permissionState === "denied" && (
          <div className="mt-3 rounded-xl border border-amber-600/30 bg-amber-500/10 p-3 text-xs leading-relaxed text-ink">
            Notifications are currently blocked in your browser for this site. Tap the lock or settings icon in your browser address bar, set <strong>Notifications</strong> to <strong>Allow</strong>, then tap the button below.
          </div>
        )}

        {statusMessage && (
          <p
            className={`mt-3 text-xs font-medium italic ${
              isSuccess ? "text-emerald-700" : "text-brand-gold"
            }`}
          >
            {statusMessage}
          </p>
        )}

        <div className="mt-5 flex flex-col sm:flex-row items-center gap-2.5">
          <button
            type="button"
            onClick={handleEnable}
            disabled={isSubmitting || isSuccess}
            className="inline-flex h-11 w-full flex-1 items-center justify-center rounded-full bg-ink px-5 text-[10px] uppercase tracking-[0.22em] font-medium text-parchment shadow-sm transition-all hover:bg-brand-gold hover:text-ink disabled:opacity-50"
          >
            {isSubmitting
              ? "Subscribing..."
              : isSuccess
              ? "Subscribed!"
              : "Allow Push Notifications"}
          </button>
        </div>
      </div>
    </div>
  );
}
