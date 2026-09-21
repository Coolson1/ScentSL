import type { Metadata } from "next";
import Link from "next/link";
import { Ornament } from "@/components/store/Ornament";

export const metadata: Metadata = {
  title: "Terms of Service — ScentSL Maison",
  description:
    "Review the terms and conditions governing purchases, delivery, transparent pricing, and use of ScentSL website.",
};

export default function TermsPage() {
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
            Terms of Service
          </h1>
          <p className="mt-4 font-serif text-sm italic text-ink/75">
            Effective Date: September 21, 2024 · Last Updated: September 2026
          </p>
        </header>

        <div className="prose prose-stone mt-12 space-y-10 font-serif text-base leading-relaxed text-ink/85">
          <section className="space-y-3">
            <h2 className="font-display text-2xl font-light tracking-tight text-ink">
              1. Acceptance of Terms
            </h2>
            <p>
              Welcome to ScentSL Maison Ltd. (&ldquo;ScentSL&rdquo;). By accessing our website, browsing our fragrance archive, creating an account, or placing an order, you agree to be bound by these Terms of Service. If you do not agree, please do not use our services.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="font-display text-2xl font-light tracking-tight text-ink">
              2. Absolute Transparency & Zero Dark Patterns
            </h2>
            <p>
              We firmly reject manipulative design tactics (&ldquo;dark patterns&rdquo;). ScentSL commits to:
            </p>
            <ul className="list-disc space-y-2 pl-6 text-ink/80">
              <li><strong>No Hidden Fees:</strong> All item prices, applicable local taxes, and delivery zone fees are clearly itemized in your bag and at checkout before payment. We never add unexpected surcharges or mandatory tips at checkout.</li>
              <li><strong>No Deceptive Urgency:</strong> Stock counts displayed reflect real inventory. We do not use fake countdown timers, artificial low-stock warnings, or phantom buyer popups.</li>
              <li><strong>Clear Terms:</strong> Account creation and subscription features are voluntary and easy to modify or cancel.</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="font-display text-2xl font-light tracking-tight text-ink">
              3. Orders, Pricing & Delivery
            </h2>
            <p>
              All prices are quoted in Sierra Leonean Leones (SLE). Orders are confirmed upon receipt of valid payment authorization via Monime. Delivery fees are determined by your chosen delivery zone in Sierra Leone. Delivery timelines are estimates provided in good faith.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="font-display text-2xl font-light tracking-tight text-ink">
              4. Honest Product Descriptions & Fragrance Perception
            </h2>
            <p>
              Fragrance descriptions, fragrance notes, and longevity references represent artistic olfactory interpretations. Scent development varies based on skin chemistry, ambient temperature, and personal sensitivity. ScentSL makes no therapeutic, medical, or psychological claims regarding its perfume blends.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="font-display text-2xl font-light tracking-tight text-ink">
              5. Intellectual Property & Asset Licensing
            </h2>
            <p>
              All trademarks, product designs, brand assets, photography, and literature on ScentSL are owned by ScentSL Maison Ltd. Web typography is licensed from official Google Font repositories. All product imagery is proprietary or licensed for commercial distribution.
            </p>
          </section>

          <section className="space-y-3 border-t border-ink/15 pt-8">
            <h2 className="font-display text-2xl font-light tracking-tight text-ink">
              6. Contact Us
            </h2>
            <p>
              If you have questions regarding these Terms of Service, please contact our team at{" "}
              <a href="mailto:hello@scentsl.com" className="text-brand-gold underline hover:text-ink">hello@scentsl.com</a>.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
