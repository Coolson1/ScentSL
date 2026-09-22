import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });
dotenv.config();
import { PrismaNeon } from "@prisma/adapter-neon";
import { PrismaClient } from "../src/generated/prisma/client";

const connectionString = process.env.DATABASE_URL_POOLED || process.env.DATABASE_URL!;

async function main() {
  const adapter = new PrismaNeon({ connectionString });
  const prisma = new PrismaClient({ adapter });

  try {
    console.log("Cleaning up duplicate products created today...");

    // Delete variants & order/cart/wishlist references for products created today (>= 2026-09-20)
    const todayProducts = await prisma.product.findMany({
      where: { createdAt: { gte: new Date("2026-09-20T00:00:00Z") } },
      select: { id: true, name: true },
    });

    const todayIds = todayProducts.map((p) => p.id);
    console.log(`Found ${todayIds.length} duplicate products created today to remove:`, todayProducts.map(p => p.name));

    if (todayIds.length > 0) {
      const variants = await prisma.productVariant.findMany({
        where: { productId: { in: todayIds } },
        select: { id: true },
      });
      const variantIds = variants.map((v) => v.id);

      if (variantIds.length > 0) {
        await prisma.orderItem.deleteMany({ where: { variantId: { in: variantIds } } });
        await prisma.cartItem.deleteMany({ where: { variantId: { in: variantIds } } });
        await prisma.productVariant.deleteMany({ where: { id: { in: variantIds } } });
      }

      await prisma.wishlistItem.deleteMany({ where: { productId: { in: todayIds } } });
      await prisma.review.deleteMany({ where: { productId: { in: todayIds } } });
      await prisma.product.deleteMany({ where: { id: { in: todayIds } } });
      console.log("Successfully removed duplicate products!");
    }

    console.log("Restoring isFeatured, isPopular, and gender on all original real products...");

    // Update real Cloudinary products with gender and isFeatured flags
    const updates: Record<string, { gender: "MEN" | "WOMEN" | "UNISEX"; isFeatured: boolean; isPopular?: boolean }> = {
      "ysl-libre": { gender: "WOMEN", isFeatured: true, isPopular: true },
      "lattafa-khamrah-cmtksh738000chslkmgyqlqtm": { gender: "UNISEX", isFeatured: true, isPopular: true },
      "liquid-brun": { gender: "MEN", isFeatured: true, isPopular: true },
      "9pm-night-out": { gender: "MEN", isFeatured: true, isPopular: true },
      "afnan-9-pm-elixir": { gender: "MEN", isFeatured: true, isPopular: true },
      "stronger-with-you-absolutely": { gender: "MEN", isFeatured: true, isPopular: true },
      "after-effect-by-french-avenue": { gender: "UNISEX", isFeatured: true, isPopular: true },
      "afnan-9-pm-rebel": { gender: "MEN", isFeatured: true, isPopular: true },
      "badee-al-oud-amethyst": { gender: "UNISEX", isFeatured: true, isPopular: true },
      "club-de-nuit": { gender: "MEN", isFeatured: true, isPopular: true },
      "aventus-creed": { gender: "MEN", isFeatured: true, isPopular: true },
      "suger-candy": { gender: "WOMEN", isFeatured: true, isPopular: true },
      "chanel-no-5": { gender: "WOMEN", isFeatured: true },
      "tom-ford-oud-wood": { gender: "UNISEX", isFeatured: true },
      "creed-royal-oud": { gender: "MEN", isFeatured: true },
      "le-labo-santal-33": { gender: "UNISEX", isFeatured: true },
      "acqua-di-parma-colonia": { gender: "UNISEX", isFeatured: true },
      "ysl-black-opium": { gender: "WOMEN", isFeatured: true },
      "mugler-angel": { gender: "WOMEN", isFeatured: true },
      "golden-oud": { gender: "UNISEX", isFeatured: true },
    };

    for (const [slug, data] of Object.entries(updates)) {
      await prisma.product.updateMany({
        where: { slug },
        data: {
          gender: data.gender,
          isFeatured: data.isFeatured,
          isPopular: data.isPopular ?? false,
          isActive: true,
        },
      });
    }

    console.log("Restoring original category images...");
    const categoryImages: Record<string, string> = {
      oud: "https://images.unsplash.com/photo-1615634260167-c8cdede054de?auto=format&fit=crop&w=900&q=80",
      floral: "https://images.unsplash.com/photo-1541643600914-78b084683601?auto=format&fit=crop&w=900&q=80",
      woody: "https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?auto=format&fit=crop&w=900&q=80",
      "citrus-fresh": "https://images.unsplash.com/photo-1547887537-6158d64c35b3?auto=format&fit=crop&w=900&q=80",
      "oriental-amber": "https://images.unsplash.com/photo-1610461888750-10bfc601b874?auto=format&fit=crop&w=900&q=80",
      gourmand: "https://images.unsplash.com/photo-1503236823255-94609f598e71?auto=format&fit=crop&w=900&q=80",
      musk: "https://images.unsplash.com/photo-1588405748880-12d1d2a59d75?auto=format&fit=crop&w=900&q=80",
    };

    for (const [slug, image] of Object.entries(categoryImages)) {
      await prisma.category.updateMany({
        where: { slug },
        data: { image },
      });
    }

    console.log("Restoration complete!");
  } catch (err) {
    console.error("Restoration error:", err);
  } finally {
    await prisma.$disconnect();
  }
}

main();
