import { redirect } from "next/navigation";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatSLE } from "@/lib/utils";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { CouponDialog, EditCouponButton } from "@/components/admin/CouponDialog";
import { CouponActiveToggle } from "@/components/admin/CouponActiveToggle";

export default async function AdminDiscountsPage() {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") redirect("/admin");

  const coupons = await prisma.coupon.findMany({
    orderBy: [{ isActive: "desc" }, { code: "asc" }],
  });

  return (
    <div className="space-y-6">
      <header className="flex items-end justify-between">
        <div>
          <h1 className="font-serif text-3xl text-brand-black">Discounts</h1>
          <p className="text-sm text-muted-foreground">
            {coupons.length} {coupons.length === 1 ? "coupon" : "coupons"} ·
            admin only
          </p>
        </div>
        <CouponDialog />
      </header>

      <div className="rounded-md border bg-white">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Code</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Value</TableHead>
              <TableHead>Min order</TableHead>
              <TableHead>Uses</TableHead>
              <TableHead>Expires</TableHead>
              <TableHead>Active</TableHead>
              <TableHead className="text-right">Edit</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {coupons.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={8}
                  className="py-8 text-center text-sm text-muted-foreground"
                >
                  No coupons yet.
                </TableCell>
              </TableRow>
            ) : (
              coupons.map((c) => (
                <TableRow key={c.id}>
                  <TableCell className="font-mono font-medium uppercase">
                    {c.code}
                  </TableCell>
                  <TableCell className="text-xs uppercase tracking-wider text-muted-foreground">
                    {c.type}
                  </TableCell>
                  <TableCell>
                    {c.type === "PERCENTAGE"
                      ? `${c.value}%`
                      : formatSLE(c.value)}
                  </TableCell>
                  <TableCell>
                    {c.minOrder ? formatSLE(c.minOrder) : "None"}
                  </TableCell>
                  <TableCell>
                    {c.usedCount}
                    {c.maxUses ? ` / ${c.maxUses}` : " / ∞"}
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    {c.expiresAt
                      ? c.expiresAt.toLocaleDateString("en-GB", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                        })
                      : "Never"}
                  </TableCell>
                  <TableCell>
                    <CouponActiveToggle
                      couponId={c.id}
                      isActive={c.isActive}
                    />
                  </TableCell>
                  <TableCell className="text-right">
                    <EditCouponButton
                      coupon={{
                        id: c.id,
                        code: c.code,
                        type: c.type,
                        value: c.value,
                        minOrder: c.minOrder,
                        maxUses: c.maxUses,
                        expiresAt: c.expiresAt,
                        isActive: c.isActive,
                      }}
                    />
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
