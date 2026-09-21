import { Footer } from "@/components/store/Footer";
import { Navbar } from "@/components/store/Navbar";
import { CookieConsent } from "@/components/store/CookieConsent";
import { mergeGuestCart } from "@/lib/actions/merge-cart";

export default async function StoreLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Idempotent — only does work for signed-in users with a lingering
  // cart-session cookie. Cheap no-op for everyone else.
  try {
    await mergeGuestCart();
  } catch (error) {
    console.error("[StoreLayout] mergeGuestCart failed:", error);
  }

  return (
    <div className="flex min-h-screen flex-col bg-parchment text-ink antialiased">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:rounded-md focus:bg-brand-gold focus:px-4 focus:py-2 focus:text-ink focus:font-medium focus:shadow-lg focus:outline-none"
      >
        Skip to main content
      </a>
      <Navbar />
      <main id="main-content" className="flex-1" tabIndex={-1}>
        {children}
      </main>
      <Footer />
      <CookieConsent />
    </div>
  );
}
