"use client";

import { useEffect, useState } from "react";
import { requestAndSubscribePush, trackUserVisit } from "@/lib/notifications/client";

export function NotificationOptIn() {
  const [showPrompt, setShowPrompt] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  useEffect(() => {
    // Automatically track user visit for re-engagement checks
    trackUserVisit();

    if (typeof window === "undefined" || !("Notification" in window)) return;

    // Check if user has already granted permission or dismissed prompt
    if (Notification.permission === "granted" || Notification.permission === "denied") {
      return;
    }

    const dismissed = localStorage.getItem("scentsl_push_opt_in_dismissed");
    if (!dismissed) {
      // Show prompt smoothly after 3 seconds
      const timer = setTimeout(() => {
        setShowPrompt(true);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleEnable = async () => {
    setIsSubmitting(true);
    setStatusMessage(null);

    const res = await requestAndSubscribePush();
    setIsSubmitting(false);

    if (res.success) {
      setStatusMessage("Notifications enabled! ✨");
      setTimeout(() => setShowPrompt(false), 2000);
    } else {
      setStatusMessage(res.error || "Could not enable notifications.");
    }
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    localStorage.setItem("scentsl_push_opt_in_dismissed", "true");
  };

  if (!showPrompt) return null;

  return (
    <div className="fixed bottom-4 inset-x-4 sm:inset-x-auto sm:bottom-5 sm:right-5 z-50 sm:max-w-sm rounded-2xl border border-brand-gold/30 bg-parchment-soft/95 p-4 sm:p-5 shadow-2xl backdrop-blur-md animate-in slide-in-from-bottom-5 duration-300">
      <div className="flex items-start justify-between gap-3">
        <div>
          <span className="inline-block rounded-full bg-brand-gold/15 px-2.5 py-0.5 text-[9px] uppercase tracking-[0.25em] text-brand-gold font-medium">
            Maison ScentSL
          </span>
          <h4 className="mt-1 font-display text-base font-medium text-ink">
            Stay Updated
          </h4>
        </div>
        <button
          onClick={handleDismiss}
          className="text-ink/40 hover:text-ink text-xs transition-colors p-1"
          aria-label="Close"
        >
          ✕
        </button>
      </div>

      <p className="mt-2 font-serif text-xs leading-relaxed text-ink/75">
        Receive real-time updates for your order status, payment confirmations, back-in-stock alerts, and exclusive new fragrance releases.
      </p>

      {statusMessage && (
        <p className="mt-2 text-xs font-medium text-brand-gold italic">
          {statusMessage}
        </p>
      )}

      <div className="mt-4 flex items-center gap-3">
        <button
          onClick={handleEnable}
          disabled={isSubmitting}
          className="flex-1 rounded-full bg-ink px-4 py-2.5 text-[10px] uppercase tracking-[0.22em] text-parchment transition-all hover:bg-brand-gold hover:text-ink disabled:opacity-50 font-medium shadow-xs"
        >
          {isSubmitting ? "Enabling..." : "Enable Notifications"}
        </button>
        <button
          onClick={handleDismiss}
          className="px-3 py-2 text-[10px] uppercase tracking-[0.2em] text-ink/60 hover:text-ink transition-colors"
        >
          Maybe Later
        </button>
      </div>
    </div>
  );
}
