import { PrismaClient } from "@/generated/prisma/client";
import { PrismaNeon } from "@prisma/adapter-neon";

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

function createPrismaClient() {
  // Respect process.env.DATABASE_URL first, falling back to process.env.DATABASE_URL_POOLED
  const connectionString =
    process.env.DATABASE_URL || process.env.DATABASE_URL_POOLED || "";
  const adapter = new PrismaNeon(
    {
      connectionString,
      connectionTimeoutMillis: 15000,
      idleTimeoutMillis: 30000,
      max: 10,
    },
    {
      onPoolError: (err) => {
        console.warn("[Prisma] Neon pool warning:", err?.message || "pool connection reset");
      },
      onConnectionError: (err) => {
        console.warn("[Prisma] Neon connection warning:", err?.message || "connection reset");
      },
    }
  );
  return new PrismaClient({ adapter });
}

// Re-use a single Prisma instance across HMR and production to avoid WebSocket pool exhaustion
export const prisma = (globalForPrisma.prisma ??= createPrismaClient());

function formatPrismaError(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }
  if (typeof error === "object" && error !== null) {
    const errObj = error as { message?: string; type?: string; error?: { message?: string } };
    if (errObj.message) return errObj.message;
    if (errObj.error?.message) return errObj.error.message;
    if (errObj.type === "error") return "Neon WebSocket connection closed or timed out";
    if (errObj.type) return errObj.type;
  }
  return String(error);
}

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
      const errorMessage = formatPrismaError(error);

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
    `[Prisma] Query failed: ${formatPrismaError(lastError)}`,
  );
}
