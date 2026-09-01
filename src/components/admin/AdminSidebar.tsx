"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Store,
  Package,
  Tag,
  ShoppingBag,
  Boxes,
  Percent,
  Truck,
  Users,
  LogOut,
  Menu,
} from "lucide-react";
import { signOut } from "next-auth/react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet";
import type { Role } from "@/generated/prisma/enums";

type NavLink = {
  label: string;
  href: string;
  icon: typeof LayoutDashboard;
  adminOnly?: boolean;
};

const NAV_LINKS: NavLink[] = [
  { label: "Overview", href: "/admin", icon: LayoutDashboard },
  { label: "Vendors", href: "/admin/vendors", icon: Store },
  { label: "Products", href: "/admin/products", icon: Package },
  { label: "Categories", href: "/admin/categories", icon: Tag },
  { label: "Orders", href: "/admin/orders", icon: ShoppingBag },
  { label: "Inventory", href: "/admin/inventory", icon: Boxes },
  { label: "Coupons", href: "/admin/coupons", icon: Percent },
  { label: "Shipping Rates", href: "/admin/shipping-rates", icon: Truck },
  { label: "Users", href: "/admin/users", icon: Users, adminOnly: true },
];

function NavList({ role }: { role: Role }) {
  const pathname = usePathname();

  return (
    <nav className="flex-1 space-y-1 px-3 py-4">
      {NAV_LINKS.map((link) => {
        if (link.adminOnly && role !== "ADMIN") return null;
        const isActive =
          link.href === "/admin"
            ? pathname === "/admin"
            : pathname.startsWith(link.href);

        return (
          <Link
            key={link.href}
            href={link.href}
            className={cn(
              "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
              isActive
                ? "bg-brand-gold/15 text-brand-gold font-semibold"
                : "text-brand-white/70 hover:bg-brand-gold/10 hover:text-brand-white"
            )}
          >
            <link.icon className="size-4 text-brand-gold" />
            {link.label}
          </Link>
        );
      })}
    </nav>
  );
}

function SidebarHeader() {
  return (
    <div className="px-6 py-6 border-b border-brand-gold/20 flex items-center gap-3">
      <div className="relative overflow-hidden rounded-full border border-brand-gold/40 shadow-sm shrink-0">
        <Image
          src="/scentsl.jpeg"
          alt="ScentSL Logo"
          width={36}
          height={36}
          className="h-9 w-9 rounded-full object-cover"
        />
      </div>
      <div>
        <Link href="/admin" className="font-serif text-2xl text-brand-gold">
          ScentSL
        </Link>
        <p className="text-[10px] uppercase tracking-[0.2em] text-brand-white/40">
          Admin Console
        </p>
      </div>
    </div>
  );
}

function SidebarFooter({ email, role }: { email: string; role: Role }) {
  return (
    <div className="border-t border-brand-gold/20 px-4 py-4">
      <div className="mb-3 text-xs text-brand-white/60">
        <p className="truncate text-brand-white/90">{email}</p>
        <p className="uppercase tracking-widest text-brand-gold/80">{role}</p>
      </div>
      <Button
        variant="outline"
        size="sm"
        className="w-full bg-transparent border-brand-gold/40 text-brand-white hover:bg-brand-gold/10 hover:text-brand-gold"
        onClick={() => signOut({ redirectTo: "/auth/signin" })}
      >
        <LogOut className="size-4" />
        Sign out
      </Button>
    </div>
  );
}

export function AdminSidebar({
  role,
  userEmail,
}: {
  role: Role;
  userEmail: string;
}) {
  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex lg:w-64 lg:flex-col lg:fixed lg:inset-y-0 lg:bg-brand-black lg:text-brand-white lg:border-r lg:border-brand-gold/20">
        <SidebarHeader />
        <NavList role={role} />
        <SidebarFooter email={userEmail} role={role} />
      </aside>

      {/* Mobile trigger */}
      <div className="lg:hidden flex items-center justify-between border-b border-brand-gold/20 bg-brand-black px-4 py-3 text-brand-white">
        <Link href="/admin" className="flex items-center gap-2 font-serif text-lg text-brand-gold">
          <Image
            src="/scentsl.jpeg"
            alt="ScentSL Logo"
            width={24}
            height={24}
            className="h-6 w-6 rounded-full object-cover border border-brand-gold/40"
          />
          ScentSL
        </Link>
        <Sheet>
          <SheetTrigger
            render={
              <Button
                variant="outline"
                size="sm"
                className="bg-transparent border-brand-gold/40 text-brand-white hover:bg-brand-gold/10"
              />
            }
          >
            <Menu className="size-4" />
          </SheetTrigger>
          <SheetContent
            side="left"
            className="w-full sm:w-72 bg-brand-black text-brand-white border-brand-gold/20 p-0 flex flex-col"
          >
            <SheetTitle className="sr-only">Admin navigation</SheetTitle>
            <SidebarHeader />
            <NavList role={role} />
            <SidebarFooter email={userEmail} role={role} />
          </SheetContent>
        </Sheet>
      </div>
    </>
  );
}
