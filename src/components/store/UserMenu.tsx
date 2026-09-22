"use client";

import Link from "next/link";
import { signOut } from "next-auth/react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

type Props = {
  email: string;
  name?: string | null;
  role: "CUSTOMER" | "STAFF" | "ADMIN";
};

export function UserMenu({ email, name, role }: Props) {
  const initial = (name ?? email).charAt(0).toUpperCase();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        aria-label="Account menu"
        className="group inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.3em] text-ink/85 transition-colors hover:text-brand-gold"
      >
        <span className="inline-flex size-7 items-center justify-center rounded-full border border-ink/30 font-display text-sm normal-case tracking-normal text-ink transition-colors group-hover:border-brand-gold group-hover:text-brand-gold">
          {initial}
        </span>
        <span className="hidden md:inline">Account</span>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="w-60 border-ink/15 bg-parchment-soft p-2 text-ink"
      >
        <DropdownMenuGroup>
          <DropdownMenuLabel className="px-3 py-3">
            <div className="flex flex-col">
              <span className="font-display text-base font-light text-ink">
                {name ?? "Bonjour"}
              </span>
              <span className="mt-0.5 text-[10px] uppercase tracking-[0.32em] text-ink/55">
                {email}
              </span>
            </div>
          </DropdownMenuLabel>
        </DropdownMenuGroup>
        <DropdownMenuSeparator className="bg-ink/10" />
        <DropdownMenuItem
          render={<Link href="/account" />}
          className="text-[11px] uppercase tracking-[0.28em] text-ink/80 focus:bg-parchment-deep focus:text-ink"
        >
          Profile
        </DropdownMenuItem>
        <DropdownMenuItem
          render={<Link href="/account/orders" />}
          className="text-[11px] uppercase tracking-[0.28em] text-ink/80 focus:bg-parchment-deep focus:text-ink"
        >
          Orders
        </DropdownMenuItem>
        <DropdownMenuItem
          render={<Link href="/account/notifications" />}
          className="text-[11px] uppercase tracking-[0.28em] text-ink/80 focus:bg-parchment-deep focus:text-ink"
        >
          Notifications
        </DropdownMenuItem>
        <DropdownMenuItem
          render={<Link href="/wishlist" />}
          className="text-[11px] uppercase tracking-[0.28em] text-ink/80 focus:bg-parchment-deep focus:text-ink"
        >
          Wishlist
        </DropdownMenuItem>
        <DropdownMenuItem
           render={<Link href="/dashboard/find-your-scent" />}
          className="text-[11px] uppercase tracking-[0.28em] text-ink/80 focus:bg-parchment-deep focus:text-ink"
        >
           Find Your Scent
        </DropdownMenuItem>
        {role !== "CUSTOMER" && (
          <>
            <DropdownMenuSeparator className="bg-ink/10" />
            <DropdownMenuItem
              render={<Link href="/admin" />}
              className="text-[11px] uppercase tracking-[0.28em] text-brand-gold focus:bg-parchment-deep focus:text-brand-gold"
            >
              Admin panel
            </DropdownMenuItem>
            <DropdownMenuItem
              render={<Link href="/admin/notifications" />}
              className="text-[11px] uppercase tracking-[0.28em] text-brand-gold focus:bg-parchment-deep focus:text-brand-gold"
            >
              Push Broadcasts
            </DropdownMenuItem>
          </>
        )}
        <DropdownMenuSeparator className="bg-ink/10" />
        <DropdownMenuItem
          onClick={() => signOut({ redirectTo: "/" })}
          className="text-[11px] uppercase tracking-[0.28em] text-ink/65 focus:bg-parchment-deep focus:text-brand-rose"
        >
          Sign out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
