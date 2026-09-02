"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

type PaymentStatus =
  | "PENDING"
  | "PROCESSING"
  | "PAID"
  | "FAILED"
  | "CANCELLED"
  | "EXPIRED";

interface Props {
  orderId: string;
  initialStatus: PaymentStatus;
}

const POLL_INTERVAL_MS = 5_000; // every 5 seconds
const MAX_POLL_DURATION_MS = 120_000; // stop after 2 minutes

export function PaymentStatusPoller({ orderId, initialStatus }: Props) {
  const router = useRouter();
  const [status, setStatus] = useState<PaymentStatus>(initialStatus);
  const [timedOut, setTimedOut] = useState(false);
  const startedAt = useRef(Date.now());
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    // Already confirmed — no polling needed
    if (status === "PAID") return;
    // Terminal failure states — no polling needed
    if (status === "FAILED" || status === "CANCELLED" || status === "EXPIRED") return;

    function poll() {
      if (Date.now() - startedAt.current >= MAX_POLL_DURATION_MS) {
        setTimedOut(true);
        if (intervalRef.current) clearInterval(intervalRef.current);
        return;
      }

      fetch(`/api/orders/${orderId}/status`)
        .then((res) => res.json())
        .then((data: { paymentStatus: PaymentStatus }) => {
          if (data.paymentStatus && data.paymentStatus !== status) {
            setStatus(data.paymentStatus);
            if (data.paymentStatus === "PAID") {
              // Refresh the page to show the full success UI
              if (intervalRef.current) clearInterval(intervalRef.current);
              router.refresh();
            }
          }
        })
        .catch(() => {
          // Network error — keep polling
        });
    }

    intervalRef.current = setInterval(poll, POLL_INTERVAL_MS);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [orderId, status, router]);

  if (status === "PAID") return null;

  if (timedOut) {
    return (
      <div className="mt-8 rounded border border-ink/15 bg-parchment-soft p-6 text-center">
        <p className="text-[10px] uppercase tracking-[0.4em] text-ink/50">
          — A note —
        </p>
        <p className="mt-3 font-serif text-base leading-relaxed text-ink/75">
          Payment verification is taking longer than expected. If you were
          charged, please contact us with your reference below.
        </p>
      </div>
    );
  }

  if (status === "FAILED" || status === "CANCELLED" || status === "EXPIRED") {
    return null; // Parent handles these states with a static message
  }

  // PENDING or PROCESSING — show spinner
  return (
    <div className="mt-8 flex flex-col items-center gap-4 rounded border border-brand-gold/20 bg-parchment-soft p-8 text-center">
      <div
        className="h-8 w-8 animate-spin rounded-full border-2 border-brand-gold/30 border-t-brand-gold"
        aria-label="Loading"
      />
      <p className="text-[10px] uppercase tracking-[0.4em] text-brand-gold">
        Verifying your payment…
      </p>
      <p className="font-serif text-sm text-ink/60">
        This page will update automatically once your payment is confirmed.
      </p>
    </div>
  );
}
