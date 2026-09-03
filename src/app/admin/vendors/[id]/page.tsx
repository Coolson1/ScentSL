import Link from "next/link";
import { notFound } from "next/navigation";
import { format } from "date-fns";
import {
  Store,
  Phone,
  MessageSquare,
  Mail,
  MapPin,
  Edit,
  Package,
  ShoppingBag,
  DollarSign,
  Percent,
  CheckCircle,
  Clock,
  ArrowLeft,
} from "lucide-react";

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

export default async function VendorDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const vendor = await prisma.vendor.findUnique({
    where: { id },
    include: {
      products: {
        include: {
          category: { select: { name: true } },
          variants: { select: { id: true, size: true, price: true, stock: true } },
        },
        orderBy: { createdAt: "desc" },
      },
      orderItems: {
        include: {
          order: {
            select: {
              id: true,
              status: true,
              paymentStatus: true,
              createdAt: true,
              user: { select: { name: true, email: true } },
              guestEmail: true,
            },
          },
          product: { select: { id: true, name: true, slug: true } },
          variant: { select: { size: true } },
        },
        orderBy: { order: { createdAt: "desc" } },
      },
    },
  });

  if (!vendor) notFound();

  const paidOrderItems = vendor.orderItems.filter(
    (i) => i.order.paymentStatus === "PAID" && i.order.status !== "CANCELLED"
  );
  const totalSales = paidOrderItems.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const totalCommission = paidOrderItems.reduce((sum, i) => sum + i.commissionAmount, 0);
  const totalVendorAmount = paidOrderItems.reduce((sum, i) => sum + i.vendorAmount, 0);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <Link
          href="/admin/vendors"
          className="inline-flex items-center gap-1.5 text-xs uppercase tracking-widest text-muted-foreground hover:text-brand-gold"
        >
          <ArrowLeft className="size-3.5" /> Back to vendors
        </Link>
        <div className="mt-3 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            {vendor.logo ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={vendor.logo}
                alt={vendor.businessName}
                className="size-16 rounded-full object-cover border-2 border-brand-gold/40 shadow-sm"
              />
            ) : (
              <div className="flex size-16 items-center justify-center rounded-full bg-brand-gold/15 font-serif text-2xl font-semibold text-brand-gold">
                {vendor.businessName.charAt(0)}
              </div>
            )}
            <div>
              <div className="flex items-center gap-3">
                <h1 className="font-serif text-3xl text-brand-black">{vendor.businessName}</h1>
                {statusBadge(vendor.status)}
              </div>
              <p className="mt-0.5 text-sm text-muted-foreground">
                Configured Commission Rate: <span className="font-semibold text-brand-black">{vendor.commissionRate}%</span>
              </p>
            </div>
          </div>

          <VendorDialog
            vendor={vendor}
            trigger={
              <Button variant="outline" size="sm">
                <Edit className="size-4" /> Edit Vendor Profile
              </Button>
            }
          />
        </div>
      </div>

      {/* Info & Contact Grid */}
      <div className="grid gap-6 md:grid-cols-3">
        <Card className="border-brand-gold/20 md:col-span-2">
          <CardHeader className="pb-3">
            <CardTitle className="font-serif text-lg">Contact & Business Details</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2 text-sm">
            {vendor.ownerName && (
              <div>
                <span className="text-xs text-muted-foreground block uppercase tracking-wider">Owner / Contact</span>
                <span className="font-medium text-brand-black">{vendor.ownerName}</span>
              </div>
            )}
            {vendor.email && (
              <div>
                <span className="text-xs text-muted-foreground block uppercase tracking-wider">Email</span>
                <a href={`mailto:${vendor.email}`} className="font-medium text-brand-gold hover:underline flex items-center gap-1.5">
                  <Mail className="size-3.5" /> {vendor.email}
                </a>
              </div>
            )}
            {vendor.phone && (
              <div>
                <span className="text-xs text-muted-foreground block uppercase tracking-wider">Phone</span>
                <a href={`tel:${vendor.phone}`} className="font-medium text-brand-black flex items-center gap-1.5">
                  <Phone className="size-3.5" /> {vendor.phone}
                </a>
              </div>
            )}
            {vendor.whatsapp && (
              <div>
                <span className="text-xs text-muted-foreground block uppercase tracking-wider">WhatsApp</span>
                <a
                  href={`https://wa.me/${vendor.whatsapp.replace(/[^0-9]/g, "")}`}
                  target="_blank"
                  rel="noreferrer"
                  className="font-medium text-emerald-600 hover:underline flex items-center gap-1.5"
                >
                  <MessageSquare className="size-3.5" /> {vendor.whatsapp}
                </a>
              </div>
            )}
            {vendor.address && (
              <div className="sm:col-span-2">
                <span className="text-xs text-muted-foreground block uppercase tracking-wider">Address</span>
                <span className="font-medium text-brand-black flex items-center gap-1.5">
                  <MapPin className="size-3.5" /> {vendor.address}
                </span>
              </div>
            )}
            {vendor.description && (
              <div className="sm:col-span-2 border-t pt-3">
                <span className="text-xs text-muted-foreground block uppercase tracking-wider">Description</span>
                <p className="text-muted-foreground text-xs leading-relaxed mt-1">{vendor.description}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Payout & Financial Summary */}
        <Card className="border-brand-gold/30 bg-parchment-soft">
          <CardHeader className="pb-3">
            <CardTitle className="font-serif text-lg">Payout & Earnings Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <span className="text-xs text-muted-foreground uppercase tracking-widest">Gross Sales</span>
              <div className="text-xl font-serif font-semibold text-brand-black">{formatSLE(totalSales)}</div>
            </div>

            <div className="border-t border-brand-gold/20 pt-3">
              <span className="text-xs text-muted-foreground uppercase tracking-widest">ScentSL Commission ({vendor.commissionRate}%)</span>
              <div className="text-xl font-serif font-semibold text-brand-gold">{formatSLE(totalCommission)}</div>
            </div>

            <div className="border-t border-brand-gold/20 pt-3">
              <span className="text-xs text-muted-foreground uppercase tracking-widest">Net Vendor Amount Owed</span>
              <div className="text-2xl font-serif font-semibold text-emerald-700">{formatSLE(totalVendorAmount)}</div>
            </div>

            <div className="border-t border-brand-gold/20 pt-3 flex items-center justify-between text-xs">
              <span className="text-muted-foreground">Payout Status</span>
              <Badge className="bg-amber-500/15 text-amber-800 border-amber-500/30">
                <Clock className="size-3 mr-1" /> Pending Manual Payout
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Vendor Products */}
      <Card className="border-brand-gold/20">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="font-serif text-xl">Assigned Products ({vendor.products.length})</CardTitle>
          <Link href="/admin/products/new">
            <Button size="sm" variant="outline">
              <Package className="size-4 mr-1" /> Add Product
            </Button>
          </Link>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Product Name</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Variants / Sizes</TableHead>
                <TableHead className="text-center">Total Stock</TableHead>
                <TableHead>Price Range</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {vendor.products.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="py-8 text-center text-muted-foreground">
                    No products currently assigned to this vendor.
                  </TableCell>
                </TableRow>
              ) : (
                vendor.products.map((p) => {
                  const totalStock = p.variants.reduce((sum, v) => sum + v.stock, 0);
                  const minPrice = p.variants.length > 0 ? Math.min(...p.variants.map((v) => v.price)) : 0;
                  const maxPrice = p.variants.length > 0 ? Math.max(...p.variants.map((v) => v.price)) : 0;

                  return (
                    <TableRow key={p.id}>
                      <TableCell className="font-medium">
                        <Link href={`/admin/products/${p.id}`} className="hover:text-brand-gold">
                          {p.name}
                        </Link>
                      </TableCell>
                      <TableCell>{p.category.name}</TableCell>
                      <TableCell className="text-xs text-muted-foreground">
                        {p.variants.map((v) => `${v.size} (${v.stock})`).join(", ")}
                      </TableCell>
                      <TableCell className="text-center font-medium">
                        <span className={`px-2 py-0.5 rounded text-xs font-semibold ${totalStock === 0 ? "bg-rose-100 text-rose-700" : "bg-emerald-100 text-emerald-700"}`}>
                          {totalStock}
                        </span>
                      </TableCell>
                      <TableCell>
                        {minPrice === maxPrice ? formatSLE(minPrice) : `${formatSLE(minPrice)} - ${formatSLE(maxPrice)}`}
                      </TableCell>
                      <TableCell className="text-right">
                        <Link href={`/admin/products/${p.id}`}>
                          <Button variant="ghost" size="sm">
                            Edit
                          </Button>
                        </Link>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Vendor Orders */}
      <Card className="border-brand-gold/20">
        <CardHeader>
          <CardTitle className="font-serif text-xl">Order Fulfillment ({vendor.orderItems.length})</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order ID</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Product / Variant</TableHead>
                <TableHead className="text-center">Qty</TableHead>
                <TableHead className="text-right">Item Price</TableHead>
                <TableHead className="text-right">Commission Rate</TableHead>
                <TableHead className="text-right">ScentSL Fee</TableHead>
                <TableHead className="text-right">Vendor Net</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {vendor.orderItems.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} className="py-8 text-center text-muted-foreground">
                    No orders placed for this vendor yet.
                  </TableCell>
                </TableRow>
              ) : (
                vendor.orderItems.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-mono text-xs">
                      <Link href={`/admin/orders/${item.order.id}`} className="hover:text-brand-gold">
                        #{item.order.id.slice(0, 8)}
                      </Link>
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                      {format(new Date(item.order.createdAt), "d MMM yyyy")}
                    </TableCell>
                    <TableCell className="font-medium">
                      {item.product.name} ({item.variant.size})
                    </TableCell>
                    <TableCell className="text-center font-medium">{item.quantity}</TableCell>
                    <TableCell className="text-right">{formatSLE(item.price * item.quantity)}</TableCell>
                    <TableCell className="text-right text-xs">{item.commissionRate}%</TableCell>
                    <TableCell className="text-right text-xs font-semibold text-brand-gold">
                      {formatSLE(item.commissionAmount)}
                    </TableCell>
                    <TableCell className="text-right font-semibold text-emerald-700">
                      {formatSLE(item.vendorAmount)}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="text-[10px] uppercase">
                        {item.order.status}
                      </Badge>
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
