"use client";

import Link from "next/link";
import Image from "next/image";
import { Suspense, useState } from "react";
import { signIn } from "next-auth/react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useSearchParams } from "next/navigation";

import { mergeGuestCart } from "@/lib/actions/merge-cart";
import { Ornament } from "@/components/store/Ornament";

const signInSchema = z.object({
  email: z.string().email("Enter a valid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

type SignInValues = z.infer<typeof signInSchema>;

export default function SignInPage() {
  return (
    <Suspense fallback={null}>
      <SignInForm />
    </Suspense>
  );
}

function SignInForm() {
  const params = useSearchParams();
  const callbackUrl = params.get("callbackUrl") ?? "/account";
  const urlError = params.get("error");

  const [submitError, setSubmitError] = useState<string | null>(
    urlError ? "Sign-in failed. Check your credentials and try again." : null,
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignInValues>({
    resolver: zodResolver(signInSchema),
    defaultValues: { email: "", password: "" },
  });

  async function onSubmit(values: SignInValues) {
    setSubmitError(null);
    setIsSubmitting(true);
    const result = await signIn("credentials", {
      email: values.email,
      password: values.password,
      redirect: false,
    });
    setIsSubmitting(false);

    if (!result || result.error) {
      setSubmitError("Invalid email or password.");
      return;
    }
    await mergeGuestCart().catch(() => undefined);
    window.location.href = callbackUrl;
  }

  return (
    <div className="relative isolate flex min-h-screen overflow-hidden bg-parchment">
      {/* Decorative ornaments */}
      <Ornament
        variant="botanical"
        className="pointer-events-none absolute -left-16 top-12 hidden h-[440px] w-[440px] text-brand-gold/22 lg:block"
      />
      <Ornament
        variant="sprig"
        className="pointer-events-none absolute -right-8 bottom-12 hidden h-[280px] w-[200px] -scale-x-100 text-ink/12 lg:block"
      />

      {/* Edition meta */}
      <div className="absolute left-0 right-0 top-0 z-10 mx-auto flex max-w-[1400px] items-center justify-between px-5 pt-6 text-[10px] uppercase tracking-[0.4em] text-ink/55 sm:px-8 lg:px-12">
        <Link href="/" className="flex items-center gap-2 hover:text-ink">
          <Image
            src="/scentsl.jpeg"
            alt="ScentSL Logo"
            width={20}
            height={20}
            className="h-5 w-5 rounded-full object-cover border border-brand-gold/40"
          />
          ← ScentSL
        </Link>
        <span>Vol. I · Maison</span>
      </div>

      {/* Form */}
      <div className="relative mx-auto flex w-full max-w-md flex-col justify-center px-5 py-24 sm:px-8">
        <p className="text-[10px] uppercase tracking-[0.5em] text-brand-gold">
          Reader sign-in
        </p>
        <h1 className="mt-5 font-display text-[clamp(2.6rem,5vw,4rem)] font-light leading-[0.96] tracking-[-0.015em] text-ink">
          Welcome <em className="italic text-brand-gold">back.</em>
        </h1>
        <p className="mt-5 max-w-sm font-serif text-base leading-relaxed text-ink/70">
          Pick up where you left off — your bag, wishlist, and chapters are
          kept exactly as you left them.
        </p>

        <button
          type="button"
          onClick={() => signIn("google", { redirectTo: callbackUrl })}
          className="mt-10 inline-flex w-full items-center justify-center gap-3 rounded-full border border-ink/25 bg-transparent px-6 py-3.5 text-[11px] uppercase tracking-[0.32em] text-ink transition-colors hover:border-brand-gold hover:text-brand-gold"
        >
          <GoogleMark />
          Continue with Google
        </button>

        <div className="my-9 flex items-center gap-4 text-[10px] uppercase tracking-[0.4em] text-ink/45">
          <span className="inline-block h-px flex-1 bg-ink/15" />
          or by email
          <span className="inline-block h-px flex-1 bg-ink/15" />
        </div>

        <form
          onSubmit={handleSubmit(onSubmit)}
          noValidate
          className="space-y-8"
        >
          <UnderlineField
            label="Email"
            type="email"
            autoComplete="email"
            placeholder="you@maison.com"
            error={errors.email?.message}
            {...register("email")}
          />
          <UnderlineField
            label="Password"
            type="password"
            autoComplete="current-password"
            placeholder="••••••••"
            error={errors.password?.message}
            {...register("password")}
          />

          {submitError && (
            <p
              role="alert"
              className="border-l-2 border-brand-rose bg-brand-rose/8 px-4 py-3 font-serif text-sm italic text-brand-rose"
            >
              {submitError}
            </p>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="group inline-flex w-full items-center justify-center gap-3 rounded-full bg-ink px-7 py-4 text-[11px] uppercase tracking-[0.32em] text-parchment transition-all duration-500 hover:bg-brand-gold hover:text-ink disabled:opacity-50"
          >
            {isSubmitting ? "Signing in…" : "Sign in"}
            {!isSubmitting && (
              <span className="inline-block transition-transform duration-500 group-hover:translate-x-1">
                →
              </span>
            )}
          </button>
        </form>

        <p className="mt-10 text-center font-serif text-base italic text-ink/65">
          New to the maison?{" "}
          <Link
            href="/"
            className="text-ink underline-offset-4 hover:text-brand-gold hover:underline"
          >
            Browse the collection
          </Link>
        </p>
      </div>
    </div>
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
        className={`border-b border-ink/25 bg-transparent pb-2 font-display text-lg text-ink placeholder:text-ink/30 focus:border-brand-gold focus:outline-none ${className ?? ""}`}
      />
      {error && (
        <span className="font-serif text-xs italic text-brand-rose">{error}</span>
      )}
    </label>
  );
};

function GoogleMark() {
  return (
    <svg viewBox="0 0 18 18" className="size-4" aria-hidden>
      <path
        d="M17.64 9.2c0-.64-.06-1.25-.16-1.84H9v3.49h4.84a4.14 4.14 0 01-1.8 2.72v2.26h2.92c1.7-1.57 2.68-3.88 2.68-6.63z"
        fill="#4285F4"
      />
      <path
        d="M9 18c2.43 0 4.47-.81 5.96-2.18l-2.92-2.26c-.81.54-1.85.87-3.04.87-2.34 0-4.32-1.58-5.03-3.7H.96v2.32A9 9 0 009 18z"
        fill="#34A853"
      />
      <path
        d="M3.97 10.73a5.43 5.43 0 010-3.46V4.95H.96a9 9 0 000 8.1l3.01-2.32z"
        fill="#FBBC05"
      />
      <path
        d="M9 3.58c1.32 0 2.5.45 3.44 1.34l2.58-2.58A9 9 0 00.96 4.95l3.01 2.32C4.68 5.16 6.66 3.58 9 3.58z"
        fill="#EA4335"
      />
    </svg>
  );
}
