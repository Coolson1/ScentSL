import type { Metadata } from "next";
import Link from "next/link";
import { Ornament } from "@/components/store/Ornament";

export const metadata: Metadata = {
  title: "Privacy Policy — ScentSL Maison",
  description:
    "Learn how ScentSL collects, protects, and respects your personal data in compliance with GDPR, CCPA, and Sierra Leone privacy standards.",
};

export default function PrivacyPolicyPage() {
  return (
    <div className="relative overflow-hidden bg-parchment py-16 sm:py-24 lg:py-32">
      <Ornament
        variant="sprig"
        className="pointer-events-none absolute -left-16 top-24 h-[400px] w-[300px] text-brand-gold/15"
      />
      <div className="relative mx-auto max-w-4xl px-5 sm:px-8 lg:px-12">
        <header className="border-b border-ink/15 pb-10">
          <p className="text-[10px] uppercase tracking-[0.5em] text-brand-gold">
            Legal & Governance
          </p>
          <h1 className="mt-3 font-display text-[clamp(2.5rem,5vw,4.2rem)] font-light leading-none tracking-[-0.015em] text-ink">
            Privacy Policy
          </h1>
          <p className="mt-4 font-serif text-sm italic text-ink/75">
            Effective Date: September 21, 2024 · Last Updated: September 2026
          </p>
        </header>

        <div className="prose prose-stone mt-12 space-y-10 font-serif text-base leading-relaxed text-ink/85">
          <section className="space-y-3">
            <h2 className="font-display text-2xl font-light tracking-tight text-ink">
              1. Introduction & Governance
            </h2>
            <p>
              ScentSL Maison Ltd. (&ldquo;ScentSL,&rdquo; &ldquo;we,&rdquo; &ldquo;our,&rdquo; or &ldquo;us&rdquo;) operates the fragrance archive website located at scentsl.com. We are committed to processing your personal data with transparency, integrity, and absolute respect for your rights.
            </p>
            <p>
              This Privacy Policy explains how we collect, store, use, and protect your personal information when you visit our store, purchase our fragrances, or communicate with our maison.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="font-display text-2xl font-light tracking-tight text-ink">
              2. Data We Collect (No Unnecessary Data)
            </h2>
            <p>
              We adhere strictly to data minimization principles. We only collect information strictly required to fulfill your orders and deliver exceptional customer service:
            </p>
            <ul className="list-disc space-y-2 pl-6 text-ink/80">
              <li><strong>Contact & Identification:</strong> Full name, email address, phone number.</li>
              <li><strong>Delivery Information:</strong> Physical delivery address, city, and selected delivery zone in Sierra Leone.</li>
              <li><strong>Account Credentials:</strong> Hashed passwords for direct account registration or secure OAuth tokens when signing in with Google.</li>
              <li><strong>Transaction & Order History:</strong> Products ordered, payment confirmations, and delivery fulfillment status. Payment processing is safely handled through Monime; we never store raw credit card or mobile money PINs on our servers.</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="font-display text-2xl font-light tracking-tight text-ink">
              3. Age Requirement & Children&apos;s Privacy (COPPA & GDPR Notice)
            </h2>
            <p>
              Our products, content, and services are strictly intended for individuals aged <strong>18 and older</strong> (or 16+ with consent from a parent or legal guardian). ScentSL does not knowingly collect, solicit, or market to children under the age of 16. If we become aware that personal data of a minor under 16 has been collected without verified parental consent, we will delete it immediately.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="font-display text-2xl font-light tracking-tight text-ink">
              4. Third-Party Services & Audited SDKs
            </h2>
            <p>
              We do not sell, rent, or trade your personal data to third parties. We engage only trusted service providers bound by strict confidentiality and data protection agreements:
            </p>
            <ul className="list-disc space-y-2 pl-6 text-ink/80">
              <li><strong>Authentication:</strong> Google OAuth (Auth.js) for secure social authentication.</li>
              <li><strong>Payment Gateway:</strong> Monime API for local and mobile payments.</li>
              <li><strong>Media Hosting:</strong> Cloudinary for high-resolution product photography delivery.</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="font-display text-2xl font-light tracking-tight text-ink">
              5. Your Privacy Rights & Data Deletion
            </h2>
            <p>
              Regardless of your jurisdiction, ScentSL guarantees the following rights:
            </p>
            <ul className="list-disc space-y-2 pl-6 text-ink/80">
              <li>Right to access and review personal data held by ScentSL.</li>
              <li>Right to rectify inaccurate or incomplete information.</li>
              <li>Right to request full account erasure (&ldquo;Right to be Forgotten&rdquo;).</li>
              <li>Right to unsubscribe from newsletter correspondence at any time via the link included in all our letters.</li>
            </ul>
            <p className="mt-4">
              To submit a data deletion request, please visit our dedicated{" "}
              <Link href="/data-deletion" className="text-brand-gold underline hover:text-ink">
                Data Deletion Request Page
              </Link>{" "}
              or email us directly at <a href="mailto:hello@scentsl.com" className="text-brand-gold underline hover:text-ink">hello@scentsl.com</a>.
            </p>
          </section>

          <section className="space-y-3 border-t border-ink/15 pt-8">
            <h2 className="font-display text-2xl font-light tracking-tight text-ink">
              6. Registered Business Details & Contact
            </h2>
            <p>
              ScentSL Maison Ltd.<br />
              Freetown, Sierra Leone<br />
              Email: <a href="mailto:hello@scentsl.com" className="text-brand-gold underline hover:text-ink">hello@scentsl.com</a>
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
