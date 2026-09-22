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
    console.log("Applying raw SQL migration...");
    await prisma.$executeRawUnsafe(`
      DO $$ BEGIN
        CREATE TYPE "Gender" AS ENUM ('MEN', 'WOMEN', 'UNISEX');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `);

    await prisma.$executeRawUnsafe(`
      ALTER TABLE "Product" ADD COLUMN IF NOT EXISTS "gender" "Gender" NOT NULL DEFAULT 'UNISEX';
    `);

    await prisma.$executeRawUnsafe(`
      CREATE INDEX IF NOT EXISTS "Product_isActive_gender_idx" ON "Product"("isActive", "gender");
    `);

    console.log("Migration executed successfully!");
  } catch (err) {
    console.error("Migration error:", err);
  } finally {
    await prisma.$disconnect();
  }
}

main();
