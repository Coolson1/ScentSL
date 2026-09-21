import type { Metadata } from "next";
import Link from "next/link";
import { Ornament } from "@/components/store/Ornament";

export const metadata: Metadata = {
  title: "Refund & Return Policy — ScentSL Maison",
  description:
    "Read ScentSL transparent 14-day return and refund policy for hand-blended luxury fragrances.",
};

export default function RefundPolicyPage() {
  return (
    <div className="relative overflow-hidden bg-parchment py-16 sm:py-24 lg:py-32">
      <Ornament
        variant="sprig"
        className="pointer-events-none absolute -left-16 top-24 h-[400px] w-[300px] text-brand-gold/15"
      />
      <div className="relative mx-auto max-w-4xl px-5 sm:px-8 lg:px-12">
        <header className="border-b border-ink/15 pb-10">
          <p className="text-[10px] uppercase tracking-[0.5em] text-brand-gold">
            Customer Care & Guarantee
          </p>
          <h1 className="mt-3 font-display text-[clamp(2.5rem,5vw,4.2rem)] font-light leading-none tracking-[-0.015em] text-ink">
            Refund & Return Policy
          </h1>
          <p className="mt-4 font-serif text-sm italic text-ink/75">
            Effective Date: September 21, 2024 · Last Updated: September 2026
          </p>
        </header>

        <div className="prose prose-stone mt-12 space-y-10 font-serif text-base leading-relaxed text-ink/85">
          <section className="space-y-3">
            <h2 className="font-display text-2xl font-light tracking-tight text-ink">
              1. Our Guarantee
            </h2>
            <p>
              At ScentSL, every bottle is hand-blended and inspected before dispatch. We want you to be completely satisfied with your fragrance experience.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="font-display text-2xl font-light tracking-tight text-ink">
              2. 14-Day Return Policy
            </h2>
            <p>
              You may return any <strong>unopened bottle in its original, sealed packaging</strong> within 14 calendar days of receiving your order for a full refund or exchange.
            </p>
            <ul className="list-disc space-y-2 pl-6 text-ink/80">
              <li>Item must be unused, un-sprayed, and in original condition.</li>
              <li>Protective cellophane and seals must remain intact.</li>
              <li>Proof of purchase (order number or email confirmation) is required.</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="font-display text-2xl font-light tracking-tight text-ink">
              3. Damaged or Defective Items
            </h2>
            <p>
              If your bottle arrives damaged, leaking, or with a defective atomizer, please contact us within 48 hours of delivery at <a href="mailto:hello@scentsl.com" className="text-brand-gold underline hover:text-ink">hello@scentsl.com</a> with a photo of the damaged package. We will immediately ship a replacement bottle at zero cost to you or process a full refund.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="font-display text-2xl font-light tracking-tight text-ink">
              4. Refund Processing
            </h2>
            <p>
              Once your returned item is received and inspected at our Freetown atelier, refunds are processed within 3–5 business days back to your original payment method (Monime / Mobile Money / Bank). You will receive an email confirmation once the refund is issued.
            </p>
          </section>

          <section className="space-y-3 border-t border-ink/15 pt-8">
            <h2 className="font-display text-2xl font-light tracking-tight text-ink">
              5. How to Initiate a Return
            </h2>
            <p>
              To initiate a return, email us at <a href="mailto:hello@scentsl.com" className="text-brand-gold underline hover:text-ink">hello@scentsl.com</a> with your order number. Our team will guide you through the return process.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
