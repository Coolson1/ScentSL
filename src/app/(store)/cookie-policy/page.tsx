"use client";

import Link from "next/link";
import { Ornament } from "@/components/store/Ornament";

export default function CookiePolicyPage() {
  function openConsentBanner() {
    if (typeof window !== "undefined") {
      window.dispatchEvent(new Event("openCookieConsent"));
    }
  }

  return (
    <div className="relative overflow-hidden bg-parchment py-16 sm:py-24 lg:py-32">
      <Ornament
        variant="sprig"
        className="pointer-events-none absolute -right-16 top-24 h-[400px] w-[300px] -scale-x-100 text-brand-gold/15"
      />
      <div className="relative mx-auto max-w-4xl px-5 sm:px-8 lg:px-12">
        <header className="border-b border-ink/15 pb-10">
          <p className="text-[10px] uppercase tracking-[0.5em] text-brand-gold">
            Legal & Governance
          </p>
          <h1 className="mt-3 font-display text-[clamp(2.5rem,5vw,4.2rem)] font-light leading-none tracking-[-0.015em] text-ink">
            Cookie Policy
          </h1>
          <p className="mt-4 font-serif text-sm italic text-ink/75">
            Effective Date: September 21, 2024 · Last Updated: September 2026
          </p>
        </header>

        <div className="prose prose-stone mt-12 space-y-10 font-serif text-base leading-relaxed text-ink/85">
          <section className="space-y-3">
            <h2 className="font-display text-2xl font-light tracking-tight text-ink">
              1. What Are Cookies?
            </h2>
            <p>
              Cookies are small text files stored on your computer or mobile device when you visit a website. They are widely used to make websites work efficiently, remember your shopping bag, and provide security.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="font-display text-2xl font-light tracking-tight text-ink">
              2. Cookies We Use
            </h2>
            <div className="space-y-4 rounded-xl border border-ink/15 bg-parchment-soft p-6">
              <div>
                <h3 className="font-display text-lg text-ink font-light uppercase tracking-wider">
                  Essential Cookies (Always Required)
                </h3>
                <p className="text-sm text-ink/80">
                  These cookies are essential to navigate the website and use its features, such as adding products to your bag, maintaining your login session, and securing checkout.
                </p>
              </div>

              <div className="border-t border-ink/10 pt-4">
                <h3 className="font-display text-lg text-ink font-light uppercase tracking-wider">
                  Functional & Preference Cookies
                </h3>
                <p className="text-sm text-ink/80">
                  These cookies allow us to remember choices you make (such as your cookie consent preferences and theme settings) to provide a more tailored experience.
                </p>
              </div>
            </div>
          </section>

          <section className="space-y-3">
            <h2 className="font-display text-2xl font-light tracking-tight text-ink">
              3. No Invasive Trackers or Cross-Site Selling
            </h2>
            <p>
              ScentSL does not place third-party advertising cookies or cross-site tracking pixels. We never sell your browsing history to data brokers.
            </p>
          </section>

          <section className="space-y-4 border-t border-ink/15 pt-8">
            <h2 className="font-display text-2xl font-light tracking-tight text-ink">
              4. Managing Your Cookie Preferences
            </h2>
            <p>
              You have full control over your cookie settings. You can modify your choices on this website at any time by clicking the button below:
            </p>

            <button
              type="button"
              onClick={openConsentBanner}
              className="inline-flex items-center gap-3 rounded-full bg-ink px-7 py-3 text-[11px] uppercase tracking-[0.32em] text-parchment transition-all duration-300 hover:bg-brand-gold hover:text-ink focus-visible:outline-2 focus-visible:outline-brand-gold"
            >
              Reopen Cookie Preference Center →
            </button>
          </section>

          <section className="space-y-3 border-t border-ink/15 pt-8">
            <h2 className="font-display text-2xl font-light tracking-tight text-ink">
              5. Questions?
            </h2>
            <p>
              If you have any questions regarding our Cookie Policy, please contact our privacy officer at{" "}
              <a href="mailto:hello@scentsl.com" className="text-brand-gold underline hover:text-ink">hello@scentsl.com</a>.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
