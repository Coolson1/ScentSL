import { PrismaClient } from "@/generated/prisma/client";
import { PrismaNeon } from "@prisma/adapter-neon";

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

function createPrismaClient() {
  const adapter = new PrismaNeon({ connectionString: process.env.DATABASE_URL! });
  return new PrismaClient({ adapter, log: ["query"] });
}

// Reset cached Prisma instance if new models are missing (e.g. after schema changes)
if (
  globalForPrisma.prisma &&
  (
    !("vendor" in (globalForPrisma.prisma as object)) ||
    !("payment" in (globalForPrisma.prisma as object))
  )
) {
  globalForPrisma.prisma = undefined;
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
