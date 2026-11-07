"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Plus, Pencil, RefreshCw } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CouponType } from "@/generated/prisma/enums";

const schema = z
  .object({
    code: z
      .string()
      .min(3, "Code must be at least 3 characters")
      .regex(/^[A-Z0-9-]+$/, "Uppercase letters, numbers, hyphens only"),
    type: z.enum(Object.values(CouponType) as [CouponType, ...CouponType[]]),
    value: z.coerce.number().positive("Value must be greater than zero"),
    minOrderSLE: z
      .string()
      .optional()
      .refine(
        (v) => v === undefined || v === "" || !Number.isNaN(Number(v)),
        "Enter a valid number",
      ),
    maxUses: z
      .string()
      .optional()
      .refine(
        (v) => v === undefined || v === "" || (Number.isInteger(Number(v)) && Number(v) > 0),
        "Enter a positive whole number",
      ),
    expiresAt: z.string().optional(),
    isActive: z.boolean(),
  })
  .refine(
    (v) => v.type !== "PERCENTAGE" || (v.value >= 1 && v.value <= 100),
    { path: ["value"], message: "Percentage must be 1 to 100" },
  );

type FormInput = z.input<typeof schema>;
type FormOutput = z.output<typeof schema>;

export type CouponInitial = {
  id: string;
  code: string;
  type: CouponType;
  value: number;
  minOrder: number | null;
  maxUses: number | null;
  expiresAt: Date | null;
  isActive: boolean;
};

function generateCode() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let out = "";
  for (let i = 0; i < 8; i++) {
    out += chars[Math.floor(Math.random() * chars.length)];
  }
  return out;
}

export function CouponDialog({
  coupon,
  trigger,
}: {
  coupon?: CouponInitial;
  trigger?: React.ReactNode;
}) {
  const router = useRouter();
  const editing = Boolean(coupon);
  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const form = useForm<FormInput, unknown, FormOutput>({
    resolver: zodResolver(schema),
    defaultValues: {
      code: coupon?.code ?? "",
      type: coupon?.type ?? "PERCENTAGE",
      value:
        editing && coupon
          ? coupon.type === "FIXED"
            ? coupon.value / 100
            : coupon.value
          : 10,
      minOrderSLE: coupon?.minOrder ? (coupon.minOrder / 100).toString() : "",
      maxUses: coupon?.maxUses ? String(coupon.maxUses) : "",
      expiresAt: coupon?.expiresAt
        ? coupon.expiresAt.toISOString().slice(0, 10)
        : "",
      isActive: coupon?.isActive ?? true,
    },
  });

  const type = form.watch("type");

  async function onSubmit(values: FormOutput) {
    setSubmitting(true);

    const valueAsStored =
      values.type === "FIXED" ? Math.round(values.value * 100) : values.value;
    const minOrder =
      values.minOrderSLE && values.minOrderSLE !== ""
        ? Math.round(Number(values.minOrderSLE) * 100)
        : null;
    const maxUses = values.maxUses && values.maxUses !== "" ? Number(values.maxUses) : null;
    const expiresAt = values.expiresAt
      ? new Date(`${values.expiresAt}T23:59:59.999Z`).toISOString()
      : null;

    const payload = editing
      ? {
          type: values.type,
          value: valueAsStored,
          minOrder,
          maxUses,
          expiresAt,
          isActive: values.isActive,
        }
      : {
          code: values.code.toUpperCase(),
          type: values.type,
          value: valueAsStored,
          minOrder,
          maxUses,
          expiresAt,
          isActive: values.isActive,
        };

    const url = editing
      ? `/api/admin/coupons/${coupon!.id}`
      : "/api/admin/coupons";
    const method = editing ? "PATCH" : "POST";

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    setSubmitting(false);

    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      toast.error(body?.error ?? "Failed to save coupon");
      return;
    }

    toast.success(editing ? "Coupon updated" : "Coupon created");
    setOpen(false);
    router.refresh();
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {trigger ? (
        <DialogTrigger render={trigger as React.ReactElement} />
      ) : (
        <DialogTrigger
          render={
            <Button className="bg-brand-gold text-brand-black hover:bg-brand-gold-light" />
          }
        >
          <Plus className="size-4" /> New coupon
        </DialogTrigger>
      )}
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {editing ? `Edit ${coupon!.code}` : "New coupon"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          {!editing && (
            <div>
              <Label htmlFor="coupon-code">Code</Label>
              <div className="flex gap-2">
                <Input
                  id="coupon-code"
                  className="font-mono uppercase"
                  {...form.register("code")}
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() =>
                    form.setValue("code", generateCode(), { shouldValidate: true })
                  }
                >
                  <RefreshCw className="size-4" /> Generate
                </Button>
              </div>
              {form.formState.errors.code && (
                <p className="mt-1 text-xs text-destructive">
                  {form.formState.errors.code.message}
                </p>
              )}
            </div>
          )}

          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <Label>Type</Label>
              <Controller
                control={form.control}
                name="type"
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="PERCENTAGE">Percentage (%)</SelectItem>
                      <SelectItem value="FIXED">Fixed (SLE)</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
            </div>

            <div>
              <Label htmlFor="coupon-value">
                Value {type === "PERCENTAGE" ? "(%)" : "(SLE)"}
              </Label>
              <Input
                id="coupon-value"
                type="number"
                step={type === "PERCENTAGE" ? 1 : 0.01}
                {...form.register("value")}
              />
              {form.formState.errors.value && (
                <p className="mt-1 text-xs text-destructive">
                  {form.formState.errors.value.message}
                </p>
              )}
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <Label htmlFor="min-order">Min order (SLE, optional)</Label>
              <Input
                id="min-order"
                type="number"
                step="0.01"
                placeholder="e.g. 200.00"
                {...form.register("minOrderSLE")}
              />
            </div>
            <div>
              <Label htmlFor="max-uses">Max uses (optional)</Label>
              <Input
                id="max-uses"
                type="number"
                step={1}
                placeholder="Unlimited if blank"
                {...form.register("maxUses")}
              />
            </div>
          </div>

          <div>
            <Label htmlFor="expires-at">Expires (optional)</Label>
            <Input
              id="expires-at"
              type="date"
              {...form.register("expiresAt")}
            />
          </div>

          <Controller
            control={form.control}
            name="isActive"
            render={({ field }) => (
              <label className="flex items-center gap-3 pt-1 cursor-pointer">
                <Switch
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
                <span className="text-sm">Active</span>
              </label>
            )}
          />

          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => setOpen(false)}>
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

export function EditCouponButton({ coupon }: { coupon: CouponInitial }) {
  return (
    <CouponDialog
      coupon={coupon}
      trigger={
        <Button variant="ghost" size="icon" aria-label={`Edit ${coupon.code}`}>
          <Pencil className="size-4" />
        </Button>
      }
    />
  );
}
