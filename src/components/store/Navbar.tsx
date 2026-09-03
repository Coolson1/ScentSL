import Link from "next/link";
import { cookies } from "next/headers";

import { auth } from "@/lib/auth";
import { CART_SESSION_COOKIE, getCartItemCount } from "@/lib/cart";
import { UserMenu } from "./UserMenu";
import { NavbarShell } from "./NavbarShell";

async function loadHeaderState() {
  try {
    const session = await auth();
    const cookieStore = await cookies();
    const guestSessionId = cookieStore.get(CART_SESSION_COOKIE)?.value ?? null;

    const cartCount = await getCartItemCount({
      userId: session?.user?.id ?? null,
      sessionId: session?.user?.id ? null : guestSessionId,
    });

    return { session, cartCount };
  } catch (error) {
    console.error("[Navbar] Failed to load header state:", error);
    return { session: null, cartCount: 0 };
  }
}

export async function Navbar() {
  const { session, cartCount } = await loadHeaderState();

  const userSlot = session?.user?.id ? (
    <UserMenu
      email={session.user.email ?? ""}
      name={session.user.name}
      role={session.user.role}
    />
  ) : (
    <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.25em] sm:gap-3 sm:text-[11px] sm:tracking-[0.3em]">
      <Link
        href="/auth/signin"
        className="text-ink/75 transition-colors hover:text-brand-gold"
      >
        Sign in
      </Link>
    </div>
  );

  return <NavbarShell cartCount={cartCount} userSlot={userSlot} />;
}
