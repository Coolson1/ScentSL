import Link from "next/link";
import {
  TrendingUp,
  ShoppingBag,
  Package,
  AlertTriangle,
  ArrowRight,
} from "lucide-react";

import { prisma } from "@/lib/prisma";
import { formatSLE } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatCard } from "@/components/admin/StatCard";
import { RevenueChart, type RevenuePoint } from "@/components/admin/RevenueChart";
import { OrderStatusChart, type StatusSlice } from "@/components/admin/OrderStatusChart";
import { OrderStatus, PaymentStatus } from "@/generated/prisma/enums";

function startOfToday() {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
}

function thirtyDaysAgo() {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() - 29);
  return d;
}

function bucketRevenue(orders: { createdAt: Date; total: number }[]): RevenuePoint[] {
  const buckets = new Map<string, number>();
  const start = thirtyDaysAgo();
  for (let i = 0; i < 30; i++) {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    buckets.set(d.toISOString().slice(0, 10), 0);
  }
  for (const o of orders) {
    const key = o.createdAt.toISOString().slice(0, 10);
    buckets.set(key, (buckets.get(key) ?? 0) + o.total);
  }
  return Array.from(buckets.entries()).map(([day, total]) => ({ day, total }));
}

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  const today = startOfToday();
  const monthStart = thirtyDaysAgo();

  const [
    revenueTodayAgg,
    ordersTodayCount,
    activeProductsCount,
    lowStockCount,
    last30Orders,
    statusGroups,
  ] = await Promise.all([
    prisma.order.aggregate({
      where: {
        paymentStatus: PaymentStatus.PAID,
        status: { not: OrderStatus.CANCELLED },
        createdAt: { gte: today },
      },
      _sum: { total: true },
    }),
    prisma.order.count({ where: { createdAt: { gte: today } } }),
    prisma.product.count({ where: { isActive: true } }),
    prisma.productVariant.count({ where: { stock: { lt: 5, gt: 0 } } }),
    prisma.order.findMany({
      where: {
        paymentStatus: PaymentStatus.PAID,
        status: { not: OrderStatus.CANCELLED },
        createdAt: { gte: monthStart },
      },
      select: { createdAt: true, total: true },
    }),
    prisma.order.groupBy({
      by: ["status"],
      _count: { _all: true },
    }),
  ]);

  const revenuePoints = bucketRevenue(last30Orders);
  const statusSlices: StatusSlice[] = statusGroups.map((g) => ({
    status: g.status,
    count: g._count._all,
  }));

  return (
    <div className="space-y-8">
      <header>
        <h1 className="font-serif text-3xl text-brand-black">Dashboard</h1>
        <p className="text-sm text-muted-foreground">
          Store performance at a glance.
        </p>
      </header>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Revenue today"
          value={formatSLE(revenueTodayAgg._sum.total ?? 0)}
          icon={TrendingUp}
        />
        <StatCard
          label="Orders today"
          value={String(ordersTodayCount)}
          icon={ShoppingBag}
        />
        <StatCard
          label="Active products"
          value={String(activeProductsCount)}
          icon={Package}
        />
        <StatCard
          label="Low stock"
          value={String(lowStockCount)}
          sublabel="Variants with < 5 in stock"
          icon={AlertTriangle}
          accent={lowStockCount > 0 ? "warning" : "gold"}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="font-serif text-xl">
              Revenue (last 30 days)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <RevenueChart data={revenuePoints} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="font-serif text-xl">
              Orders by status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <OrderStatusChart data={statusSlices} />
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Link
          href="/admin/orders?status=PENDING"
          className="group flex items-center justify-between rounded-md border border-brand-gold/30 bg-white px-5 py-4 text-sm transition-colors hover:border-brand-gold hover:bg-brand-gold/5"
        >
          <span className="text-brand-black">View pending orders</span>
          <ArrowRight className="size-4 text-brand-gold transition-transform group-hover:translate-x-0.5" />
        </Link>
        <Link
          href="/admin/inventory?filter=low"
          className="group flex items-center justify-between rounded-md border border-brand-gold/30 bg-white px-5 py-4 text-sm transition-colors hover:border-brand-gold hover:bg-brand-gold/5"
        >
          <span className="text-brand-black">View low-stock items</span>
          <ArrowRight className="size-4 text-brand-gold transition-transform group-hover:translate-x-0.5" />
        </Link>
      </div>
    </div>
  );
}
