import Link from "next/link";
import { format } from "date-fns";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Reveal } from "@/components/motion/Reveal";
import { RevealItem, RevealStagger } from "@/components/motion/RevealStagger";
import { formatSLE } from "@/lib/utils";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

const STATUS_TONES: Record<string, string> = {
  PENDING: "text-ink/55",
  PAID: "text-brand-gold",
  PROCESSING: "text-brand-gold",
  SHIPPED: "text-brand-moss",
  DELIVERED: "text-brand-moss",
  CANCELLED: "text-brand-rose",
};

const STATUS_LABELS: Record<string, string> = {
  PENDING: "Pending",
  PAID: "Paid",
  PROCESSING: "Composing",
  SHIPPED: "On its way",
  DELIVERED: "Delivered",
  CANCELLED: "Cancelled",
};

export default async function OrdersPage() {
  const session = await auth();
  if (!session?.user?.id) return null;

  const orders = await prisma.order.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="bg-parchment pb-32">
      <header className="border-b border-ink/10 bg-parchment-soft pb-12 pt-16 lg:pt-24">
        <div className="mx-auto max-w-[1200px] px-5 sm:px-8 lg:px-12">
          <Reveal>
            <p className="text-[10px] uppercase tracking-[0.5em] text-brand-gold">
              Your chapters
            </p>
          </Reveal>
          <Reveal delay={0.08}>
            <h1 className="mt-4 font-display text-[clamp(2.6rem,6vw,4.8rem)] font-light leading-[0.95] tracking-[-0.015em] text-ink">
              Order <em className="italic text-brand-gold">history</em>
            </h1>
          </Reveal>
          <Reveal delay={0.16}>
            <p className="mt-6 text-[10px] uppercase tracking-[0.36em] text-ink/55">
              {orders.length} {orders.length === 1 ? "letter" : "letters"} sent
            </p>
          </Reveal>
        </div>
      </header>

      <div className="mx-auto mt-16 max-w-[1200px] px-5 sm:px-8 lg:px-12">
        {orders.length === 0 ? (
          <div className="flex flex-col items-center border-y border-ink/10 px-6 py-24 text-center">
            <p className="font-display text-3xl italic text-ink/40">
              Your archive is quiet
            </p>
            <p className="mt-4 text-[10px] uppercase tracking-[0.32em] text-ink/55">
              No chapters have been ordered yet.
            </p>
            <Link
              href="/products"
              className="group mt-10 inline-flex items-center gap-3 rounded-full bg-ink px-7 py-3 text-[11px] uppercase tracking-[0.32em] text-parchment transition-all duration-500 hover:bg-brand-gold hover:text-ink"
            >
              Browse the collection
              <span className="inline-block transition-transform duration-500 group-hover:translate-x-1">
                →
              </span>
            </Link>
          </div>
        ) : (
          <RevealStagger as="ul" className="border-t border-ink/12" stagger={0.05}>
            {orders.map((order) => (
              <RevealItem
                key={order.id}
                as="li"
                className="group/order border-b border-ink/10"
              >
                <Link
                  href={`/account/orders/${order.id}`}
                  className="grid grid-cols-2 items-center gap-6 py-7 transition-colors sm:grid-cols-12"
                >
                  <div className="col-span-2 sm:col-span-3">
                    <p className="text-[10px] uppercase tracking-[0.32em] text-ink/55">
                      Reference
                    </p>
                    <p className="mt-2 font-display text-2xl font-light text-ink transition-colors group-hover/order:text-brand-gold">
                      {order.id.slice(-8).toUpperCase()}
                    </p>
                  </div>
                  <div className="sm:col-span-3">
                    <p className="text-[10px] uppercase tracking-[0.32em] text-ink/55">
                      Sent
                    </p>
                    <p className="mt-2 font-serif text-lg italic text-ink/75">
                      {format(order.createdAt, "d MMMM, yyyy")}
                    </p>
                  </div>
                  <div className="sm:col-span-3">
                    <p className="text-[10px] uppercase tracking-[0.32em] text-ink/55">
                      Status
                    </p>
                    <p
                      className={cn(
                        "mt-2 text-[11px] uppercase tracking-[0.32em]",
                        STATUS_TONES[order.status] ?? "text-ink/65",
                      )}
                    >
                      {STATUS_LABELS[order.status] ?? order.status}
                    </p>
                  </div>
                  <div className="sm:col-span-2">
                    <p className="text-[10px] uppercase tracking-[0.32em] text-ink/55">
                      Total
                    </p>
                    <p className="mt-2 font-display text-xl tabular-nums text-ink">
                      {formatSLE(order.total)}
                    </p>
                  </div>
                  <div className="col-span-2 hidden items-center justify-end sm:col-span-1 sm:flex">
                    <span className="inline-block h-px w-8 bg-ink/30 transition-all duration-500 group-hover/order:w-12 group-hover/order:bg-brand-gold" />
                  </div>
                </Link>
              </RevealItem>
            ))}
          </RevealStagger>
        )}
      </div>
    </div>
  );
}
