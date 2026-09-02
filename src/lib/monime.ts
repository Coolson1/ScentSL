/**
 * src/lib/monime.ts
 * Server-only Monime API client.
 * All functions must be called from server-side code only (API routes, Server Components).
 */

const MONIME_API_URL =
  process.env.MONIME_API_URL || "https://api.monime.io/v1";

/** Monime-supported brand color matching the marketplace's brand-gold */
const BRAND_PRIMARY_COLOR = "#C9A84C";

function getMonimeHeaders(idempotencyKey?: string): HeadersInit {
  const apiKey = process.env.MONIME_API_KEY;
  const spaceId = process.env.MONIME_WORKSPACE_ID;

  if (!apiKey || !spaceId) {
    throw new Error(
      "MONIME_API_KEY and MONIME_WORKSPACE_ID must be set in environment variables"
    );
  }

  const headers: Record<string, string> = {
    Authorization: `Bearer ${apiKey}`,
    "Monime-Space-Id": spaceId,
    "Content-Type": "application/json",
  };

  if (idempotencyKey) {
    headers["Idempotency-Key"] = idempotencyKey;
  }

  return headers;
}

export type MonimeLineItem = {
  name: string;
  price: {
    currency: string;
    value: number;
  };
  type: "custom";
  quantity: number;
  description?: string;
  images?: string[];
  reference?: string;
};

export type MonimeCheckoutSession = {
  id: string;
  status: "pending" | "completed" | "cancelled" | "expired";
  redirectUrl: string;
  cancelUrl: string;
  successUrl: string;
  reference?: string;
  orderNumber?: string;
};

export type CreateCheckoutSessionParams = {
  orderId: string;
  orderNumber: string;
  lineItems: MonimeLineItem[];
  successUrl: string;
  cancelUrl: string;
  name?: string;
  description?: string;
};

/**
 * Creates a new Monime hosted checkout session.
 * Returns the session ID and redirectUrl to send the customer to.
 */
export async function createCheckoutSession(
  params: CreateCheckoutSessionParams
): Promise<{ id: string; redirectUrl: string }> {
  const url = `${MONIME_API_URL.replace(/\/+$/, "")}/checkout-sessions`;
  const idempotencyKey = `checkout-${params.orderId}`;

  const body = {
    name:
      params.name ||
      `Order #${params.orderNumber.slice(-8).toUpperCase()} — ScentSL`,
    lineItems: params.lineItems,
    reference: params.orderId,
    description:
      params.description ||
      `ScentSL perfume order — ref ${params.orderId}`,
    cancelUrl: params.cancelUrl,
    successUrl: params.successUrl,
    brandingOptions: {
      primaryColor: BRAND_PRIMARY_COLOR,
    },
  };

  const response = await fetch(url, {
    method: "POST",
    headers: getMonimeHeaders(idempotencyKey),
    body: JSON.stringify(body),
  });

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    console.error("[Monime] createCheckoutSession error:", {
      status: response.status,
      data,
    });
    throw new Error(
      `Monime API error (${response.status}): ${data?.message || "Unknown error"}`
    );
  }

  if (!data?.result?.redirectUrl) {
    console.error("[Monime] createCheckoutSession missing redirectUrl:", data);
    throw new Error("Monime did not return a redirectUrl");
  }

  return {
    id: data.result.id as string,
    redirectUrl: data.result.redirectUrl as string,
  };
}

/**
 * Retrieves a checkout session by ID to verify its current status.
 * Used for server-side payment verification.
 */
export async function getCheckoutSession(
  sessionId: string
): Promise<MonimeCheckoutSession> {
  const url = `${MONIME_API_URL.replace(/\/+$/, "")}/checkout-sessions/${sessionId}`;

  const response = await fetch(url, {
    method: "GET",
    headers: getMonimeHeaders(),
    // Next.js: no-store to always get fresh data
    cache: "no-store",
  });

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    console.error("[Monime] getCheckoutSession error:", {
      sessionId,
      status: response.status,
      data,
    });
    throw new Error(
      `Monime API error (${response.status}): ${data?.message || "Unknown error"}`
    );
  }

  return data.result as MonimeCheckoutSession;
}

export async function verifyWebhookSignature(
  rawBody: string,
  signatureHeader: string | null
): Promise<boolean> {
  const secret = process.env.MONIME_WEBHOOK_SECRET;
  if (!secret) {
    console.error("[Monime] MONIME_WEBHOOK_SECRET is not set");
    return false;
  }

  if (!signatureHeader) {
    console.warn("[Monime] No signature header present");
    return false;
  }

  try {
    // 1. Parse signature header (e.g. t=123,v1=abc,v2=def)
    const elements = signatureHeader.split(",").map((s) => s.trim());
    let timestamp = "";
    const signatures: string[] = [];

    for (const el of elements) {
      if (el.startsWith("t=")) {
        timestamp = el.slice(2);
      } else if (el.startsWith("v1=")) {
        signatures.push(el.slice(3));
      }
    }

    if (!timestamp || signatures.length === 0) {
      // Fallback for older test webhooks that might send plain hex without t= prefix
      // Only allowed if the provided string is a 64 char hex string (sha256)
      if (signatureHeader.length === 64 && /^[0-9a-f]{64}$/i.test(signatureHeader)) {
        signatures.push(signatureHeader);
        timestamp = ""; // No timestamp check for fallback
      } else {
        console.warn("[Monime] Malformed signature header");
        return false;
      }
    }

    // 2. Validate timestamp for replay attacks (5 minutes tolerance)
    if (timestamp) {
      const now = Math.floor(Date.now() / 1000);
      const ts = parseInt(timestamp, 10);
      if (isNaN(ts)) return false;

      const tolerance = 5 * 60; // 5 minutes
      if (Math.abs(now - ts) > tolerance) {
        console.warn("[Monime] Webhook signature timestamp out of tolerance");
        return false;
      }
    }

    // 3. Compute expected signature
    // The canonical payload is `${timestamp}.${rawBody}` if a timestamp is present,
    // otherwise just `rawBody` for the fallback case.
    const signedPayload = timestamp ? `${timestamp}.${rawBody}` : rawBody;

    const encoder = new TextEncoder();
    const keyData = encoder.encode(secret);
    const messageData = encoder.encode(signedPayload);

    const cryptoKey = await crypto.subtle.importKey(
      "raw",
      keyData,
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["sign"]
    );

    const signatureBytes = await crypto.subtle.sign(
      "HMAC",
      cryptoKey,
      messageData
    );
    const computedHex = Array.from(new Uint8Array(signatureBytes))
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");

    // 4. Constant-time comparison
    let isValid = false;
    for (const providedHex of signatures) {
      if (computedHex.length === providedHex.length) {
        let diff = 0;
        for (let i = 0; i < computedHex.length; i++) {
          diff |= computedHex.charCodeAt(i) ^ providedHex.charCodeAt(i);
        }
        if (diff === 0) {
          isValid = true;
          break;
        }
      }
    }

    if (!isValid) {
      console.warn("[Monime] Signature mismatch");
    }

    return isValid;
  } catch (err) {
    console.error("[Monime] Webhook signature verification error");
    return false;
  }
}
