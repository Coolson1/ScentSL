import { z } from "zod";

export const variantInputSchema = z.object({
  id: z.string().optional(),
  size: z.string().min(1, "Size is required"),
  price: z.number().int().positive("Price must be > 0"),
  stock: z.number().int().min(0, "Stock cannot be negative"),
  sku: z.string().optional().nullable(),
});

export const productInputSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  slug: z
    .string()
    .min(1, "Slug is required")
    .regex(/^[a-z0-9-]+$/, "Slug may only contain lowercase letters, numbers, and hyphens"),
  categoryId: z.string().min(1, "Category is required"),
  vendorId: z.string().optional().nullable(),
  description: z.string().min(10, "Description must be at least 10 characters"),
  images: z.array(z.string().url()).max(5, "Up to 5 images"),
  isFeatured: z.boolean(),
  isActive: z.boolean(),
  variants: z.array(variantInputSchema).min(1, "At least one variant is required"),
});

export type ProductInput = z.infer<typeof productInputSchema>;
export type VariantInput = z.infer<typeof variantInputSchema>;
