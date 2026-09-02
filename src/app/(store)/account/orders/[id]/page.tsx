import Link from "next/link";
import { notFound } from "next/navigation";
import { format } from "date-fns";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { OrderStatusTimeline } from "@/components/store/OrderStatusTimeline";
import { Reveal } from "@/components/motion/Reveal";
import { formatSLE } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function OrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user?.id) return null;

  const order = await prisma.order.findUnique({
    where: { id },
    include: {
      items: {
        include: {
          product: { select: { name: true, slug: true, images: true } },
          variant: { select: { size: true } },
        },
      },
      address: { include: { deliveryZone: true } },
      coupon: true,
    },
  });

  if (!order || order.userId !== session.user.id) notFound();

  return (
    <div className="bg-parchment pb-32">
      <header className="border-b border-ink/10 bg-parchment-soft pb-12 pt-16 lg:pt-24">
        <div className="mx-auto max-w-[1200px] px-5 sm:px-8 lg:px-12">
          <nav className="flex items-center gap-3 text-[10px] uppercase tracking-[0.32em] text-ink/55">
            <Link href="/account/orders" className="hover:text-ink">
              Orders
            </Link>
            <span className="text-ink/25">·</span>
            <span className="text-ink">
              {order.id.slice(-8).toUpperCase()}
            </span>
          </nav>

          <Reveal>
            <div className="mt-7 flex flex-wrap items-end justify-between gap-6">
              <div>
                <p className="text-[10px] uppercase tracking-[0.5em] text-brand-gold">
                  Chapter · {format(order.createdAt, "d MMM yyyy")}
                </p>
                <h1 className="mt-3 font-display text-[clamp(2.4rem,5vw,4.2rem)] font-light leading-[0.96] tracking-[-0.015em] text-ink">
                  Reference{" "}
                  <em className="italic text-brand-gold">
                    {order.id.slice(-8).toUpperCase()}
                  </em>
                </h1>
              </div>
              <p className="font-display text-[clamp(2.4rem,5vw,3.6rem)] font-light tabular-nums text-ink">
                {formatSLE(order.total)}
              </p>
            </div>
          </Reveal>
        </div>
      </header>

      <div className="mx-auto mt-16 max-w-[1200px] px-5 sm:px-8 lg:px-12">
        <Reveal>
          <section className="border border-ink/12 bg-parchment-soft p-8">
            <p className="text-[10px] uppercase tracking-[0.4em] text-brand-gold">
              Status
            </p>
            <div className="mt-8">
              <OrderStatusTimeline status={order.status} />
            </div>
            {/* Payment status pill */}
            <div className="mt-6 border-t border-ink/10 pt-5">
              <p className="mb-3 text-[10px] uppercase tracking-[0.4em] text-ink/45">
                Payment
              </p>
              {order.paymentStatus === "PAID" ? (
                <span className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-4 py-1.5 text-[10px] uppercase tracking-[0.28em] text-emerald-700">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                  Confirmed
                </span>
              ) : order.paymentStatus === "PENDING" || order.paymentStatus === "PROCESSING" ? (
                <span className="inline-flex items-center gap-2 rounded-full bg-amber-50 px-4 py-1.5 text-[10px] uppercase tracking-[0.28em] text-amber-700">
                  <span className="h-1.5 w-1.5 rounded-full bg-amber-400" />
                  Awaiting payment
                </span>
              ) : (
                <span className="inline-flex items-center gap-2 rounded-full bg-rose-50 px-4 py-1.5 text-[10px] uppercase tracking-[0.28em] text-rose-700">
                  <span className="h-1.5 w-1.5 rounded-full bg-rose-400" />
                  {order.paymentStatus.charAt(0) + order.paymentStatus.slice(1).toLowerCase()}
                </span>
              )}
            </div>
          </section>
        </Reveal>

        <div className="mt-10 grid gap-10 lg:grid-cols-[1fr_360px] lg:gap-16">
          <Reveal delay={0.06}>
            <section className="border border-ink/12 bg-parchment-soft p-8">
              <p className="text-[10px] uppercase tracking-[0.4em] text-brand-gold">
                Items
              </p>
              <ul className="mt-5 divide-y divide-ink/10">
                {order.items.map((item) => (
                  <li
                    key={item.id}
                    className="flex flex-wrap items-start justify-between gap-3 py-5 first:pt-0 last:pb-0"
                  >
                    <div>
                      <Link
                        href={`/products/${item.product.slug}`}
                        className="font-display text-xl font-light text-ink transition-colors hover:text-brand-gold"
                      >
                        {item.product.name}
                      </Link>
                      <p className="mt-1 text-[10px] uppercase tracking-[0.32em] text-ink/55">
                        {item.variant.size} × {item.quantity}
                      </p>
                    </div>
                    <p className="font-display text-lg tabular-nums text-ink">
                      {formatSLE(item.price * item.quantity)}
                    </p>
                  </li>
                ))}
              </ul>
              <dl className="mt-6 space-y-3 border-t border-ink/12 pt-5 text-[11px] uppercase tracking-[0.28em]">
                <Row label="Subtotal" value={formatSLE(order.subtotal)} />
                <Row label="Delivery" value={formatSLE(order.deliveryFee)} />
                {order.discount > 0 && (
                  <Row
                    label={
                      order.coupon
                        ? `Carte · ${order.coupon.code}`
                        : "Carte"
                    }
                    value={`− ${formatSLE(order.discount)}`}
                    accent
                  />
                )}
                <div className="flex items-baseline justify-between border-t border-ink/15 pt-5">
                  <span className="text-[10px] uppercase tracking-[0.4em] text-ink/65">
                    Total
                  </span>
                  <span className="font-display text-3xl font-light tabular-nums text-ink">
                    {formatSLE(order.total)}
                  </span>
                </div>
              </dl>
            </section>
          </Reveal>

          <Reveal delay={0.12}>
            <section className="border border-ink/12 bg-parchment-soft p-8">
              <p className="text-[10px] uppercase tracking-[0.4em] text-brand-gold">
                Delivery
              </p>
              <p className="mt-4 font-display text-2xl font-light text-ink">
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
        </div>

        <Reveal delay={0.18} className="mt-12">
          <Link
            href="/account/orders"
            className="group inline-flex items-center gap-3 pb-2 text-[11px] uppercase tracking-[0.32em] text-ink/70 transition-colors hover:text-ink"
          >
            <span className="inline-block h-px w-8 bg-ink/30 transition-all duration-500 group-hover:w-12 group-hover:bg-brand-gold" />
            Back to all chapters
          </Link>
        </Reveal>
      </div>
    </div>
  );
}

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
