"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";

export function ToggleFeaturedButton({
  productId,
  productName,
  isFeatured,
}: {
  productId: string;
  productName: string;
  isFeatured: boolean;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleToggle() {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/products/${productId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isFeatured: !isFeatured }),
      });

      if (!res.ok) {
        throw new Error("Failed to update featured status");
      }

      toast.success(
        !isFeatured
          ? `"${productName}" added to Hero slider`
          : `"${productName}" removed from Hero slider`
      );
      router.refresh();
    } catch (err) {
      toast.error("Could not update Hero featured status");
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      type="button"
      onClick={handleToggle}
      disabled={loading}
      title={isFeatured ? "Remove from Hero Carousel" : "Add to Hero Carousel"}
      className="inline-flex cursor-pointer items-center transition-transform hover:scale-105 active:scale-95 disabled:opacity-50"
    >
      {isFeatured ? (
        <Badge className="border-amber-500/40 bg-amber-500/20 text-amber-800 hover:bg-amber-500/30 dark:text-amber-300">
          ★ Hero Featured
        </Badge>
      ) : (
        <Badge variant="outline" className="border-ink/20 text-ink/50 hover:border-brand-gold hover:text-brand-gold">
          + Add to Hero
        </Badge>
      )}
    </button>
  );
}
