"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type ConsentChoice = "all" | "necessary" | null;

export function CookieConsent() {
  const [consent, setConsent] = useState<ConsentChoice>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [showPreferences, setShowPreferences] = useState(false);
  const [analyticsEnabled, setAnalyticsEnabled] = useState(true);

  useEffect(() => {
    const saved = localStorage.getItem("scentsl_cookie_consent") as ConsentChoice;
    if (!saved) {
      setIsOpen(true);
    } else {
      setConsent(saved);
    }

    const handleReopen = () => {
      setIsOpen(true);
      setShowPreferences(true);
    };

    window.addEventListener("openCookieConsent", handleReopen);
    return () => window.removeEventListener("openCookieConsent", handleReopen);
  }, []);

  function saveConsent(choice: "all" | "necessary") {
    localStorage.setItem("scentsl_cookie_consent", choice);
    setConsent(choice);
    setIsOpen(false);
    setShowPreferences(false);
  }

  if (!isOpen) return null;

  return (
    <aside
      aria-label="Cookie consent banner"
      role="dialog"
      aria-modal="true"
      className="fixed bottom-4 left-4 right-4 z-50 mx-auto max-w-xl rounded-2xl border border-ink/20 bg-parchment-soft p-6 shadow-2xl backdrop-blur-md sm:bottom-6 sm:left-6 sm:right-auto"
    >
      <div className="flex flex-col gap-4">
        <div className="flex items-start justify-between gap-4">
          <div>
            <span className="text-[10px] uppercase tracking-[0.4em] text-brand-gold">
              Privacy & Cookies
            </span>
            <h2 className="mt-1 font-display text-xl font-light text-ink">
              Your Privacy Preferences
            </h2>
          </div>
          <button
            type="button"
            onClick={() => saveConsent("necessary")}
            aria-label="Close cookie banner and accept necessary cookies only"
            className="rounded-full p-1 text-ink/50 hover:text-ink focus-visible:outline-2 focus-visible:outline-brand-gold"
          >
            ✕
          </button>
        </div>

        <p className="font-serif text-sm leading-relaxed text-ink/80">
          We use essential cookies to maintain your shopping bag and secure authentication. With your permission, we also use functional cookies to improve your experience. We never sell your data or use invasive trackers.
        </p>

        {showPreferences && (
          <div className="space-y-3 rounded-lg border border-ink/10 bg-parchment/60 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium uppercase tracking-[0.2em] text-ink">
                  Essential Cookies
                </p>
                <p className="text-[11px] text-ink/70">
                  Required for cart, auth, and order security. Cannot be disabled.
                </p>
              </div>
              <span className="text-[10px] uppercase tracking-[0.2em] text-brand-moss font-semibold">
                Always Active
              </span>
            </div>

            <div className="flex items-center justify-between border-t border-ink/10 pt-3">
              <div>
                <p className="text-xs font-medium uppercase tracking-[0.2em] text-ink">
                  Functional & Experience
                </p>
                <p className="text-[11px] text-ink/70">
                  Saves your preferred theme and currency display.
                </p>
              </div>
              <input
                type="checkbox"
                checked={analyticsEnabled}
                onChange={(e) => setAnalyticsEnabled(e.target.checked)}
                className="size-4 accent-brand-gold focus-visible:ring-2 focus-visible:ring-brand-gold"
                aria-label="Enable functional cookies"
              />
            </div>
          </div>
        )}

        <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
          <Link
            href="/cookie-policy"
            className="text-[11px] uppercase tracking-[0.28em] text-ink/70 underline-offset-4 hover:text-brand-gold hover:underline focus-visible:outline-2 focus-visible:outline-brand-gold"
          >
            Cookie Policy
          </Link>

          <div className="flex items-center gap-2">
            {!showPreferences ? (
              <button
                type="button"
                onClick={() => setShowPreferences(true)}
                className="rounded-full border border-ink/20 bg-transparent px-4 py-2 text-[10px] uppercase tracking-[0.28em] text-ink transition-colors hover:border-ink hover:text-ink focus-visible:outline-2 focus-visible:outline-brand-gold"
              >
                Customize
              </button>
            ) : (
              <button
                type="button"
                onClick={() => saveConsent(analyticsEnabled ? "all" : "necessary")}
                className="rounded-full border border-ink/20 bg-transparent px-4 py-2 text-[10px] uppercase tracking-[0.28em] text-ink transition-colors hover:border-ink hover:text-ink focus-visible:outline-2 focus-visible:outline-brand-gold"
              >
                Save Preferences
              </button>
            )}

            <button
              type="button"
              onClick={() => saveConsent("necessary")}
              className="rounded-full border border-ink/20 bg-transparent px-4 py-2 text-[10px] uppercase tracking-[0.28em] text-ink transition-colors hover:border-ink hover:text-ink focus-visible:outline-2 focus-visible:outline-brand-gold"
            >
              Necessary Only
            </button>

            <button
              type="button"
              onClick={() => saveConsent("all")}
              className="rounded-full bg-ink px-5 py-2 text-[10px] uppercase tracking-[0.28em] text-parchment transition-colors hover:bg-brand-gold hover:text-ink focus-visible:outline-2 focus-visible:outline-brand-gold"
            >
              Accept All
            </button>
          </div>
        </div>
      </div>
    </aside>
  );
}
