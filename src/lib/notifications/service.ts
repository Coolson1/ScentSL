import { prisma } from "@/lib/prisma";
import { sendWebPush, PushNotificationPayload } from "./vapid";

export type NotificationCategory =
  | "TRANSACTIONAL"
  | "SHOPPING"
  | "PERSONALIZED"
  | "ENGAGEMENT";

export type NotificationType =
  | "ORDER_CONFIRMED"
  | "PAYMENT_SUCCESSFUL"
  | "PAYMENT_FAILED"
  | "ORDER_DISPATCHED"
  | "OUT_FOR_DELIVERY"
  | "ORDER_DELIVERED"
  | "ORDER_CANCELLED"
  | "NEW_FRAGRANCE"
  | "NEW_COLLECTION"
  | "BACK_IN_STOCK"
  | "WISHLIST_NOTIFICATION"
  | "RECOMMENDATION"
  | "CART_REMINDER"
  | "RE_ENGAGEMENT"
  | "BROADCAST_ANNOUNCEMENT";

/**
 * Send push notification to a specific user across all their registered devices/browsers.
 * Respects user category preferences and idempotency.
 */
export async function sendNotificationToUser({
  userId,
  type,
  category,
  title,
  message,
  url,
  relatedEntityId,
  idempotencyKey,
}: {
  userId: string;
  type: NotificationType;
  category: NotificationCategory;
  title: string;
  message: string;
  url?: string;
  relatedEntityId?: string;
  idempotencyKey?: string;
}): Promise<{ sent: boolean; count: number }> {
  try {
    // 1. Deduplication check using idempotencyKey
    if (idempotencyKey) {
      const existing = await prisma.notificationLog.findUnique({
        where: { idempotencyKey },
      });
      if (existing) {
        console.log(`[NotificationService] Duplicate event skipped: ${idempotencyKey}`);
        return { sent: false, count: 0 };
      }
    }

    // 2. Check user notification preferences for non-essential categories
    if (category !== "TRANSACTIONAL") {
      const pref = await prisma.userNotificationPreference.findUnique({
        where: { userId },
      });

      if (pref) {
        if (category === "SHOPPING" && !pref.marketing) return { sent: false, count: 0 };
        if (category === "PERSONALIZED" && !pref.recommendations) return { sent: false, count: 0 };
        if (category === "ENGAGEMENT") {
          if (type === "CART_REMINDER" && !pref.cartReminders) return { sent: false, count: 0 };
          if (type === "RE_ENGAGEMENT" && !pref.reEngagement) return { sent: false, count: 0 };
        }
      }
    }

    // 3. Find user active push subscriptions
    const subscriptions = await prisma.pushSubscription.findMany({
      where: { userId },
    });

    // 4. Log notification record
    await prisma.notificationLog.create({
      data: {
        userId,
        type,
        category,
        title,
        message,
        url,
        relatedEntityId,
        idempotencyKey,
        deliveryStatus: subscriptions.length > 0 ? "SENT" : "NO_SUBSCRIPTION",
      },
    });

    if (subscriptions.length === 0) {
      return { sent: false, count: 0 };
    }

    // 5. Deliver push message to all devices
    const payload: PushNotificationPayload = {
      title,
      message,
      url,
      tag: idempotencyKey || `${type}-${userId}`,
      data: { type, relatedEntityId },
    };

    const results = await Promise.all(
      subscriptions.map((sub) => sendWebPush(sub, payload))
    );

    const successCount = results.filter(Boolean).length;
    return { sent: successCount > 0, count: successCount };
  } catch (err) {
    console.error("[NotificationService] Error sending notification to user:", err);
    return { sent: false, count: 0 };
  }
}

/**
 * Send push notification to multiple users (e.g. broadcast or segment).
 */
export async function sendNotificationBroadcast({
  userIds,
  type,
  category,
  title,
  message,
  url,
  relatedEntityId,
  idempotencyKeyPrefix,
}: {
  userIds?: string[];
  type: NotificationType;
  category: NotificationCategory;
  title: string;
  message: string;
  url?: string;
  relatedEntityId?: string;
  idempotencyKeyPrefix?: string;
}): Promise<{ totalSent: number }> {
  try {
    if (userIds && userIds.length > 0) {
      let totalSent = 0;
      for (const uid of userIds) {
        const ik = idempotencyKeyPrefix ? `${idempotencyKeyPrefix}-${uid}` : undefined;
        const res = await sendNotificationToUser({
          userId: uid,
          type,
          category,
          title,
          message,
          url,
          relatedEntityId,
          idempotencyKey: ik,
        });
        totalSent += res.count;
      }
      return { totalSent };
    }

    // Broadcast to ALL active push subscriptions in DB (registered users + guests)
    const subscriptions = await prisma.pushSubscription.findMany();
    if (subscriptions.length === 0) {
      return { totalSent: 0 };
    }

    const payload: PushNotificationPayload = {
      title,
      message,
      url,
      tag: idempotencyKeyPrefix ? `${idempotencyKeyPrefix}-broadcast` : `broadcast-${Date.now()}`,
      data: { type, relatedEntityId },
    };

    // Log notification record
    await prisma.notificationLog.create({
      data: {
        type,
        category,
        title,
        message,
        url,
        relatedEntityId,
        idempotencyKey: idempotencyKeyPrefix ? `${idempotencyKeyPrefix}-${Date.now()}` : undefined,
        deliveryStatus: "SENT",
      },
    });

    const results = await Promise.all(
      subscriptions.map((sub) => sendWebPush(sub, payload))
    );

    const totalSent = results.filter(Boolean).length;
    return { totalSent };
  } catch (err) {
    console.error("[NotificationService] Broadcast error:", err);
    return { totalSent: 0 };
  }
}

// ─── SPECIFIC NOTIFICATION TRIGGERS ───────────────────────

export async function notifyOrderConfirmed(order: { id: string; orderNumber?: string | null; userId?: string | null }) {
  if (!order.userId) return;
  const orderNum = order.orderNumber || order.id.slice(0, 8);
  await sendNotificationToUser({
    userId: order.userId,
    type: "ORDER_CONFIRMED",
    category: "TRANSACTIONAL",
    title: "Order Confirmed 🎉",
    message: `Your ScentSL order #${orderNum} has been confirmed.`,
    url: `/account/orders/${order.id}`,
    relatedEntityId: order.id,
    idempotencyKey: `order-confirmed-${order.id}`,
  });
}

export async function notifyPaymentSuccessful(order: { id: string; orderNumber?: string | null; userId?: string | null }) {
  if (!order.userId) return;
  const orderNum = order.orderNumber || order.id.slice(0, 8);
  await sendNotificationToUser({
    userId: order.userId,
    type: "PAYMENT_SUCCESSFUL",
    category: "TRANSACTIONAL",
    title: "Payment Successful ✨",
    message: `Your payment for order #${orderNum} was successful.`,
    url: `/account/orders/${order.id}`,
    relatedEntityId: order.id,
    idempotencyKey: `payment-successful-${order.id}`,
  });
}

export async function notifyPaymentFailed(order: { id: string; orderNumber?: string | null; userId?: string | null }) {
  if (!order.userId) return;
  const orderNum = order.orderNumber || order.id.slice(0, 8);
  await sendNotificationToUser({
    userId: order.userId,
    type: "PAYMENT_FAILED",
    category: "TRANSACTIONAL",
    title: "Payment Failed ⚠️",
    message: `We couldn't complete the payment for order #${orderNum}. Please try again.`,
    url: `/checkout/pay?orderId=${order.id}`,
    relatedEntityId: order.id,
    idempotencyKey: `payment-failed-${order.id}`,
  });
}

export async function notifyOrderDispatched(order: { id: string; orderNumber?: string | null; userId?: string | null }) {
  if (!order.userId) return;
  const orderNum = order.orderNumber || order.id.slice(0, 8);
  await sendNotificationToUser({
    userId: order.userId,
    type: "ORDER_DISPATCHED",
    category: "TRANSACTIONAL",
    title: "Your Order Has Been Dispatched 🚚",
    message: `Your ScentSL order #${orderNum} is on its way.`,
    url: `/account/orders/${order.id}`,
    relatedEntityId: order.id,
    idempotencyKey: `order-dispatched-${order.id}`,
  });
}

export async function notifyOutForDelivery(order: { id: string; orderNumber?: string | null; userId?: string | null }) {
  if (!order.userId) return;
  const orderNum = order.orderNumber || order.id.slice(0, 8);
  await sendNotificationToUser({
    userId: order.userId,
    type: "OUT_FOR_DELIVERY",
    category: "TRANSACTIONAL",
    title: "Your Order Is Out for Delivery 🚚",
    message: `Your ScentSL order #${orderNum} is on its way to you.`,
    url: `/account/orders/${order.id}`,
    relatedEntityId: order.id,
    idempotencyKey: `order-out-for-delivery-${order.id}`,
  });
}

export async function notifyOrderDelivered(order: { id: string; orderNumber?: string | null; userId?: string | null }) {
  if (!order.userId) return;
  const orderNum = order.orderNumber || order.id.slice(0, 8);
  await sendNotificationToUser({
    userId: order.userId,
    type: "ORDER_DELIVERED",
    category: "TRANSACTIONAL",
    title: "Order Delivered 📦",
    message: `Your ScentSL order #${orderNum} has been delivered. Enjoy your fragrance!`,
    url: `/account/orders/${order.id}`,
    relatedEntityId: order.id,
    idempotencyKey: `order-delivered-${order.id}`,
  });
}

export async function notifyOrderCancelled(order: { id: string; orderNumber?: string | null; userId?: string | null }) {
  if (!order.userId) return;
  const orderNum = order.orderNumber || order.id.slice(0, 8);
  await sendNotificationToUser({
    userId: order.userId,
    type: "ORDER_CANCELLED",
    category: "TRANSACTIONAL",
    title: "Order Cancelled ❌",
    message: `Your ScentSL order #${orderNum} has been cancelled.`,
    url: `/account/orders/${order.id}`,
    relatedEntityId: order.id,
    idempotencyKey: `order-cancelled-${order.id}`,
  });
}

export async function notifyNewFragrance(product: { id: string; name: string; slug: string }) {
  await sendNotificationBroadcast({
    type: "NEW_FRAGRANCE",
    category: "SHOPPING",
    title: "New Fragrance Just Arrived ✨",
    message: `Discover "${product.name}", now available on ScentSL.`,
    url: `/products/${product.slug}`,
    relatedEntityId: product.id,
    idempotencyKeyPrefix: `new-product-${product.id}`,
  });
}

export async function notifyNewCollection(category: { id: string; name: string; slug: string }) {
  await sendNotificationBroadcast({
    type: "NEW_COLLECTION",
    category: "SHOPPING",
    title: "A New Collection Has Arrived ✨",
    message: `Explore our latest "${category.name}" fragrance collection on ScentSL.`,
    url: `/products?category=${category.slug}`,
    relatedEntityId: category.id,
    idempotencyKeyPrefix: `new-collection-${category.id}`,
  });
}

export async function notifyBackInStock(productId: string, productName: string, productSlug: string) {
  // Find users who have this product in their wishlist
  const wishlistEntries = await prisma.wishlistItem.findMany({
    where: { productId },
    select: { userId: true },
  });

  const interestedUserIds = Array.from(new Set(wishlistEntries.map((w) => w.userId)));

  if (interestedUserIds.length > 0) {
    // Priority notify wishlist users
    for (const uid of interestedUserIds) {
      await sendNotificationToUser({
        userId: uid,
        type: "BACK_IN_STOCK",
        category: "SHOPPING",
        title: "Back in Stock 👀",
        message: `"${productName}" from your wishlist is back in stock!`,
        url: `/products/${productSlug}`,
        relatedEntityId: productId,
        idempotencyKey: `back-in-stock-${productId}-${uid}-${Date.now().toString().slice(0, 7)}`,
      });
    }
  }
}

// ─── AUTOMATED JOBS: CART REMINDERS, RE-ENGAGEMENT, RECOMMENDATIONS ───

export async function runCartAbandonmentJob() {
  const cutoffTime = new Date(Date.now() - 30 * 60 * 1000); // 30 mins ago
  const minInterval = new Date(Date.now() - 24 * 60 * 60 * 1000); // at least 24 hours between reminders
  const MAX_REMINDERS = 3;

  // Find carts updated before cutoff with items
  const carts = await prisma.cart.findMany({
    where: {
      userId: { not: null },
      updatedAt: { lte: cutoffTime },
      items: { some: {} },
    },
    include: {
      items: { include: { variant: { include: { product: true } } } },
      user: { include: { activityTracker: true } },
    },
  });

  let processedCount = 0;

  for (const cart of carts) {
    if (!cart.userId || !cart.user) continue;

    const tracker = cart.user.activityTracker;
    const count = tracker?.cartReminderCount || 0;
    const lastSent = tracker?.lastCartReminderSentAt;

    if (count >= MAX_REMINDERS) continue;
    if (lastSent && lastSent > minInterval) continue;

    // Verify user hasn't already completed an order since cart update
    const recentOrder = await prisma.order.findFirst({
      where: {
        userId: cart.userId,
        createdAt: { gte: cart.updatedAt },
        status: { in: ["PAID", "PROCESSING", "SHIPPED", "DELIVERED"] },
      },
    });

    if (recentOrder) continue;

    const firstProduct = cart.items[0]?.variant?.product;
    const productName = firstProduct ? firstProduct.name : "your fragrance";

    const res = await sendNotificationToUser({
      userId: cart.userId,
      type: "CART_REMINDER",
      category: "ENGAGEMENT",
      title: "You Left Something Behind 🛍️",
      message: `"${productName}" is still waiting in your cart.`,
      url: "/cart",
      idempotencyKey: `cart-reminder-${cart.userId}-${count + 1}`,
    });

    if (res.sent) {
      processedCount++;
      await prisma.userActivityTracker.upsert({
        where: { userId: cart.userId },
        create: {
          userId: cart.userId,
          lastCartReminderSentAt: new Date(),
          cartReminderCount: count + 1,
        },
        update: {
          lastCartReminderSentAt: new Date(),
          cartReminderCount: count + 1,
        },
      });
    }
  }

  return { processedCount };
}

export async function runReEngagementJob() {
  const INACTIVITY_DAYS = 7;
  const cutoffTime = new Date(Date.now() - INACTIVITY_DAYS * 24 * 60 * 60 * 1000);
  const minInterval = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  const MAX_RE_ENGAGEMENT = 3;

  const inactiveTrackers = await prisma.userActivityTracker.findMany({
    where: {
      lastVisitedAt: { lte: cutoffTime },
      reEngagementCount: { lt: MAX_RE_ENGAGEMENT },
    },
    include: { user: true },
  });

  let countSent = 0;

  for (const tracker of inactiveTrackers) {
    if (tracker.lastReEngagementSentAt && tracker.lastReEngagementSentAt > minInterval) {
      continue;
    }

    const res = await sendNotificationToUser({
      userId: tracker.userId,
      type: "RE_ENGAGEMENT",
      category: "ENGAGEMENT",
      title: "Still Looking for Your Next Fragrance? ✨",
      message: "Discover our latest luxury scent arrivals on ScentSL.",
      url: "/products",
      idempotencyKey: `reengagement-${tracker.userId}-${tracker.reEngagementCount + 1}`,
    });

    if (res.sent) {
      countSent++;
      await prisma.userActivityTracker.update({
        where: { userId: tracker.userId },
        data: {
          lastReEngagementSentAt: new Date(),
          reEngagementCount: tracker.reEngagementCount + 1,
        },
      });
    }
  }

  return { countSent };
}

export async function runPersonalizedRecommendationsJob() {
  const usersWithSubs = await prisma.pushSubscription.findMany({
    where: { userId: { not: null } },
    select: { userId: true },
    distinct: ["userId"],
  });

  let countSent = 0;

  for (const sub of usersWithSubs) {
    const uid = sub.userId!;

    // Analyze customer past orders & wishlist
    const wishlistItems = await prisma.wishlistItem.findMany({
      where: { userId: uid },
      include: { product: { include: { category: true } } },
    });

    const orders = await prisma.order.findMany({
      where: { userId: uid },
      include: { items: { include: { product: { include: { category: true } } } } },
    });

    let recProduct = null;

    if (wishlistItems.length > 0) {
      recProduct = wishlistItems[0].product;
    } else if (orders.length > 0 && orders[0].items.length > 0) {
      const catId = orders[0].items[0].product.categoryId;
      recProduct = await prisma.product.findFirst({
        where: { categoryId: catId, isActive: true },
      });
    }

    if (!recProduct) {
      // Fallback: popular fragrance
      recProduct = await prisma.product.findFirst({
        where: { isPopular: true, isActive: true },
      });
    }

    if (recProduct) {
      const res = await sendNotificationToUser({
        userId: uid,
        type: "RECOMMENDATION",
        category: "PERSONALIZED",
        title: "A Fragrance You Might Love ✨",
        message: `Based on your luxury fragrance preferences, take a look at "${recProduct.name}".`,
        url: `/products/${recProduct.slug}`,
        relatedEntityId: recProduct.id,
        idempotencyKey: `recommendation-${uid}-${recProduct.id}`,
      });
      if (res.sent) countSent++;
    }
  }

  return { countSent };
}
