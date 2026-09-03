import { prisma, withRetry } from "./prisma";

export const CART_SESSION_COOKIE = "cart-session";
export const CART_COOKIE_MAX_AGE = 60 * 60 * 24 * 30; // 30 days

type Identity = { userId?: string | null; sessionId?: string | null };

function whereFor({ userId, sessionId }: Identity) {
  if (userId) return { userId };
  if (sessionId) return { sessionId };
  return null;
}

export async function findCart(identity: Identity) {
  const where = whereFor(identity);
  if (!where) return null;
  return prisma.cart.findUnique({ where });
}

export async function getOrCreateCart(identity: Identity) {
  const where = whereFor(identity);
  if (!where) {
    throw new Error("getOrCreateCart requires a userId or sessionId");
  }
  const existing = await prisma.cart.findUnique({ where });
  if (existing) return existing;

  try {
    return await prisma.cart.create({
      data: identity.userId ? { userId: identity.userId } : { sessionId: identity.sessionId! },
    });
  } catch (error) {
    // Concurrency handling: If another request created the cart simultaneously, fetch it
    const createdConcurrently = await prisma.cart.findUnique({ where });
    if (createdConcurrently) return createdConcurrently;
    throw error;
  }
}

export async function getCartWithItems(identity: Identity) {
  const where = whereFor(identity);
  if (!where) return null;
  return prisma.cart.findUnique({
    where,
    include: {
      items: {
        include: {
          variant: { include: { product: true } },
        },
      },
    },
  });
}

export async function getCartItemCount(identity: Identity) {
  const cart = await withRetry(() =>
    prisma.cart.findUnique({
      where: whereFor(identity) ?? { id: "__none__" },
      include: { items: { select: { quantity: true } } },
    }),
  );
  if (!cart) return 0;
  return cart.items.reduce((sum, item) => sum + item.quantity, 0);
}
