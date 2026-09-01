import Link from "next/link";
import { notFound } from "next/navigation";

import { prisma } from "@/lib/prisma";
import { formatSLE } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Separator } from "@/components/ui/separator";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { OrderStatusControl } from "@/components/admin/OrderStatusControl";

export default async function AdminOrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const order = await prisma.order.findUnique({
    where: { id },
    include: {
      user: true,
      items: { include: { product: true, variant: true, vendor: true } },
      address: { include: { deliveryZone: true } },
      coupon: true,
      deliveryZone: true,
    },
  });

  if (!order) notFound();

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <Link
            href="/admin/orders"
            className="text-xs uppercase tracking-widest text-muted-foreground hover:text-brand-gold"
          >
            ← Back to orders
          </Link>
          <h1 className="mt-2 font-serif text-3xl text-brand-black">
            Order {order.id.slice(0, 10)}…
          </h1>
          <p className="text-sm text-muted-foreground">
            Placed{" "}
            {order.createdAt.toLocaleDateString("en-GB", {
              day: "2-digit",
              month: "short",
              year: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            })}
          </p>
        </div>
        <StatusBadge status={order.status} />
      </header>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="font-serif text-xl">Items & Vendor Allocation</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Product</TableHead>
                  <TableHead>Vendor / Partner</TableHead>
                  <TableHead>Variant</TableHead>
                  <TableHead className="text-right">Qty</TableHead>
                  <TableHead className="text-right">Price</TableHead>
                  <TableHead className="text-right">ScentSL Fee</TableHead>
                  <TableHead className="text-right">Vendor Net</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {order.items.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium">
                      {item.product.name}
                    </TableCell>
                    <TableCell>
                      {item.vendor ? (
                        <Link
                          href={`/admin/vendors/${item.vendor.id}`}
                          className="font-medium text-brand-black hover:text-brand-gold"
                        >
                          {item.vendor.businessName}
                        </Link>
                      ) : (
                        <span className="text-xs text-muted-foreground italic">Unassigned</span>
                      )}
                    </TableCell>
                    <TableCell>{item.variant.size}</TableCell>
                    <TableCell className="text-right">{item.quantity}</TableCell>
                    <TableCell className="text-right">
                      {formatSLE(item.price * item.quantity)}
                    </TableCell>
                    <TableCell className="text-right text-xs text-brand-gold font-semibold">
                      {formatSLE(item.commissionAmount)} ({item.commissionRate}%)
                    </TableCell>
                    <TableCell className="text-right font-semibold text-emerald-700">
                      {formatSLE(item.vendorAmount)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="font-serif text-xl">Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <SummaryRow label="Subtotal" value={formatSLE(order.subtotal)} />
            <SummaryRow
              label={`Delivery (${order.deliveryZone.name})`}
              value={formatSLE(order.deliveryFee)}
            />
            {order.discount > 0 && (
              <SummaryRow
                label={order.coupon ? `Discount (${order.coupon.code})` : "Discount"}
                value={`−${formatSLE(order.discount)}`}
              />
            )}
            <Separator />
            <SummaryRow label="Total" value={formatSLE(order.total)} bold />
            <div className="pt-4 text-xs text-muted-foreground">
              {order.monimeReference && (
                <p>
                  Monime ref:{" "}
                  <span className="font-mono">{order.monimeReference}</span>
                </p>
              )}
              {order.monimeSessionId && (
                <p>
                  Session ID:{" "}
                  <span className="font-mono">{order.monimeSessionId}</span>
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="font-serif text-xl">Customer</CardTitle>
          </CardHeader>
          <CardContent className="space-y-1 text-sm">
            <p className="font-medium">
              {order.user?.name ?? "Guest customer"}
            </p>
            <p className="text-muted-foreground">
              {order.user?.email ?? order.guestEmail ?? "—"}
            </p>
            {order.user && (
              <p className="text-xs text-muted-foreground">
                Account since{" "}
                {order.user.createdAt.toLocaleDateString("en-GB", {
                  day: "2-digit",
                  month: "short",
                  year: "numeric",
                })}
              </p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="font-serif text-xl">Delivery</CardTitle>
          </CardHeader>
          <CardContent className="space-y-1 text-sm">
            <p className="font-medium">{order.address.recipientName}</p>
            <p>{order.address.phone}</p>
            <p>{order.address.streetAddress}</p>
            <p>{order.address.city}</p>
            <p className="pt-2 text-xs uppercase tracking-wider text-muted-foreground">
              Zone: {order.address.deliveryZone.name}
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="font-serif text-xl">Update status</CardTitle>
        </CardHeader>
        <CardContent>
          <OrderStatusControl orderId={order.id} current={order.status} />
        </CardContent>
      </Card>
    </div>
  );
}

function SummaryRow({
  label,
  value,
  bold,
}: {
  label: string;
  value: string;
  bold?: boolean;
}) {
  return (
    <div className="flex justify-between">
      <span className={bold ? "font-medium" : "text-muted-foreground"}>
        {label}
      </span>
      <span className={bold ? "font-medium" : ""}>{value}</span>
    </div>
  );
}
