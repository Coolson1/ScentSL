"use client";

import { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { VendorStatus } from "@/generated/prisma/enums";

const vendorFormSchema = z.object({
  businessName: z.string().min(2, "Business name must be at least 2 characters"),
  ownerName: z.string().optional().or(z.literal("")),
  phone: z.string().optional().or(z.literal("")),
  whatsapp: z.string().optional().or(z.literal("")),
  email: z.string().email("Enter a valid email address").optional().or(z.literal("")),
  address: z.string().optional().or(z.literal("")),
  description: z.string().optional().or(z.literal("")),
  logo: z.string().optional().or(z.literal("")),
  status: z.nativeEnum(VendorStatus),
  commissionRate: z.coerce
    .number({ message: "Enter a valid percentage" })
    .min(0, "Commission cannot be negative")
    .max(100, "Commission cannot exceed 100%"),
});

export type VendorFormValues = z.input<typeof vendorFormSchema>;
type VendorFormOutput = z.output<typeof vendorFormSchema>;

export type VendorRecord = {
  id: string;
  businessName: string;
  ownerName: string | null;
  phone: string | null;
  whatsapp: string | null;
  email: string | null;
  address: string | null;
  description: string | null;
  logo: string | null;
  status: VendorStatus;
  commissionRate: number;
};

export function VendorDialog({
  vendor,
  trigger,
}: {
  vendor?: VendorRecord;
  trigger?: React.ReactNode;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const editing = Boolean(vendor);

  const form = useForm<VendorFormValues, undefined, VendorFormOutput>({
    resolver: zodResolver(vendorFormSchema),
    defaultValues: {
      businessName: vendor?.businessName ?? "",
      ownerName: vendor?.ownerName ?? "",
      phone: vendor?.phone ?? "",
      whatsapp: vendor?.whatsapp ?? "",
      email: vendor?.email ?? "",
      address: vendor?.address ?? "",
      description: vendor?.description ?? "",
      logo: vendor?.logo ?? "",
      status: vendor?.status ?? VendorStatus.ACTIVE,
      commissionRate: (vendor?.commissionRate ?? 2.0).toString() as unknown as number,
    },
  });

  async function onSubmit(values: VendorFormOutput) {
    try {
      const url = editing ? `/api/admin/vendors/${vendor!.id}` : "/api/admin/vendors";
      const method = editing ? "PATCH" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });

      const body = await res.json();
      if (!res.ok) {
        toast.error(body?.error ?? "Failed to save vendor");
        return;
      }

      toast.success(editing ? "Vendor updated" : "Vendor created");
      setOpen(false);
      if (!editing) {
        form.reset();
      }
      router.refresh();
    } catch {
      toast.error("Something went wrong");
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          (trigger as React.ReactElement) ?? (
            <Button size="sm" className="bg-brand-gold text-brand-black hover:bg-brand-gold/90 font-medium">
              <Plus className="size-4 mr-1" /> Add Vendor
            </Button>
          )
        }
      />
      <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-serif text-2xl text-brand-black">
            {editing ? `Edit ${vendor?.businessName}` : "Add New Vendor"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-2">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <Label htmlFor="businessName">Business Name *</Label>
              <Input
                id="businessName"
                placeholder="e.g. Lattafa Perfumes SL"
                {...form.register("businessName")}
              />
              {form.formState.errors.businessName && (
                <p className="mt-1 text-xs text-destructive">
                  {form.formState.errors.businessName.message}
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="ownerName">Owner / Contact Person</Label>
              <Input
                id="ownerName"
                placeholder="e.g. Mohamed Sesay"
                {...form.register("ownerName")}
              />
            </div>

            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="vendor@example.com"
                {...form.register("email")}
              />
              {form.formState.errors.email && (
                <p className="mt-1 text-xs text-destructive">
                  {form.formState.errors.email.message}
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                placeholder="+232 76 000 000"
                {...form.register("phone")}
              />
            </div>

            <div>
              <Label htmlFor="whatsapp">WhatsApp Number</Label>
              <Input
                id="whatsapp"
                placeholder="+232 76 000 000"
                {...form.register("whatsapp")}
              />
            </div>

            <div>
              <Label htmlFor="commissionRate">Commission Rate (%) *</Label>
              <Input
                id="commissionRate"
                type="number"
                step="0.1"
                placeholder="2.0"
                {...form.register("commissionRate")}
              />
              {form.formState.errors.commissionRate && (
                <p className="mt-1 text-xs text-destructive">
                  {form.formState.errors.commissionRate.message}
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="status">Status</Label>
              <Controller
                control={form.control}
                name="status"
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger id="status">
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={VendorStatus.ACTIVE}>Active</SelectItem>
                      <SelectItem value={VendorStatus.PENDING}>Pending</SelectItem>
                      <SelectItem value={VendorStatus.SUSPENDED}>Suspended</SelectItem>
                      <SelectItem value={VendorStatus.INACTIVE}>Inactive</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
            </div>
          </div>

          <div>
            <Label htmlFor="address">Business Address</Label>
            <Input
              id="address"
              placeholder="Freetown, Sierra Leone"
              {...form.register("address")}
            />
          </div>

          <div>
            <Label htmlFor="logo">Logo Image URL</Label>
            <Input
              id="logo"
              placeholder="https://..."
              {...form.register("logo")}
            />
          </div>

          <div>
            <Label htmlFor="description">Description / Notes</Label>
            <Textarea
              id="description"
              rows={3}
              placeholder="Official supplier for Lattafa fragrances in Freetown..."
              {...form.register("description")}
            />
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={form.formState.isSubmitting}
              className="bg-brand-gold text-brand-black hover:bg-brand-gold/90"
            >
              {form.formState.isSubmitting
                ? "Saving..."
                : editing
                ? "Save Changes"
                : "Create Vendor"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
