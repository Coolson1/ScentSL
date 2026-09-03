import { PrismaClient } from "@/generated/prisma/client";
import { PrismaNeon } from "@prisma/adapter-neon";

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

function createPrismaClient() {
  // Prefer the pooled connection URL if available (more reliable for serverless)
  const connectionString =
    process.env.DATABASE_URL_POOLED || process.env.DATABASE_URL!;
  const adapter = new PrismaNeon({ connectionString });
  return new PrismaClient({ adapter });
}

// Re-use a single Prisma instance across hot-reloads in dev to avoid
// exhausting Neon connection limits and cold-start timeouts.
export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

/**
 * Execute a DB query with retry logic to handle Neon cold-start failures.
 * The Neon serverless adapter can fail on the first request after a cold start
 * with an `ErrorEvent`. Retrying once or twice resolves it.
 */
export async function withRetry<T>(
  fn: () => Promise<T>,
  retries = 2,
  delayMs = 1000,
): Promise<T> {
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      const isLastAttempt = attempt === retries;
      if (isLastAttempt) throw error;

      console.warn(
        `[Prisma] Query failed (attempt ${attempt + 1}/${retries + 1}), retrying in ${delayMs}ms...`,
        error instanceof Error ? error.message : error,
      );
      await new Promise((resolve) => setTimeout(resolve, delayMs));
    }
  }
  // TypeScript: unreachable, but satisfies the compiler
  throw new Error("withRetry: exhausted retries");
}
