"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { StockEditor } from "./StockEditor";

type Row = {
  variantId: string;
  size: string;
  sku: string | null;
  stock: number;
  productId: string;
  productName: string;
  categoryName: string;
};

function stockLabel(stock: number) {
  if (stock === 0) return { label: "Out of stock", className: "bg-red-100 text-red-700 hover:bg-red-100" };
  if (stock < 5) return { label: "Low stock", className: "bg-amber-100 text-amber-700 hover:bg-amber-100" };
  return { label: "In stock", className: "bg-emerald-100 text-emerald-700 hover:bg-emerald-100" };
}

export function InventoryTable({ rows }: { rows: Row[] }) {
  const router = useRouter();
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [delta, setDelta] = useState<string>("");
  const [applying, setApplying] = useState(false);

  const allSelected = rows.length > 0 && selected.size === rows.length;

  function toggleAll(value: boolean) {
    setSelected(value ? new Set(rows.map((r) => r.variantId)) : new Set());
  }

  function toggleOne(id: string, value: boolean) {
    const next = new Set(selected);
    if (value) next.add(id);
    else next.delete(id);
    setSelected(next);
  }

  async function applyBulk() {
    const numeric = Number(delta);
    if (!Number.isFinite(numeric) || numeric === 0 || !Number.isInteger(numeric)) {
      toast.error("Enter a non-zero integer delta");
      return;
    }
    if (selected.size === 0) {
      toast.error("Select at least one row");
      return;
    }

    setApplying(true);
    const res = await fetch("/api/admin/inventory/bulk", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ids: Array.from(selected), delta: numeric }),
    });
    setApplying(false);

    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      toast.error(body?.error ?? "Bulk update failed");
      return;
    }
    const body = await res.json();
    toast.success(`Updated ${body.updated} variant${body.updated === 1 ? "" : "s"}`);
    setSelected(new Set());
    setDelta("");
    router.refresh();
  }

  return (
    <div className="space-y-4">
      {selected.size > 0 && (
        <div className="flex flex-wrap items-center gap-2 sm:gap-3 rounded-md border border-brand-gold/40 bg-brand-gold/5 p-2 sm:p-3 text-xs sm:text-sm">
          <span className="text-brand-black whitespace-nowrap">
            {selected.size} selected
          </span>
          <Input
            type="number"
            placeholder="Delta"
            value={delta}
            onChange={(e) => setDelta(e.target.value)}
            className="w-24 sm:w-40"
          />
          <Button
            type="button"
            disabled={applying}
            onClick={applyBulk}
            className="bg-brand-gold text-brand-black hover:bg-brand-gold-light"
          >
            {applying ? "Applying…" : "Apply delta"}
          </Button>
          <Button
            type="button"
            variant="ghost"
            onClick={() => setSelected(new Set())}
          >
            Clear selection
          </Button>
        </div>
      )}

      <div className="rounded-md border bg-white overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-10">  <Checkbox
                  checked={allSelected}
                  onCheckedChange={(v) => toggleAll(Boolean(v))}
                  aria-label="Select all"
                />
              </TableHead>
              <TableHead className="min-w-[150px]">Product</TableHead>
              <TableHead className="min-w-[80px]">Size</TableHead>
              <TableHead className="min-w-[80px]">SKU</TableHead>
              <TableHead className="min-w-[100px]">Status</TableHead>
              <TableHead className="min-w-[120px]">Stock</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="py-8 text-center text-sm text-muted-foreground"
                >
                  No variants match this filter.
                </TableCell>
              </TableRow>
            ) : (
              rows.map((r) => {
                const status = stockLabel(r.stock);
                return (
                  <TableRow key={r.variantId}>
                    <TableCell>
                      <Checkbox
                        checked={selected.has(r.variantId)}
                        onCheckedChange={(v) => toggleOne(r.variantId, Boolean(v))}
                        aria-label={`Select ${r.productName} ${r.size}`}
                      />
                    </TableCell>
                    <TableCell>
                      <Link
                        href={`/admin/products/${r.productId}`}
                        className="font-medium hover:text-brand-gold"
                      >
                        {r.productName}
                      </Link>
                      <div className="text-xs text-muted-foreground">
                        {r.categoryName}
                      </div>
                    </TableCell>
                    <TableCell>{r.size}</TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {r.sku ?? "N/A"}
                    </TableCell>
                    <TableCell>
                      <Badge className={status.className}>{status.label}</Badge>
                    </TableCell>
                    <TableCell>
                      <StockEditor
                        variantId={r.variantId}
                        initialStock={r.stock}
                      />
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
