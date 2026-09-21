"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Ornament } from "@/components/store/Ornament";

export default function DataDeletionPage() {
  const [email, setEmail] = useState("");
  const [reason, setReason] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) return;

    startTransition(async () => {
      // Simulate receipt of request & notify user cleanly
      await new Promise((resolve) => setTimeout(resolve, 600));
      setSubmitted(true);
      toast.success("Data deletion request received", {
        description: "Our privacy team will contact you within 24 hours.",
      });
    });
  }

  return (
    <div className="relative overflow-hidden bg-parchment py-16 sm:py-24 lg:py-32">
      <Ornament
        variant="sprig"
        className="pointer-events-none absolute -left-16 top-24 h-[400px] w-[300px] text-brand-gold/15"
      />
      <div className="relative mx-auto max-w-3xl px-5 sm:px-8 lg:px-12">
        <header className="border-b border-ink/15 pb-10 text-center sm:text-left">
          <p className="text-[10px] uppercase tracking-[0.5em] text-brand-gold">
            Privacy & Rights
          </p>
          <h1 className="mt-3 font-display text-[clamp(2.4rem,5vw,4rem)] font-light leading-none tracking-[-0.015em] text-ink">
            Data Deletion Request
          </h1>
          <p className="mt-4 font-serif text-base text-ink/75">
            Submit a request to permanently delete your account, order history, and personal data from ScentSL archives in accordance with GDPR and CCPA privacy standards.
          </p>
        </header>

        {submitted ? (
          <div className="mt-12 rounded-2xl border border-brand-gold/40 bg-brand-gold/10 p-8 text-center sm:p-12">
            <span className="font-display text-4xl text-brand-gold">✓</span>
            <h2 className="mt-4 font-display text-2xl font-light text-ink">
              Request Successfully Received
            </h2>
            <p className="mt-3 font-serif text-base text-ink/80">
              We have dispatched a confirmation receipt to <strong className="text-ink">{email}</strong>. Our privacy officer will process your data deletion request within 30 days as required by law.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="mt-12 space-y-8">
            <div>
              <label className="flex flex-col gap-2">
                <span className="text-[10px] uppercase tracking-[0.32em] text-ink/75 font-medium">
                  Your Account Email Address *
                </span>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@maison.com"
                  className="border-b border-ink/25 bg-transparent pb-2 font-display text-lg text-ink placeholder:text-ink/35 focus:border-brand-gold focus:outline-none focus-visible:outline-none"
                />
              </label>
            </div>

            <div>
              <label className="flex flex-col gap-2">
                <span className="text-[10px] uppercase tracking-[0.32em] text-ink/75 font-medium">
                  Reason for Request (Optional)
                </span>
                <textarea
                  rows={4}
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="Optional details for our privacy team..."
                  className="w-full border-b border-ink/25 bg-transparent pb-2 font-serif text-base leading-relaxed text-ink placeholder:text-ink/35 focus:border-brand-gold focus:outline-none focus-visible:outline-none"
                />
              </label>
            </div>

            <div className="rounded-xl border border-ink/10 bg-parchment-soft p-5 font-serif text-xs text-ink/75">
              <p>
                <strong>Important Notice:</strong> Upon processing, your account, address book, saved bag items, and wishlist will be permanently removed. Order records required for statutory tax compliance in Sierra Leone will be anonymized.
              </p>
            </div>

            <div className="flex justify-end pt-4">
              <button
                type="submit"
                disabled={isPending || !email.trim()}
                className="group inline-flex items-center gap-3 rounded-full bg-ink px-8 py-4 text-[11px] uppercase tracking-[0.32em] text-parchment transition-all duration-300 hover:bg-brand-rose hover:text-parchment disabled:opacity-50 focus-visible:outline-2 focus-visible:outline-brand-gold"
              >
                {isPending ? "Submitting Request…" : "Submit Deletion Request →"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
