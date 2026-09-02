"use client";

import { useMemo, useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";

import { checkoutSchema, type CheckoutInput } from "@/lib/validators/checkout";
import { cn, formatSLE } from "@/lib/utils";

type DeliveryZone = { id: string; name: string; fee: number };

type LineItem = {
  variantId: string;
  productName: string;
  size: string;
  price: number;
  quantity: number;
};

type Props = {
  isAuthenticated: boolean;
  email?: string;
  items: LineItem[];
  zones: DeliveryZone[];
  showCancelledBanner?: boolean;
};

export function CheckoutForm({
  isAuthenticated,
  email,
  items,
  zones,
  showCancelledBanner,
}: Props) {
  const [isSubmitting, startSubmit] = useTransition();
  const [appliedCoupon, setAppliedCoupon] = useState<{
    code: string;
    discount: number;
  } | null>(null);
  const [couponInput, setCouponInput] = useState("");
  const [couponError, setCouponError] = useState<string | null>(null);
  const [couponPending, startCoupon] = useTransition();

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<CheckoutInput>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      guestEmail: isAuthenticated ? undefined : "",
      recipientName: "",
      phone: "",
      streetAddress: "",
      city: "",
      deliveryZoneId: zones[0]?.id ?? "",
    },
  });

  const selectedZoneId = watch("deliveryZoneId");
  const selectedZone = zones.find((z) => z.id === selectedZoneId) ?? null;

  const subtotal = useMemo(
    () => items.reduce((sum, item) => sum + item.price * item.quantity, 0),
    [items],
  );
  const deliveryFee = selectedZone?.fee ?? 0;
  const discount = appliedCoupon?.discount ?? 0;
  const total = Math.max(0, subtotal + deliveryFee - discount);

  function applyCoupon() {
    const code = couponInput.trim();
    if (!code) return;
    setCouponError(null);
    startCoupon(async () => {
      try {
        const res = await fetch("/api/checkout/apply-coupon", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ code, subtotal }),
        });
        const data = await res.json();
        if (!res.ok) {
          setCouponError(data?.error ?? "Could not apply coupon");
          setAppliedCoupon(null);
          return;
        }
        setAppliedCoupon({ code: data.code, discount: data.discount });
        toast.success(`${formatSLE(data.discount)} kept aside`);
      } catch {
        setCouponError("Something went wrong");
      }
    });
  }

  function clearCoupon() {
    setAppliedCoupon(null);
    setCouponInput("");
    setCouponError(null);
  }

  function onSubmit(values: CheckoutInput) {
    startSubmit(async () => {
      try {
        const res = await fetch("/api/checkout", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ...values,
            couponCode: appliedCoupon?.code,
          }),
        });
        if (res.status === 501) {
          toast(
            "Payments wiring is coming online shortly. Your bag is preserved.",
          );
          return;
        }
        const data = await res.json();
        if (!res.ok) {
          toast.error(data?.error ?? "Could not start checkout");
          return;
        }
        if (data?.redirectUrl) {
          window.location.href = data.redirectUrl;
        }
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Something went wrong");
      }
    });
  }

  return (
    <div className="grid gap-8 sm:gap-12 md:grid-cols-[1fr_320px] lg:grid-cols-[1fr_400px] md:gap-16 lg:gap-20">
      {showCancelledBanner && (
        <div className="border-l-2 border-brand-rose bg-brand-rose/10 px-5 py-4 font-serif text-base italic text-ink/80 lg:col-span-2">
          Your previous payment was cancelled. The bag is kept — please try again
          below.
        </div>
      )}

      <form
        onSubmit={handleSubmit(onSubmit)}
        noValidate
        className="space-y-14"
      >
        {/* Contact */}
        {!isAuthenticated && (
          <Section eyebrow="01 · Contact" title="Where shall we write?">
            <UnderlineField
              label="Email"
              type="email"
              autoComplete="email"
              error={errors.guestEmail?.message}
              {...register("guestEmail")}
            />
          </Section>
        )}

        {isAuthenticated && email && (
          <p className="text-[11px] uppercase tracking-[0.32em] text-ink/55">
            Ordering as <span className="text-ink">{email}</span>
          </p>
        )}

        {/* Delivery */}
        <Section eyebrow="02 · Delivery" title="The address book.">
          <div className="grid gap-x-8 gap-y-8 sm:grid-cols-2">
            <UnderlineField
              label="Recipient name"
              autoComplete="name"
              error={errors.recipientName?.message}
              {...register("recipientName")}
            />
            <UnderlineField
              label="Phone"
              autoComplete="tel"
              error={errors.phone?.message}
              {...register("phone")}
            />
            <div className="sm:col-span-2">
              <UnderlineField
                label="Street address"
                autoComplete="street-address"
                error={errors.streetAddress?.message}
                {...register("streetAddress")}
              />
            </div>
            <UnderlineField
              label="City"
              autoComplete="address-level2"
              error={errors.city?.message}
              {...register("city")}
            />
            <ZoneSelect
              label="Delivery zone"
              zones={zones}
              value={selectedZoneId}
              onChange={(id) => setValue("deliveryZoneId", id)}
              error={errors.deliveryZoneId?.message}
            />
          </div>
        </Section>

        {/* Coupon */}
        <Section eyebrow="03 · Carte de visite" title="A note to add?">
          {appliedCoupon ? (
            <div className="flex items-center justify-between border border-brand-gold/40 bg-brand-gold/10 px-6 py-4">
              <div>
                <p className="font-display text-xl italic text-brand-gold">
                  {appliedCoupon.code}
                </p>
                <p className="mt-1 text-[10px] uppercase tracking-[0.32em] text-ink/65">
                  {formatSLE(appliedCoupon.discount)} kept aside
                </p>
              </div>
              <button
                type="button"
                onClick={clearCoupon}
                className="text-[10px] uppercase tracking-[0.32em] text-ink/55 underline-offset-4 hover:text-ink hover:underline"
              >
                Remove
              </button>
            </div>
          ) : (
            <div>
              <div className="flex items-end gap-4 border-b border-ink/25 pb-2 focus-within:border-brand-gold">
                <input
                  type="text"
                  placeholder="Coupon code"
                  value={couponInput}
                  onChange={(e) => setCouponInput(e.target.value)}
                  className="flex-1 bg-transparent font-display text-lg uppercase tracking-[0.2em] text-ink placeholder:normal-case placeholder:tracking-normal placeholder:text-ink/35 focus:outline-none"
                />
                <button
                  type="button"
                  onClick={applyCoupon}
                  disabled={couponPending || !couponInput.trim()}
                  className="pb-1 text-[10px] uppercase tracking-[0.32em] text-ink/75 transition-colors hover:text-brand-gold disabled:opacity-40"
                >
                  {couponPending ? "Applying…" : "Apply"}
                </button>
              </div>
              {couponError && (
                <p className="mt-2 font-serif text-sm italic text-brand-rose">
                  {couponError}
                </p>
              )}
            </div>
          )}
        </Section>
      </form>

      {/* Sticky summary */}
      <aside className="h-fit border border-ink/12 bg-parchment-soft p-8 lg:sticky lg:top-24">
        <p className="text-[10px] uppercase tracking-[0.4em] text-brand-gold">
          Your bag
        </p>
        <h3 className="mt-2 font-display text-2xl font-light italic leading-none text-ink">
          Order summary
        </h3>

        <ul className="mt-7 space-y-5 border-y border-ink/12 py-5">
          {items.map((item) => (
            <li
              key={item.variantId}
              className="flex items-start justify-between gap-3"
            >
              <div>
                <p className="font-display text-lg text-ink">
                  {item.productName}
                </p>
                <p className="text-[10px] uppercase tracking-[0.28em] text-ink/55">
                  {item.size} × {item.quantity}
                </p>
              </div>
              <p className="font-display text-base tabular-nums text-ink">
                {formatSLE(item.price * item.quantity)}
              </p>
            </li>
          ))}
        </ul>

        <dl className="mt-5 space-y-3 text-[11px] uppercase tracking-[0.28em]">
          <Row label="Subtotal" value={formatSLE(subtotal)} />
          <Row label="Delivery" value={deliveryFee === 0 ? "Free" : formatSLE(deliveryFee)} />
          {discount > 0 && (
            <Row
              label="Carte"
              value={`− ${formatSLE(discount)}`}
              accent
            />
          )}
        </dl>

        <div className="mt-6 flex items-baseline justify-between border-t border-ink/20 pt-5">
          <span className="text-[10px] uppercase tracking-[0.4em] text-ink/65">
            Total
          </span>
          <span className="font-display text-3xl font-light tabular-nums text-ink">
            {formatSLE(total)}
          </span>
        </div>

        <button
          type="button"
          onClick={handleSubmit(onSubmit)}
          disabled={isSubmitting || items.length === 0}
          className="group mt-8 inline-flex w-full items-center justify-center gap-3 rounded-full bg-ink px-8 py-4 text-[11px] uppercase tracking-[0.32em] text-parchment transition-all duration-500 hover:bg-brand-gold hover:text-ink disabled:opacity-40"
        >
          {isSubmitting ? "Processing…" : "Complete the order"}
          {!isSubmitting && (
            <span className="inline-block transition-transform duration-500 group-hover:translate-x-1">
              →
            </span>
          )}
        </button>

        <p className="mt-4 text-center text-[10px] uppercase tracking-[0.32em] text-ink/45">
          — Payments via Monime —
        </p>
      </aside>
    </div>
  );
}

function Section({
  eyebrow,
  title,
  children,
}: {
  eyebrow: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section>
      <header className="mb-7">
        <p className="text-[10px] uppercase tracking-[0.5em] text-brand-gold">
          {eyebrow}
        </p>
        <h2 className="mt-2 font-display text-2xl font-light text-ink sm:text-3xl">
          {title}
        </h2>
      </header>
      {children}
    </section>
  );
}

type FieldProps = React.InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  error?: string;
};

// eslint-disable-next-line react/display-name
const UnderlineField = ({
  label,
  error,
  className,
  ...props
}: FieldProps & { ref?: React.Ref<HTMLInputElement> }) => {
  return (
    <label className="flex flex-col gap-2">
      <span className="text-[10px] uppercase tracking-[0.32em] text-ink/55">
        {label}
      </span>
      <input
        {...props}
        className={cn(
          "border-b border-ink/25 bg-transparent pb-2 font-display text-lg text-ink placeholder:text-ink/30 focus:border-brand-gold focus:outline-none",
          className,
        )}
      />
      {error && (
        <span className="font-serif text-xs italic text-brand-rose">{error}</span>
      )}
    </label>
  );
};

function ZoneSelect({
  label,
  zones,
  value,
  onChange,
  error,
}: {
  label: string;
  zones: DeliveryZone[];
  value: string;
  onChange: (id: string) => void;
  error?: string;
}) {
  return (
    <label className="flex flex-col gap-2">
      <span className="text-[10px] uppercase tracking-[0.32em] text-ink/55">
        {label}
      </span>
      <div className="relative">
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full appearance-none border-b border-ink/25 bg-transparent pb-2 pr-8 font-display text-lg text-ink focus:border-brand-gold focus:outline-none"
        >
          {zones.map((zone) => (
            <option key={zone.id} value={zone.id}>
              {zone.name} — {zone.fee === 0 ? "Free (SLE 0.00)" : formatSLE(zone.fee)}
            </option>
          ))}
        </select>
        <span className="pointer-events-none absolute right-1 top-1 text-ink/55">
          ▾
        </span>
      </div>
      {error && (
        <span className="font-serif text-xs italic text-brand-rose">{error}</span>
      )}
    </label>
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
      className={cn(
        "flex justify-between",
        accent ? "text-brand-gold" : "text-ink/65",
      )}
    >
      <dt>{label}</dt>
      <dd
        className={cn(
          "font-display text-base normal-case tracking-normal tabular-nums",
          accent ? "text-brand-gold" : "text-ink",
        )}
      >
        {value}
      </dd>
    </div>
  );
}
