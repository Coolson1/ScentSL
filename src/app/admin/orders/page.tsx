import Link from "next/link";

import { prisma } from "@/lib/prisma";
import { formatSLE } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { OrderStatus } from "@/generated/prisma/enums";

const STATUSES = Object.values(OrderStatus);
const FILTER_LINKS: { label: string; value: string | undefined }[] = [
  { label: "All", value: undefined },
  { label: "Pending", value: "PENDING" },
  { label: "Paid", value: "PAID" },
  { label: "Processing", value: "PROCESSING" },
  { label: "Shipped", value: "SHIPPED" },
  { label: "Delivered", value: "DELIVERED" },
  { label: "Cancelled", value: "CANCELLED" },
];

type SearchParams = Promise<{ status?: string; q?: string }>;

export default async function AdminOrdersPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const { status: statusParam, q } = await searchParams;
  const search = q?.trim() ?? "";
  const status = statusParam && STATUSES.includes(statusParam as OrderStatus)
    ? (statusParam as OrderStatus)
    : undefined;

  const orders = await prisma.order.findMany({
    where: {
      ...(status ? { status } : {}),
      ...(search
        ? {
            OR: [
              { id: { contains: search, mode: "insensitive" } },
              { guestEmail: { contains: search, mode: "insensitive" } },
              { user: { email: { contains: search, mode: "insensitive" } } },
            ],
          }
        : {}),
    },
    include: {
      user: { select: { name: true, email: true } },
      items: { select: { vendor: { select: { id: true, businessName: true } }, product: { select: { name: true } } } },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-6">
      <header>
        <h1 className="font-serif text-3xl text-brand-black">Orders</h1>
        <p className="text-sm text-muted-foreground">
          {orders.length} {orders.length === 1 ? "order" : "orders"}
          {status && ` · ${status.toLowerCase()}`}
        </p>
      </header>

      <div className="flex flex-wrap items-center gap-2">
        {FILTER_LINKS.map((link) => {
          const active = (link.value ?? "") === (status ?? "");
          const href = link.value
            ? `/admin/orders?status=${link.value}`
            : "/admin/orders";
          return (
            <Link
              key={link.label}
              href={href}
              className={`rounded-full border px-3 py-1 text-xs uppercase tracking-wider ${
                active
                  ? "border-brand-gold bg-brand-gold/15 text-brand-gold"
                  : "border-border text-muted-foreground hover:border-brand-gold/40 hover:text-brand-black"
              }`}
            >
              {link.label}
            </Link>
          );
        })}
      </div>

      <form className="flex gap-2" method="get">
        {status && <input type="hidden" name="status" value={status} />}
        <Input
          name="q"
          defaultValue={search}
          placeholder="Search by order ID or customer email…"
          className="max-w-md"
        />
        <Button type="submit" variant="outline">
          Search
        </Button>
      </form>

      <div className="rounded-md border bg-white">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Order ID</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Products</TableHead>
              <TableHead>Vendors</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Total</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">View</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {orders.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={8}
                  className="py-8 text-center text-sm text-muted-foreground"
                >
                  No orders match your filters.
                </TableCell>
              </TableRow>
            ) : (
              orders.map((o) => {
                const vendorNames = Array.from(
                  new Set(
                    o.items
                      .map((i) => i.vendor?.businessName)
                      .filter((name): name is string => Boolean(name))
                  )
                );
                const productNames = Array.from(
                  new Set(o.items.map((i) => i.product?.name).filter(Boolean))
                );

                return (
                  <TableRow key={o.id}>
                    <TableCell className="font-mono text-xs">
                      {o.id.slice(0, 10)}…
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        {o.user?.name ?? o.user?.email ?? o.guestEmail ?? "Guest"}
                      </div>
                      {o.user?.email && o.user.name && (
                        <div className="text-xs text-muted-foreground">
                          {o.user.email}
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      {productNames.length === 0 ? (
                        <span className="text-xs text-muted-foreground italic">-</span>
                      ) : (
                        <div className="flex flex-col gap-0.5">
                          {productNames.map((name) => (
                            <span key={name} className="text-xs text-brand-black line-clamp-1" title={name}>
                              {name}
                            </span>
                          ))}
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      {vendorNames.length === 0 ? (
                        <span className="text-xs text-muted-foreground italic">Unassigned</span>
                      ) : (
                        <div className="flex flex-wrap gap-1">
                          {vendorNames.map((name) => (
                            <span key={name} className="inline-block rounded-full bg-brand-gold/15 px-2 py-0.5 text-[11px] font-medium text-brand-black">
                              {name}
                            </span>
                          ))}
                        </div>
                      )}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {o.createdAt.toLocaleDateString("en-GB", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      })}
                    </TableCell>
                    <TableCell>{formatSLE(o.total)}</TableCell>
                    <TableCell>
                      <StatusBadge status={o.status} />
                    </TableCell>
                    <TableCell className="text-right">
                      <Link
                        href={`/admin/orders/${o.id}`}
                        className="text-sm text-brand-gold hover:underline"
                      >
                      View →
                      </Link>
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
