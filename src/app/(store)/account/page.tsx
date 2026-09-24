import Link from "next/link";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { DeleteAddressButton } from "@/components/store/DeleteAddressButton";
import { Reveal } from "@/components/motion/Reveal";

export const dynamic = "force-dynamic";

export default async function AccountPage() {
  const session = await auth();
  if (!session?.user?.id) return null;

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: {
      addresses: {
        include: { deliveryZone: true },
        orderBy: { recipientName: "asc" },
      },
    },
  });
  if (!user) return null;

  const signInMethod = user.password ? "Email & Password" : "Google";

  return (
    <div className="bg-parchment pb-32">
      <header className="border-b border-ink/10 bg-parchment-soft pb-12 pt-16 lg:pt-24">
        <div className="mx-auto max-w-[1200px] px-5 sm:px-8 lg:px-12">
          <Reveal>
            <p className="text-[10px] uppercase tracking-[0.5em] text-brand-gold">
              {user.name ?? "Member"} · The maison
            </p>
          </Reveal>
          <Reveal delay={0.08}>
            <h1 className="mt-4 font-display text-[clamp(2.6rem,6vw,4.8rem)] font-light leading-[0.95] tracking-[-0.015em] text-ink">
              Your <em className="italic text-brand-gold">archive</em>
            </h1>
          </Reveal>
        </div>
      </header>

      <div className="mx-auto mt-16 max-w-[1200px] px-5 sm:px-8 lg:px-12">
        <div className="grid gap-12 lg:grid-cols-[280px_1fr] lg:gap-20">
          <aside className="lg:sticky lg:top-24 lg:self-start">
            <nav className="flex flex-col gap-1.5">
              <NavRow active>Profile</NavRow>
              <NavRow href="/account/orders">Orders</NavRow>
              <NavRow href="/account/notifications">Notifications</NavRow>
              <NavRow href="/wishlist">Wishlist</NavRow>
              <NavRow href="/dashboard/find-your-scent">Find Your Scent</NavRow>
            </nav>
          </aside>

          <div className="space-y-16">
            <Reveal>
              <section>
                <header className="mb-6 flex items-center gap-3">
                  <p className="text-[10px] uppercase tracking-[0.4em] text-brand-gold">
                    Profile
                  </p>
                  <span className="inline-block h-px flex-1 bg-ink/15" />
                </header>
                <dl className="grid gap-8 sm:grid-cols-2">
                  <FactRow label="Name" value={user.name ?? "—"} />
                  <FactRow label="Email" value={user.email} />
                  <FactRow
                    label="Sign-in"
                    value={signInMethod}
                    accent
                  />
                  <FactRow
                    label="Joined the archive"
                    value={user.createdAt.toLocaleDateString("en-GB", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })}
                  />
                </dl>
              </section>
            </Reveal>

            <Reveal delay={0.08}>
              <section>
                <header className="mb-6 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <p className="text-[10px] uppercase tracking-[0.4em] text-brand-gold">
                      Address book
                    </p>
                    <span className="inline-block h-px flex-1 bg-ink/15 sm:w-24" />
                  </div>
                </header>
                {user.addresses.length === 0 ? (
                  <p className="font-serif text-base italic text-ink/65">
                    No addresses yet — they will be kept here after your first
                    chapter is sent.
                  </p>
                ) : (
                  <ul className="divide-y divide-ink/10 border-y border-ink/10">
                    {user.addresses.map((address) => (
                      <li
                        key={address.id}
                        className="flex flex-wrap items-start justify-between gap-6 py-6"
                      >
                        <div>
                          <p className="font-display text-2xl font-light text-ink">
                            {address.recipientName}
                          </p>
                          <p className="mt-2 font-serif text-base leading-relaxed text-ink/75">
                            {address.streetAddress} · {address.city}
                          </p>
                          <p className="mt-1 text-[10px] uppercase tracking-[0.32em] text-ink/55">
                            {address.deliveryZone.name} · {address.phone}
                          </p>
                        </div>
                        <DeleteAddressButton id={address.id} />
                      </li>
                    ))}
                  </ul>
                )}
              </section>
            </Reveal>
          </div>
        </div>
      </div>
    </div>
  );
}

function FactRow({
  label,
  value,
  accent = false,
}: {
  label: string;
  value: string;
  accent?: boolean;
}) {
  return (
    <div>
      <dt className="text-[10px] uppercase tracking-[0.32em] text-ink/55">
        {label}
      </dt>
      <dd
        className={`mt-2 font-display text-2xl font-light leading-tight ${
          accent ? "text-brand-gold" : "text-ink"
        }`}
      >
        {value}
      </dd>
    </div>
  );
}

function NavRow({
  href,
  active,
  children,
}: {
  href?: string;
  active?: boolean;
  children: React.ReactNode;
}) {
  const cls = `group flex items-center gap-3 py-2 text-[11px] uppercase tracking-[0.32em] transition-colors ${
    active ? "text-brand-gold" : "text-ink/70 hover:text-ink"
  }`;
  const inner = (
    <>
      <span
        className={`inline-block h-px transition-all duration-500 ${
          active ? "w-8 bg-brand-gold" : "w-3 bg-ink/30 group-hover:w-6"
        }`}
      />
      {children}
    </>
  );
  if (href) {
    return (
      <Link href={href} className={cls}>
        {inner}
      </Link>
    );
  }
  return <span className={cls}>{inner}</span>;
}
