import Link from "next/link";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { auth } from "@/lib/auth";
import { CART_SESSION_COOKIE, getCartWithItems } from "@/lib/cart";
import { prisma } from "@/lib/prisma";
import { CheckoutForm } from "@/components/store/CheckoutForm";
import { Reveal } from "@/components/motion/Reveal";

export const dynamic = "force-dynamic";

async function loadCheckoutData() {
  const session = await auth();
  const cookieStore = await cookies();
  const sessionId = cookieStore.get(CART_SESSION_COOKIE)?.value ?? null;

  const cart = await getCartWithItems({
    userId: session?.user?.id ?? null,
    sessionId: session?.user?.id ? null : sessionId,
  });

  let pickupZone = await prisma.deliveryZone.findFirst({
    where: { name: { equals: "Pickup", mode: "insensitive" } },
  });
  if (!pickupZone) {
    await prisma.deliveryZone.create({
      data: {
        name: "Pickup",
        fee: 0,
        isActive: true,
      },
    });
  } else if (!pickupZone.isActive || pickupZone.fee !== 0) {
    await prisma.deliveryZone.update({
      where: { id: pickupZone.id },
      data: { isActive: true, fee: 0 },
    });
  }

  const zones = await prisma.deliveryZone.findMany({
    where: { isActive: true },
    orderBy: { fee: "asc" },
  });

  return { session, cart, zones };
}

export default async function CheckoutPage({
  searchParams,
}: {
  searchParams: Promise<{ cancelled?: string }>;
}) {
  const { cancelled } = await searchParams;
  const { session, cart, zones } = await loadCheckoutData();

  if (!cart || cart.items.length === 0) {
    redirect("/cart");
  }

  const items = cart.items.map((item) => ({
    variantId: item.variantId,
    productName: item.variant.product.name,
    size: item.variant.size,
    price: item.variant.price,
    quantity: item.quantity,
  }));

  return (
    <div className="bg-parchment pb-32">
      <header className="border-b border-ink/10 bg-parchment-soft pb-12 pt-16 lg:pt-24">
        <div className="mx-auto max-w-[1400px] px-5 sm:px-8 lg:px-12">
          <Reveal>
            <Steps current={2} />
          </Reveal>
          <Reveal delay={0.1}>
            <h1 className="mt-8 font-display text-[clamp(2.8rem,6.5vw,5rem)] font-light leading-[0.95] tracking-[-0.015em] text-ink">
              The address book <em className="italic text-brand-gold">— almost there.</em>
            </h1>
          </Reveal>
        </div>
      </header>

      <div className="mx-auto max-w-[1400px] px-5 pt-16 sm:px-8 lg:px-12">
<CheckoutForm
           isAuthenticated={Boolean(session?.user?.id)}
           email={session?.user?.email ?? undefined}
           items={items}
           zones={zones}
           showCancelledBanner={cancelled === "true"}
         />
      </div>
    </div>
  );
}

function Steps({ current }: { current: 1 | 2 | 3 }) {
  const steps = [
    { id: 1, label: "Your bag", href: "/cart" as const },
    { id: 2, label: "Address", href: undefined },
    { id: 3, label: "Confirmation", href: undefined },
  ];

  return (
    <ol className="flex flex-wrap items-center gap-x-6 gap-y-2 text-[10px] uppercase tracking-[0.4em]">
      {steps.map((step, i) => {
        const active = step.id === current;
        const passed = step.id < current;
        const content = (
          <span
            className={`inline-flex items-center gap-2 transition-colors ${
              active
                ? "text-brand-gold"
                : passed
                  ? "text-ink/70"
                  : "text-ink/30"
            }`}
          >
            <span className="font-display text-base normal-case tracking-normal">
              {step.id.toString().padStart(2, "0")}
            </span>
            {step.label}
          </span>
        );
        return (
          <li key={step.id} className="flex items-center gap-6">
            {step.href && !active ? (
              <Link href={step.href} className="hover:text-ink">
                {content}
              </Link>
            ) : (
              content
            )}
            {i < steps.length - 1 && (
              <span className="inline-block h-px w-10 bg-ink/15" />
            )}
          </li>
        );
      })}
    </ol>
  );
}
