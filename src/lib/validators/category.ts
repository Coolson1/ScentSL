import { z } from "zod";

export const categoryInputSchema = z.object({
  name: z.string().min(1, "Name is required"),
  slug: z
    .string()
    .min(1, "Slug is required")
    .regex(/^[a-z0-9-]+$/, "Lowercase letters, numbers, hyphens only"),
  image: z.string().url().nullable().optional(),
  isFeatured: z.boolean().optional().default(true),
});

export type CategoryInput = z.infer<typeof categoryInputSchema>;
