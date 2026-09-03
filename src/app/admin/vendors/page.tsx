import Link from "next/link";
import { format } from "date-fns";
import { Store, ShoppingBag, DollarSign, Percent, Plus, Eye, Edit, ShieldAlert } from "lucide-react";

import { prisma } from "@/lib/prisma";
import { formatSLE } from "@/lib/utils";
import { VendorDialog } from "@/components/admin/VendorDialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { VendorStatus } from "@/generated/prisma/enums";

export const dynamic = "force-dynamic";
export const revalidate = 0;

function statusBadge(status: VendorStatus) {
  switch (status) {
    case VendorStatus.ACTIVE:
      return <Badge className="bg-emerald-500/15 text-emerald-700 hover:bg-emerald-500/25 border-emerald-500/30">Active</Badge>;
    case VendorStatus.PENDING:
      return <Badge className="bg-amber-500/15 text-amber-700 hover:bg-amber-500/25 border-amber-500/30">Pending</Badge>;
    case VendorStatus.SUSPENDED:
      return <Badge className="bg-rose-500/15 text-rose-700 hover:bg-rose-500/25 border-rose-500/30">Suspended</Badge>;
    case VendorStatus.INACTIVE:
      return <Badge className="bg-gray-500/15 text-gray-700 hover:bg-gray-500/25 border-gray-500/30">Inactive</Badge>;
  }
}

export default async function VendorsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; status?: string }>;
}) {
  const { q, status } = await searchParams;

  const where: any = {};
  if (status && Object.values(VendorStatus).includes(status as VendorStatus)) {
    where.status = status;
  }
  if (q) {
    where.OR = [
      { businessName: { contains: q, mode: "insensitive" } },
      { ownerName: { contains: q, mode: "insensitive" } },
      { email: { contains: q, mode: "insensitive" } },
    ];
  }

  const vendors = await prisma.vendor.findMany({
    where,
    include: {
      _count: { select: { products: true, orderItems: true } },
      orderItems: {
        where: {
          order: {
            paymentStatus: "PAID",
            status: { not: "CANCELLED" },
          },
        },
        select: {
          price: true,
          quantity: true,
          commissionAmount: true,
          vendorAmount: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  let grandTotalSales = 0;
  let grandTotalCommission = 0;
  let grandTotalVendorAmount = 0;

  const vendorsData = vendors.map((v) => {
    const totalSales = v.orderItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const totalCommission = v.orderItems.reduce((sum, item) => sum + item.commissionAmount, 0);
    const totalVendorAmount = v.orderItems.reduce((sum, item) => sum + item.vendorAmount, 0);

    grandTotalSales += totalSales;
    grandTotalCommission += totalCommission;
    grandTotalVendorAmount += totalVendorAmount;

    return {
      ...v,
      totalSales,
      totalCommission,
      totalVendorAmount,
    };
  });

  const activeVendorsCount = vendorsData.filter((v) => v.status === VendorStatus.ACTIVE).length;

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-serif text-3xl text-brand-black">Perfume Vendors</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Manage vendor accounts, commission rates, products, and payout balances.
          </p>
        </div>
        <VendorDialog />
      </div>

      {/* Metrics Row */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="border-brand-gold/20 bg-parchment-soft">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs uppercase tracking-widest text-muted-foreground">
              Total Vendors
            </CardTitle>
            <Store className="size-4 text-brand-gold" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-serif font-semibold text-brand-black">{vendorsData.length}</div>
            <p className="text-xs text-muted-foreground mt-1">{activeVendorsCount} active vendors</p>
          </CardContent>
        </Card>

        <Card className="border-brand-gold/20 bg-parchment-soft">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs uppercase tracking-widest text-muted-foreground">
              Total Vendor Sales
            </CardTitle>
            <ShoppingBag className="size-4 text-brand-gold" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-serif font-semibold text-brand-black">{formatSLE(grandTotalSales)}</div>
            <p className="text-xs text-muted-foreground mt-1">Gross sales generated</p>
          </CardContent>
        </Card>

        <Card className="border-brand-gold/20 bg-parchment-soft">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs uppercase tracking-widest text-muted-foreground">
              ScentSL Commission
            </CardTitle>
            <Percent className="size-4 text-brand-gold" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-serif font-semibold text-brand-black">{formatSLE(grandTotalCommission)}</div>
            <p className="text-xs text-emerald-600 mt-1">Platform earnings</p>
          </CardContent>
        </Card>

        <Card className="border-brand-gold/20 bg-parchment-soft">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs uppercase tracking-widest text-muted-foreground">
              Net Vendor Amount
            </CardTitle>
            <DollarSign className="size-4 text-brand-gold" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-serif font-semibold text-brand-black">{formatSLE(grandTotalVendorAmount)}</div>
            <p className="text-xs text-muted-foreground mt-1">Vendor net payouts</p>
          </CardContent>
        </Card>
      </div>

      {/* Vendors Table */}
      <Card className="border-brand-gold/20">
        <CardHeader className="pb-4">
          <CardTitle className="font-serif text-xl">Vendor Directory</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Vendor</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Commission</TableHead>
                <TableHead className="text-center">Products</TableHead>
                <TableHead className="text-right">Total Sales</TableHead>
                <TableHead className="text-right">Vendor Net</TableHead>
                <TableHead>Date Added</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {vendorsData.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="py-12 text-center text-muted-foreground">
                    No vendors found. Click "+ Add Vendor" to add your first supplier.
                  </TableCell>
                </TableRow>
              ) : (
                vendorsData.map((v) => (
                  <TableRow key={v.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        {v.logo ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={v.logo}
                            alt={v.businessName}
                            className="size-9 rounded-full object-cover border border-brand-gold/30"
                          />
                        ) : (
                          <div className="flex size-9 items-center justify-center rounded-full bg-brand-gold/10 font-serif text-sm font-semibold text-brand-gold">
                            {v.businessName.charAt(0)}
                          </div>
                        )}
                        <div>
                          <Link href={`/admin/vendors/${v.id}`} className="font-medium text-brand-black hover:text-brand-gold">
                            {v.businessName}
                          </Link>
                          {v.ownerName && (
                            <p className="text-xs text-muted-foreground">Contact: {v.ownerName}</p>
                          )}
                          {v.email && (
                            <p className="text-xs text-muted-foreground">{v.email}</p>
                          )}
                        </div>
                      </div>
                    </TableCell>

                    <TableCell>{statusBadge(v.status)}</TableCell>

                    <TableCell>
                      <span className="font-medium">{v.commissionRate}%</span>
                    </TableCell>

                    <TableCell className="text-center">
                      <span className="rounded-full bg-parchment px-2.5 py-1 text-xs font-semibold">
                        {v._count.products}
                      </span>
                    </TableCell>

                    <TableCell className="text-right font-medium">
                      {formatSLE(v.totalSales)}
                    </TableCell>

                    <TableCell className="text-right font-medium text-emerald-700">
                      {formatSLE(v.totalVendorAmount)}
                    </TableCell>

                    <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                      {format(new Date(v.createdAt), "d MMM yyyy")}
                    </TableCell>

                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Link href={`/admin/vendors/${v.id}`}>
                          <Button variant="ghost" size="icon" title="View Vendor Details">
                            <Eye className="size-4" />
                          </Button>
                        </Link>
                        <VendorDialog
                          vendor={v}
                          trigger={
                            <Button variant="ghost" size="icon" title="Edit Vendor">
                              <Edit className="size-4" />
                            </Button>
                          }
                        />
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
