"use client";

import { useRef, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { ImageUploader } from "./ImageUploader";
import { VariantManager } from "./VariantManager";
import { generateSlug } from "@/lib/utils";

const formSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  slug: z
    .string()
    .min(1, "Slug is required")
    .regex(/^[a-z0-9-]+$/, "Lowercase letters, numbers, hyphens only"),
  categoryId: z.string().min(1, "Category is required"),
  vendorId: z.string().optional().nullable(),
  description: z.string().min(10, "Description must be at least 10 characters"),
  images: z.array(z.string().url()).max(5, "Up to 5 images"),
  isFeatured: z.boolean(),
  isActive: z.boolean(),
  variants: z
    .array(
      z.object({
        id: z.string().optional(),
        size: z.string().min(1, "Size is required"),
        priceSLE: z.coerce
          .number({ message: "Enter a price in SLE" })
          .positive("Price must be > 0"),
        stock: z.coerce.number().int().min(0, "Stock cannot be negative"),
        sku: z.string().optional(),
      }),
    )
    .min(1, "At least one variant is required"),
});

export type ProductFormValues = z.input<typeof formSchema>;
type ProductFormOutput = z.output<typeof formSchema>;

export type ProductDefaults = {
  id?: string;
  name: string;
  slug: string;
  categoryId: string;
  vendorId?: string | null;
  description: string;
  images: string[];
  isFeatured: boolean;
  isActive: boolean;
  variants: {
    id?: string;
    size: string;
    price: number;
    stock: number;
    sku?: string | null;
  }[];
};

const EMPTY_DEFAULTS: ProductDefaults = {
  name: "",
  slug: "",
  categoryId: "",
  vendorId: "",
  description: "",
  images: [],
  isFeatured: false,
  isActive: true,
  variants: [{ size: "", price: 0, stock: 0 }],
};

export function ProductForm({
  defaults = EMPTY_DEFAULTS,
  categories,
  vendors = [],
}: {
  defaults?: ProductDefaults;
  categories: { id: string; name: string }[];
  vendors?: { id: string; businessName: string; status: string }[];
}) {
  const router = useRouter();
  const editing = Boolean(defaults.id);
  const [submitting, setSubmitting] = useState(false);
  const slugTouched = useRef(Boolean(defaults.slug));

  const form = useForm<ProductFormValues, undefined, ProductFormOutput>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: defaults.name,
      slug: defaults.slug,
      categoryId: defaults.categoryId,
      vendorId: defaults.vendorId ?? "",
      description: defaults.description,
      images: defaults.images,
      isFeatured: defaults.isFeatured,
      isActive: defaults.isActive,
      variants: defaults.variants.map((v) => ({
        id: v.id,
        size: v.size,
        priceSLE: (v.price / 100).toString() as unknown as number,
        stock: v.stock,
        sku: v.sku ?? "",
      })),
    },
  });

  async function onSubmit(values: ProductFormOutput) {
    if (editing && defaults.vendorId && values.vendorId !== defaults.vendorId) {
      const confirmChange = window.confirm(
        "Changing the vendor for an existing product will affect order fulfillment and commission calculation. Do you want to proceed?"
      );
      if (!confirmChange) return;
    }

    setSubmitting(true);

    const payload = {
      name: values.name,
      slug: values.slug,
      categoryId: values.categoryId,
      vendorId: values.vendorId || null,
      description: values.description,
      images: values.images,
      isFeatured: values.isFeatured,
      isActive: values.isActive,
      variants: values.variants.map((v) => ({
        id: v.id,
        size: v.size,
        price: Math.round(v.priceSLE * 100),
        stock: v.stock,
        sku: v.sku?.trim() ? v.sku.trim() : null,
      })),
    };

    const url = editing
      ? `/api/admin/products/${defaults.id}`
      : "/api/admin/products";
    const method = editing ? "PATCH" : "POST";

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    setSubmitting(false);

    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      toast.error(body?.error ?? "Failed to save product");
      return;
    }

    toast.success(editing ? "Product updated" : "Product created");
    router.push("/admin/products");
    router.refresh();
  }

  const nameRegister = form.register("name");

  return (
    <form
      onSubmit={form.handleSubmit(onSubmit)}
      className="space-y-6"
      noValidate
    >
      <Card>
        <CardContent className="space-y-4 p-6">
          <h2 className="font-serif text-xl">Basic details</h2>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                {...nameRegister}
                onChange={(e) => {
                  nameRegister.onChange(e);
                  if (!slugTouched.current) {
                    form.setValue("slug", generateSlug(e.target.value), {
                      shouldValidate: true,
                    });
                  }
                }}
              />
              {form.formState.errors.name && (
                <p className="mt-1 text-xs text-destructive">
                  {form.formState.errors.name.message}
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="slug">Slug</Label>
              <Input
                id="slug"
                {...form.register("slug", {
                  onChange: () => {
                    slugTouched.current = true;
                  },
                })}
              />
              {form.formState.errors.slug && (
                <p className="mt-1 text-xs text-destructive">
                  {form.formState.errors.slug.message}
                </p>
              )}
            </div>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <div>
              <Label htmlFor="categoryId">Category</Label>
              <Controller
                control={form.control}
                name="categoryId"
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger id="categoryId">
                      <SelectValue placeholder="Select a category">
                        {categories.find((c) => c.id === field.value)?.name}
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((c) => (
                        <SelectItem key={c.id} value={c.id}>
                          {c.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              {form.formState.errors.categoryId && (
                <p className="mt-1 text-xs text-destructive">
                  {form.formState.errors.categoryId.message}
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="vendorId">Vendor / Supplier</Label>
              <Controller
                control={form.control}
                name="vendorId"
                render={({ field }) => (
                  <Select value={field.value ?? ""} onValueChange={field.onChange}>
                    <SelectTrigger id="vendorId">
                      <SelectValue placeholder="Select a vendor (Required)">
                        {vendors.find((v) => v.id === field.value)?.businessName}
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      {vendors.map((v) => (
                        <SelectItem key={v.id} value={v.id}>
                          {v.businessName} {v.status !== "ACTIVE" ? `(${v.status})` : ""}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              {form.formState.errors.vendorId && (
                <p className="mt-1 text-xs text-destructive">
                  {form.formState.errors.vendorId.message}
                </p>
              )}
            </div>
          </div>

          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              rows={5}
              {...form.register("description")}
            />
            {form.formState.errors.description && (
              <p className="mt-1 text-xs text-destructive">
                {form.formState.errors.description.message}
              </p>
            )}
          </div>

          <div className="flex flex-wrap gap-6 pt-2">
            <Controller
              control={form.control}
              name="isFeatured"
              render={({ field }) => (
                <ToggleField
                  id="isFeatured"
                  label="Featured"
                  hint="Shown on homepage"
                  checked={field.value}
                  onChange={field.onChange}
                />
              )}
            />
            <Controller
              control={form.control}
              name="isActive"
              render={({ field }) => (
                <ToggleField
                  id="isActive"
                  label="Active"
                  hint="Visible in storefront"
                  checked={field.value}
                  onChange={field.onChange}
                />
              )}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="space-y-4 p-6">
          <h2 className="font-serif text-xl">Images</h2>
          <Controller
            control={form.control}
            name="images"
            render={({ field }) => (
              <ImageUploader value={field.value} onChange={field.onChange} />
            )}
          />
        </CardContent>
      </Card>

      <Card>
        <CardContent className="space-y-4 p-6">
          <div className="flex items-baseline justify-between">
            <h2 className="font-serif text-xl">Variants</h2>
            <p className="text-xs text-muted-foreground">
              Prices entered as SLE; stored internally in minor units.
            </p>
          </div>
          <VariantManager control={form.control} />
          {typeof form.formState.errors.variants?.message === "string" && (
            <p className="text-xs text-destructive">
              {form.formState.errors.variants.message}
            </p>
          )}
        </CardContent>
      </Card>

      <div className="flex items-center justify-end gap-3">
        <Button
          type="button"
          variant="ghost"
          onClick={() => router.push("/admin/products")}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          disabled={submitting}
          className="bg-brand-gold text-brand-black hover:bg-brand-gold-light"
        >
          {submitting
            ? "Saving…"
            : editing
              ? "Save changes"
              : "Create product"}
        </Button>
      </div>
    </form>
  );
}

function ToggleField({
  id,
  label,
  hint,
  checked,
  onChange,
}: {
  id: string;
  label: string;
  hint?: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <label htmlFor={id} className="flex items-start gap-3 cursor-pointer">
      <Switch id={id} checked={checked} onCheckedChange={onChange} />
      <span>
        <span className="block text-sm text-brand-black">{label}</span>
        {hint && (
          <span className="block text-xs text-muted-foreground">{hint}</span>
        )}
      </span>
    </label>
  );
}
