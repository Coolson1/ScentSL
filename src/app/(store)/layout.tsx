import { Footer } from "@/components/store/Footer";
import { Navbar } from "@/components/store/Navbar";
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
      <Navbar />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}
