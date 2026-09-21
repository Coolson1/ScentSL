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

// Re-use a single Prisma instance in production to avoid connection leaks,
// but refresh in development so schema updates (e.g. new fields) take effect immediately.
export const prisma =
  process.env.NODE_ENV === "production"
    ? (globalForPrisma.prisma ??= createPrismaClient())
    : (globalForPrisma.prisma = createPrismaClient());

/**
 * Execute a DB query with retry logic to handle Neon cold-start failures.
 * The Neon serverless adapter can fail on the first request after a cold start
 * with an `ErrorEvent`. Retrying once or twice resolves it.
 */
export async function withRetry<T>(
  fn: () => Promise<T>,
  retries = 3,
  delayMs = 1200,
): Promise<T> {
  let lastError: unknown;
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      const isLastAttempt = attempt === retries;

      const errorMessage =
        error instanceof Error
          ? error.message
          : typeof error === "object" && error !== null
            ? (error as any).message || (error as any).type || JSON.stringify(error)
            : String(error);

      if (isLastAttempt) {
        throw new Error(
          `[Prisma] Database query failed after ${retries + 1} attempts: ${errorMessage}`,
        );
      }

      console.warn(
        `[Prisma] Query attempt ${attempt + 1}/${retries + 1} failed (${errorMessage}). Retrying in ${delayMs}ms...`,
      );
      await new Promise((resolve) => setTimeout(resolve, delayMs));
    }
  }
  throw new Error(
    `[Prisma] Query failed: ${lastError instanceof Error ? lastError.message : String(lastError)}`,
  );
}
