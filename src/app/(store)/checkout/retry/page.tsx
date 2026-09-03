"use client";

import { Suspense, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";

function RetryPaymentContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const orderId = searchParams.get("orderId");

  useEffect(() => {
    if (!orderId) {
      router.replace("/");
      return;
    }

    fetch(`/api/orders/${orderId}/retry-payment`, { method: "POST" })
      .then((res) => res.json())
      .then((data) => {
        if (data.redirectUrl) {
          window.location.href = data.redirectUrl;
        } else {
          // Fallback to checkout
          router.replace(`/checkout?retryFailed=true`);
        }
      })
      .catch(() => {
        router.replace(`/checkout?retryFailed=true`);
      });
  }, [orderId, router]);

  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center gap-6 px-5 py-24 text-center">
      <div
        className="h-10 w-10 animate-spin rounded-full border-2 border-brand-gold/30 border-t-brand-gold"
        aria-label="Loading"
      />
      <p className="text-[10px] uppercase tracking-[0.5em] text-brand-gold">
        — Preparing payment —
      </p>
      <p className="font-serif text-base text-ink/70">
        Redirecting you to the payment page…
      </p>
    </div>
  );
}

export default function RetryPaymentPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[50vh] flex-col items-center justify-center gap-6 px-5 py-24 text-center">
          <div
            className="h-10 w-10 animate-spin rounded-full border-2 border-brand-gold/30 border-t-brand-gold"
            aria-label="Loading"
          />
        </div>
      }
    >
      <RetryPaymentContent />
    </Suspense>
  );
}
