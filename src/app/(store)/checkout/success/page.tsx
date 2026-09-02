import { cookies } from "next/headers";
import Link from "next/link";

import { auth } from "@/lib/auth";
import { CART_SESSION_COOKIE } from "@/lib/cart";
import { prisma } from "@/lib/prisma";
import { Ornament } from "@/components/store/Ornament";
import { Reveal } from "@/components/motion/Reveal";
import { PaymentStatusPoller } from "@/components/store/PaymentStatusPoller";
import { formatSLE } from "@/lib/utils";

export const dynamic = "force-dynamic";

type SearchParams = { orderId?: string; sid?: string };

type PaymentStatus =
  | "PENDING"
  | "PROCESSING"
  | "PAID"
  | "FAILED"
  | "CANCELLED"
  | "EXPIRED";

export default async function CheckoutSuccessPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const { orderId } = await searchParams;
  const session = await auth();
  await cookies(); // ensure cookie store is initialized

  if (!orderId) {
    return (
      <ErrorView
        title="No order in this letter"
        body="We couldn't find an order reference. If you completed a purchase, please contact the maison."
        ctaHref="/"
        ctaLabel="Return to the home"
      />
    );
  }

  // ── Read order from DB — never trust the redirect URL alone ──
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: {
      items: {
        include: {
          product: true,
          variant: true,
        },
      },
      address: {
        include: { deliveryZone: true },
      },
    },
  });

  if (!order) {
    return (
      <ErrorView
        title="Order not found"
        body={`We couldn't locate this order. If you were charged, please write to us with the reference ${orderId}.`}
        ctaHref="/checkout"
        ctaLabel="Try again"
      />
    );
  }

  const paymentStatus = order.paymentStatus as PaymentStatus;
  const isGuest = !session?.user?.id || order.userId !== session.user.id;
  const orderRef = (order.orderNumber || order.id).slice(-8).toUpperCase();

  // ── Payment FAILED / CANCELLED / EXPIRED ─────────────────
  if (
    paymentStatus === "FAILED" ||
    paymentStatus === "CANCELLED" ||
    paymentStatus === "EXPIRED"
  ) {
    const titles: Record<string, string> = {
      FAILED: "Payment could not be processed",
      CANCELLED: "Payment was cancelled",
      EXPIRED: "Payment session expired",
    };
    const bodies: Record<string, string> = {
      FAILED:
        "Your payment was not successful. No funds have been taken. You may try again.",
      CANCELLED:
        "You cancelled the payment. Your order is still saved — you can try paying again.",
      EXPIRED:
        "Your payment session has expired. Please restart the payment to complete your order.",
    };
    return (
      <div className="mx-auto max-w-xl px-5 py-24 text-center sm:px-8">
        <p className="text-[10px] uppercase tracking-[0.5em] text-brand-rose">
          — A small note —
        </p>
        <h1 className="mt-5 font-display text-[clamp(2.2rem,5vw,3.6rem)] font-light leading-[1.02] text-ink">
          {titles[paymentStatus]}
        </h1>
        <p className="mt-6 font-serif text-base leading-relaxed text-ink/75">
          {bodies[paymentStatus]}
        </p>
        <p className="mt-4 text-[10px] uppercase tracking-[0.4em] text-ink/45">
          Reference{" "}
          <span className="font-display text-base normal-case tracking-normal text-ink">
            {orderRef}
          </span>
        </p>
        <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
          <RetryPaymentButton orderId={order.id} />
          <Link
            href="/products"
            className="inline-flex items-center gap-3 rounded-full border border-ink/25 px-7 py-3 text-[11px] uppercase tracking-[0.32em] text-ink transition-all duration-500 hover:border-brand-gold hover:bg-brand-gold hover:text-ink"
          >
            Continue browsing
          </Link>
        </div>
      </div>
    );
  }

  // ── Payment PENDING / PROCESSING — show holding state ─────
  if (paymentStatus === "PENDING" || paymentStatus === "PROCESSING") {
    return (
      <div className="mx-auto max-w-xl px-5 py-24 text-center sm:px-8">
        <p className="text-[10px] uppercase tracking-[0.5em] text-brand-gold">
          — Almost there —
        </p>
        <h1 className="mt-5 font-display text-[clamp(2.2rem,5vw,3.6rem)] font-light leading-[1.02] text-ink">
          Confirming your payment
        </h1>
        <p className="mt-6 font-serif text-base leading-relaxed text-ink/75">
          We are verifying your payment with Monime. This usually takes just a
          few seconds.
        </p>
        <p className="mt-4 text-[10px] uppercase tracking-[0.4em] text-ink/45">
          Reference{" "}
          <span className="font-display text-base normal-case tracking-normal text-ink">
            {orderRef}
          </span>
        </p>
        {/* Client component polls every 5 seconds */}
        <PaymentStatusPoller orderId={order.id} initialStatus={paymentStatus} />
      </div>
    );
  }

  // ── Payment PAID — show full success UI ───────────────────
  return (
    <div className="relative isolate overflow-hidden pb-32 pt-16 lg:pt-24">
      <Ornament
        variant="botanical"
        className="pointer-events-none absolute -left-12 top-12 hidden h-[420px] w-[420px] text-brand-gold/20 lg:block"
      />
      <Ornament
        variant="sprig"
        className="pointer-events-none absolute -right-10 top-32 hidden h-[280px] w-[200px] -scale-x-100 text-brand-gold/15 lg:block"
      />

      <div className="mx-auto max-w-2xl px-5 sm:px-8">
        <Reveal>
          <div className="flex flex-col items-center text-center">
            <DrawnSeal />
            <p className="mt-7 text-[10px] uppercase tracking-[0.5em] text-brand-gold">
              — Thank you —
            </p>
            <h1 className="mt-5 font-display text-[clamp(2.8rem,6.5vw,4.8rem)] font-light leading-[0.96] tracking-[-0.015em] text-ink">
              Your letter is{" "}
              <em className="italic text-brand-gold">on its way.</em>
            </h1>
            <p className="mt-6 font-serif text-lg leading-relaxed text-ink/75">
              The maison has received your order. A confirmation has been sent —
              and the bottles are being wrapped now.
            </p>
            <p className="mt-7 text-[10px] uppercase tracking-[0.4em] text-ink/55">
              Reference{" "}
              <span className="font-display text-base normal-case tracking-normal text-ink">
                {orderRef}
              </span>
            </p>
          </div>
        </Reveal>

        {/* Payment status badge */}
        <Reveal delay={0.08} className="mt-8 flex justify-center">
          <span className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-4 py-1.5 text-[10px] uppercase tracking-[0.32em] text-emerald-700">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
            Payment confirmed
          </span>
        </Reveal>

        {/* Summary */}
        <Reveal delay={0.16} className="mt-14">
          <section className="border border-ink/12 bg-parchment-soft p-8">
            <p className="text-[10px] uppercase tracking-[0.4em] text-brand-gold">
              Order summary
            </p>
            <ul className="mt-5 space-y-4 border-y border-ink/12 py-5">
              {order.items.map((item) => (
                <li
                  key={item.id}
                  className="flex items-start justify-between gap-3"
                >
                  <div>
                    <Link
                      href={`/products/${item.product.slug}`}
                      className="font-display text-xl font-light text-ink transition-colors hover:text-brand-gold"
                    >
                      {item.product.name}
                    </Link>
                    <p className="mt-0.5 text-[10px] uppercase tracking-[0.28em] text-ink/55">
                      {item.variant.size} × {item.quantity}
                    </p>
                  </div>
                  <p className="font-display text-lg tabular-nums text-ink">
                    {formatSLE(item.price * item.quantity)}
                  </p>
                </li>
              ))}
            </ul>
            <dl className="mt-5 space-y-3 text-[11px] uppercase tracking-[0.28em]">
              <Row label="Subtotal" value={formatSLE(order.subtotal)} />
              <Row
                label="Delivery"
                value={order.deliveryFee === 0 ? "Free" : formatSLE(order.deliveryFee)}
              />
              {order.discount > 0 && (
                <Row
                  label="Carte"
                  value={`− ${formatSLE(order.discount)}`}
                  accent
                />
              )}
            </dl>
            <div className="mt-6 flex items-baseline justify-between border-t border-ink/20 pt-5">
              <span className="text-[10px] uppercase tracking-[0.4em] text-ink/65">
                Total
              </span>
              <span className="font-display text-3xl font-light tabular-nums text-ink">
                {formatSLE(order.total)}
              </span>
            </div>
          </section>
        </Reveal>

        {/* Delivery */}
        <Reveal delay={0.22} className="mt-6">
          <section className="border border-ink/12 bg-parchment-soft p-8">
            <p className="text-[10px] uppercase tracking-[0.4em] text-brand-gold">
              Delivery
            </p>
            <p className="mt-3 font-display text-2xl font-light text-ink">
              {order.address.recipientName}
            </p>
            <p className="mt-3 font-serif text-base leading-relaxed text-ink/75">
              {order.address.streetAddress}
              <br />
              {order.address.city}
              <br />
              {order.address.deliveryZone.name}
            </p>
            <p className="mt-3 text-[10px] uppercase tracking-[0.32em] text-ink/55">
              {order.address.phone}
            </p>
          </section>
        </Reveal>

        <Reveal delay={0.3} className="mt-12">
          <div className="flex flex-col items-center gap-5 sm:flex-row sm:justify-between">
            {isGuest ? (
              <p className="font-serif italic text-ink/70">
                <Link
                  href="/auth/signin"
                  className="text-ink underline-offset-4 hover:text-brand-gold hover:underline"
                >
                  Create an account
                </Link>{" "}
                to keep an archive of your orders.
              </p>
            ) : (
              <Link
                href={`/account/orders/${order.id}`}
                className="group inline-flex items-center gap-3 text-[11px] uppercase tracking-[0.32em] text-ink transition-colors hover:text-brand-gold"
              >
                Track your order
                <span className="inline-block h-px w-10 bg-ink/40 transition-all duration-500 group-hover:w-14 group-hover:bg-brand-gold" />
              </Link>
            )}
            <Link
              href="/products"
              className="group inline-flex items-center gap-3 rounded-full border border-ink/25 px-7 py-3 text-[11px] uppercase tracking-[0.32em] text-ink transition-all duration-500 hover:border-brand-gold hover:bg-brand-gold hover:text-ink"
            >
              Continue browsing
            </Link>
          </div>
        </Reveal>
      </div>
    </div>
  );
}

// ── Sub-components ────────────────────────────────────────

function Row({
  label,
  value,
  accent = false,
}: {
  label: string;
  value: string;
  accent?: boolean;
}) {
  return (
    <div
      className={`flex justify-between ${
        accent ? "text-brand-gold" : "text-ink/65"
      }`}
    >
      <dt>{label}</dt>
      <dd
        className={`font-display text-base normal-case tracking-normal tabular-nums ${
          accent ? "text-brand-gold" : "text-ink"
        }`}
      >
        {value}
      </dd>
    </div>
  );
}

function DrawnSeal() {
  // SVG seal — the dasharray draws on mount via the keyframe below
  return (
    <svg
      viewBox="0 0 120 120"
      className="size-24 text-brand-gold"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <style>{`
        .seal-stroke {
          stroke-dasharray: 320;
          stroke-dashoffset: 320;
          animation: seal-draw 1.4s cubic-bezier(0.65,0,0.35,1) 0.2s forwards;
        }
        .seal-stroke-2 {
          stroke-dasharray: 100;
          stroke-dashoffset: 100;
          animation: seal-draw 1s cubic-bezier(0.65,0,0.35,1) 1.2s forwards;
        }
        @keyframes seal-draw { to { stroke-dashoffset: 0; } }
        @media (prefers-reduced-motion: reduce) {
          .seal-stroke, .seal-stroke-2 { animation: none; stroke-dashoffset: 0; }
        }
      `}</style>
      <circle cx="60" cy="60" r="50" className="seal-stroke" />
      <path
        d="M40 60l14 14 26-30"
        className="seal-stroke-2"
        strokeWidth="1.6"
      />
    </svg>
  );
}

function ErrorView({
  title,
  body,
  ctaHref,
  ctaLabel,
}: {
  title: string;
  body: string;
  ctaHref: string;
  ctaLabel: string;
}) {
  return (
    <div className="mx-auto max-w-xl px-5 py-24 text-center sm:px-8">
      <p className="text-[10px] uppercase tracking-[0.5em] text-brand-rose">
        — A small note —
      </p>
      <h1 className="mt-5 font-display text-[clamp(2.2rem,5vw,3.6rem)] font-light leading-[1.02] text-ink">
        {title}
      </h1>
      <p className="mt-6 font-serif text-base leading-relaxed text-ink/75">
        {body}
      </p>
      <Link
        href={ctaHref}
        className="group mt-10 inline-flex items-center gap-3 rounded-full bg-ink px-7 py-3 text-[11px] uppercase tracking-[0.32em] text-parchment transition-all duration-500 hover:bg-brand-gold hover:text-ink"
      >
        {ctaLabel}
        <span className="inline-block transition-transform duration-500 group-hover:translate-x-1">
          →
        </span>
      </Link>
    </div>
  );
}

/** Client component — rendered only when paymentStatus is FAILED/CANCELLED/EXPIRED */
function RetryPaymentButton({ orderId }: { orderId: string }) {
  // This is a server component file, so we render a plain anchor that hits the retry API.
  // A full client button with fetch is in a separate component if needed.
  return (
    <Link
      href={`/checkout/retry?orderId=${orderId}`}
      className="group inline-flex items-center gap-3 rounded-full bg-ink px-7 py-3 text-[11px] uppercase tracking-[0.32em] text-parchment transition-all duration-500 hover:bg-brand-gold hover:text-ink"
    >
      Try payment again
      <span className="inline-block transition-transform duration-500 group-hover:translate-x-1">
        →
      </span>
    </Link>
  );
}
