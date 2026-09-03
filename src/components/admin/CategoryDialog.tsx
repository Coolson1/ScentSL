"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Plus, Pencil } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { ImageUploader } from "./ImageUploader";
import { generateSlug } from "@/lib/utils";

const schema = z.object({
  name: z.string().min(1, "Name is required"),
  slug: z
    .string()
    .min(1, "Slug is required")
    .regex(/^[a-z0-9-]+$/, "Lowercase letters, numbers, hyphens only"),
  image: z.string().url().nullable().optional(),
  isFeatured: z.boolean(),
});

type FormValues = z.infer<typeof schema>;

export function CategoryDialog({
  category,
  trigger,
}: {
  category?: { id: string; name: string; slug: string; image: string | null; isFeatured?: boolean };
  trigger?: React.ReactNode;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const editing = Boolean(category);

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: category?.name ?? "",
      slug: category?.slug ?? "",
      image: category?.image ?? null,
      isFeatured: category?.isFeatured ?? true,
    },
  });

  function reset() {
    form.reset({
      name: category?.name ?? "",
      slug: category?.slug ?? "",
      image: category?.image ?? null,
      isFeatured: category?.isFeatured ?? true,
    });
  }

  async function onSubmit(values: FormValues) {
    setSubmitting(true);
    const url = editing
      ? `/api/admin/categories/${category!.id}`
      : "/api/admin/categories";
    const method = editing ? "PATCH" : "POST";

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values),
    });
    setSubmitting(false);

    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      toast.error(body?.error ?? "Failed to save category");
      return;
    }

    toast.success(editing ? "Category updated" : "Category created");
    setOpen(false);
    router.refresh();
  }

  const nameReg = form.register("name");

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        setOpen(o);
        if (o) reset();
      }}
    >
      {trigger ? (
        <DialogTrigger render={trigger as React.ReactElement} />
      ) : (
        <DialogTrigger
          render={
            <Button className="bg-brand-gold text-brand-black hover:bg-brand-gold-light" />
          }
        >
          <Plus className="size-4" /> Add category
        </DialogTrigger>
      )}
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {editing ? "Edit category" : "New category"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <Label htmlFor="cat-name">Name</Label>
            <Input
              id="cat-name"
              {...nameReg}
              onChange={(e) => {
                nameReg.onChange(e);
                if (!editing) {
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
            <Label htmlFor="cat-slug">Slug</Label>
            <Input id="cat-slug" {...form.register("slug")} />
            {form.formState.errors.slug && (
              <p className="mt-1 text-xs text-destructive">
                {form.formState.errors.slug.message}
              </p>
            )}
          </div>

          <div>
            <Label className="mb-1.5 block">Cover image (optional)</Label>
            <Controller
              control={form.control}
              name="image"
              render={({ field }) => (
                <ImageUploader
                  value={field.value ? [field.value] : []}
                  onChange={(urls) => field.onChange(urls[0] ?? null)}
                  max={1}
                />
              )}
            />
          </div>

          <Controller
            control={form.control}
            name="isFeatured"
            render={({ field }) => (
              <label
                htmlFor="cat-is-featured"
                className="flex cursor-pointer items-center justify-between rounded-md border p-3 shadow-xs"
              >
                <div>
                  <span className="block text-sm font-medium">Featured on homepage</span>
                  <span className="block text-xs text-muted-foreground">
                    Display this category in the showcase grid on the homepage
                  </span>
                </div>
                <Switch
                  id="cat-is-featured"
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </label>
            )}
          />

          <DialogFooter>
            <Button
              type="button"
              variant="ghost"
              onClick={() => setOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={submitting}
              className="bg-brand-gold text-brand-black hover:bg-brand-gold-light"
            >
              {submitting ? "Saving…" : editing ? "Save" : "Create"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export function EditCategoryButton(props: { category: { id: string; name: string; slug: string; image: string | null; isFeatured?: boolean } }) {
  return (
    <CategoryDialog
      category={props.category}
      trigger={
        <Button variant="ghost" size="icon" aria-label={`Edit ${props.category.name}`}>
          <Pencil className="size-4" />
        </Button>
      }
    />
  );
}
