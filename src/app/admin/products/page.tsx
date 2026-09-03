import Link from "next/link";
import { Plus, Pencil } from "lucide-react";

import { prisma } from "@/lib/prisma";
import { Button, buttonVariants } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { DeleteProductButton } from "@/components/admin/DeleteProductButton";

type SearchParams = Promise<{ q?: string }>;

export default async function AdminProductsPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const { q } = await searchParams;
  const search = q?.trim() ?? "";

  const products = await prisma.product.findMany({
    where: search
      ? { name: { contains: search, mode: "insensitive" } }
      : undefined,
    include: {
      category: true,
      _count: { select: { variants: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-serif text-3xl text-brand-black">Products</h1>
          <p className="text-sm text-muted-foreground">
            {products.length} {products.length === 1 ? "product" : "products"}
          </p>
        </div>
        <Link
          href="/admin/products/new"
          className={`${buttonVariants({ variant: "default" })} bg-brand-gold text-brand-black hover:bg-brand-gold-light`}
        >
          <Plus className="size-4" /> Add product
        </Link>
      </header>

      <form className="flex gap-2" method="get">
        <Input
          name="q"
          defaultValue={search}
          placeholder="Search products by name…"
          className="max-w-md"
        />
        <Button type="submit" variant="outline">
          Search
        </Button>
        {search && (
          <Link
            href="/admin/products"
            className={buttonVariants({ variant: "ghost" })}
          >
            Clear
          </Link>
        )}
      </form>

      <div className="rounded-md border bg-white">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Variants</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {products.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={5}
                  className="py-8 text-center text-sm text-muted-foreground"
                >
                  {search
                    ? `No products match "${search}".`
                    : "No products yet. Create your first one."}
                </TableCell>
              </TableRow>
            ) : (
              products.map((p) => (
                <TableRow key={p.id}>
                  <TableCell>
                    <div className="font-medium">{p.name}</div>
                    <div className="text-xs text-muted-foreground">/{p.slug}</div>
                  </TableCell>
                  <TableCell>{p.category.name}</TableCell>
                  <TableCell>{p._count.variants}</TableCell>
                  <TableCell>
                    <div className="flex flex-wrap items-center gap-1">
                      {p.isActive ? (
                        <Badge className="bg-brand-gold/15 text-brand-gold hover:bg-brand-gold/20">
                          Active
                        </Badge>
                      ) : (
                        <Badge variant="secondary">Inactive</Badge>
                      )}
                      {p.isFeatured && (
                        <Badge variant="outline" className="border-amber-500/30 text-amber-600 bg-amber-50/50">
                          Featured
                        </Badge>
                      )}
                      {p.isPopular && (
                        <Badge variant="outline" className="border-purple-500/30 text-purple-600 bg-purple-50/50">
                          Popular
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="inline-flex items-center gap-1">
                      <Link
                        href={`/admin/products/${p.id}`}
                        aria-label={`Edit ${p.name}`}
                        className={buttonVariants({ variant: "ghost", size: "icon" })}
                      >
                        <Pencil className="size-4" />
                      </Link>
                      <DeleteProductButton
                        productId={p.id}
                        productName={p.name}
                      />
                    </div>
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
