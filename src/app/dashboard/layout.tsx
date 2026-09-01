import { ReactNode } from "react";
import Link from "next/link";
import Image from "next/image";
import { ChevronLeft } from "lucide-react";

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-parchment">
      <header className="border-b border-ink/10 bg-white/80 backdrop-blur-sm">
        <div className="mx-auto max-w-6xl px-4 py-4">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-[10px] uppercase tracking-[0.32em] text-ink/70 hover:text-ink"
          >
            <ChevronLeft className="h-4 w-4" />
            <Image
              src="/scentsl.jpeg"
              alt="ScentSL Logo"
              width={20}
              height={20}
              className="h-5 w-5 rounded-full object-cover border border-brand-gold/40"
            />
            ScentSL
          </Link>
        </div>
      </header>
      <main>{children}</main>
    </div>
  );
}