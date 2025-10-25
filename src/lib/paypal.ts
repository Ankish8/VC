/**
 * PayPal REST API Integration
 * Uses PayPal Standard (redirect flow)
 * Credentials are sourced from database with environment variable fallback
 */

import { prisma } from "@/lib/db";

// Cache for PayPal credentials to avoid database queries on every request
let credentialsCache: {
  mode: string;
  clientId: string;
  clientSecret: string;
  lastFetch: number;
} | null = null;

const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

/**
 * Get PayPal credentials from database or environment variables
 */
async function getPayPalCredentials(): Promise<{
  mode: string;
  clientId: string;
  clientSecret: string;
}> {
  // Check cache first
  if (credentialsCache && Date.now() - credentialsCache.lastFetch < CACHE_TTL) {
    return {
      mode: credentialsCache.mode,
      clientId: credentialsCache.clientId,
      clientSecret: credentialsCache.clientSecret,
    };
  }

  try {
    // Try to get credentials from database
    const settings = await prisma.siteSettings.findFirst();

    if (settings) {
      const mode = settings.paypalMode || "sandbox";
      const clientId =
        mode === "sandbox"
          ? settings.paypalSandboxClientId
          : settings.paypalLiveClientId;
      const clientSecret =
        mode === "sandbox"
          ? settings.paypalSandboxSecret
          : settings.paypalLiveSecret;

      if (clientId && clientSecret) {
        // Update cache
        credentialsCache = {
          mode,
          clientId,
          clientSecret,
          lastFetch: Date.now(),
        };

        return { mode, clientId, clientSecret };
      }
    }
  } catch (error) {
    console.warn("Failed to fetch PayPal credentials from database, falling back to env vars:", error);
  }

  // Fallback to environment variables
  const mode = process.env.PAYPAL_MODE?.trim() || "sandbox";
  const clientId = process.env.PAYPAL_CLIENT_ID?.trim() || "";
  const clientSecret = process.env.PAYPAL_CLIENT_SECRET?.trim() || "";

  if (!clientId || !clientSecret) {
    throw new Error("PayPal credentials are not configured in database or environment variables");
  }

  // Update cache
  credentialsCache = {
    mode,
    clientId,
    clientSecret,
    lastFetch: Date.now(),
  };

  return { mode, clientId, clientSecret };
}

/**
 * Get PayPal access token for API calls
 */
async function getAccessToken(): Promise<string> {
  const { mode, clientId, clientSecret } = await getPayPalCredentials();

  const PAYPAL_API_BASE =
    mode === "live"
      ? "https://api-m.paypal.com"
      : "https://api-m.sandbox.paypal.com";

  const auth = Buffer.from(
    `${clientId}:${clientSecret}`
  ).toString("base64");

  console.log("Requesting PayPal access token:", {
    apiBase: PAYPAL_API_BASE,
    mode,
  });

  const response = await fetch(`${PAYPAL_API_BASE}/v1/oauth2/token`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${auth}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: "grant_type=client_credentials",
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error("PayPal access token error:", {
      status: response.status,
      statusText: response.statusText,
      error: errorText,
    });
    throw new Error(`Failed to get PayPal access token: ${response.status} ${errorText}`);
  }

  const data = await response.json();
  return data.access_token;
}

/**
 * Clear credentials cache (call this when updating PayPal config)
 */
export function clearPayPalCredentialsCache() {
  credentialsCache = null;
}

export interface CreateOrderParams {
  amount: string;
  currency?: string;
  description?: string;
  returnUrl: string;
  cancelUrl: string;
}

export interface PayPalOrder {
  id: string;
  status: string;
  approvalUrl: string;
}

/**
 * Create a PayPal order for the Lifetime Deal
 */
export async function createPayPalOrder(
  params: CreateOrderParams
): Promise<PayPalOrder> {
  const accessToken = await getAccessToken();
  const { mode } = await getPayPalCredentials();

  const PAYPAL_API_BASE =
    mode === "live"
      ? "https://api-m.paypal.com"
      : "https://api-m.sandbox.paypal.com";

  const orderData = {
    intent: "CAPTURE",
    purchase_units: [
      {
        amount: {
          currency_code: params.currency || "USD",
          value: params.amount,
        },
        description: params.description || "VectorCraft Lifetime Deal",
      },
    ],
    application_context: {
      brand_name: "VectorCraft",
      landing_page: "BILLING",
      user_action: "PAY_NOW",
      return_url: params.returnUrl,
      cancel_url: params.cancelUrl,
    },
  };

  const response = await fetch(`${PAYPAL_API_BASE}/v2/checkout/orders`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify(orderData),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(`PayPal API error: ${JSON.stringify(error)}`);
  }

  const order = await response.json();

  // Find the approval URL
  const approvalUrl = order.links?.find(
    (link: any) => link.rel === "approve"
  )?.href;

  if (!approvalUrl) {
    throw new Error("No approval URL found in PayPal response");
  }

  return {
    id: order.id,
    status: order.status,
    approvalUrl,
  };
}

export interface CaptureOrderResult {
  id: string;
  status: string;
  payer: {
    email_address: string;
    payer_id: string;
    name: {
      given_name: string;
      surname: string;
    };
  };
  purchase_units: Array<{
    payments: {
      captures: Array<{
        id: string;
        status: string;
        amount: {
          currency_code: string;
          value: string;
        };
      }>;
    };
  }>;
}

/**
 * Capture a PayPal order after user approval
 */
export async function capturePayPalOrder(
  orderId: string
): Promise<CaptureOrderResult> {
  const accessToken = await getAccessToken();
  const { mode } = await getPayPalCredentials();

  const PAYPAL_API_BASE =
    mode === "live"
      ? "https://api-m.paypal.com"
      : "https://api-m.sandbox.paypal.com";

  const response = await fetch(
    `${PAYPAL_API_BASE}/v2/checkout/orders/${orderId}/capture`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(`PayPal capture error: ${JSON.stringify(error)}`);
  }

  const captureData = await response.json();
  return captureData;
}

/**
 * Verify that the order was successfully completed
 */
export function isOrderCompleted(captureResult: CaptureOrderResult): boolean {
  return (
    captureResult.status === "COMPLETED" &&
    captureResult.purchase_units[0]?.payments?.captures[0]?.status ===
      "COMPLETED"
  );
}

// =====================================================
// PayPal Subscriptions API
// =====================================================

export interface CreateSubscriptionPlanParams {
  name: string;
  description: string;
  amount: string;
  currency?: string;
  interval: 'MONTH' | 'YEAR';
  intervalCount?: number;
}

export interface SubscriptionPlan {
  id: string;
  name: string;
  status: string;
}

/**
 * Create a subscription plan in PayPal
 * This needs to be done once for each plan (monthly/yearly for each tier)
 */
export async function createSubscriptionPlan(
  name: string,
  description: string,
  amount: string,
  interval: 'MONTH' | 'YEAR',
  currency: string = "USD"
): Promise<SubscriptionPlan> {
  const accessToken = await getAccessToken();
  const { mode } = await getPayPalCredentials();

  const PAYPAL_API_BASE =
    mode === "live"
      ? "https://api-m.paypal.com"
      : "https://api-m.sandbox.paypal.com";

  const planData = {
    product_id: await getOrCreateProduct("VectorCraft"),
    name: name,
    description: description,
    status: "ACTIVE",
    billing_cycles: [
      {
        frequency: {
          interval_unit: interval,
          interval_count: 1,
        },
        tenure_type: "REGULAR",
        sequence: 1,
        total_cycles: 0, // 0 = infinite
        pricing_scheme: {
          fixed_price: {
            value: amount,
            currency_code: currency,
          },
        },
      },
    ],
    payment_preferences: {
      auto_bill_outstanding: true,
      setup_fee: {
        value: "0",
        currency_code: currency,
      },
      setup_fee_failure_action: "CONTINUE",
      payment_failure_threshold: 3,
    },
  };

  const response = await fetch(`${PAYPAL_API_BASE}/v1/billing/plans`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify(planData),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(`PayPal create plan error: ${JSON.stringify(error)}`);
  }

  const plan = await response.json();
  return {
    id: plan.id,
    name: plan.name,
    status: plan.status,
  };
}

/**
 * Get or create a PayPal product (required for subscription plans)
 */
async function getOrCreateProduct(name: string): Promise<string> {
  const accessToken = await getAccessToken();
  const { mode } = await getPayPalCredentials();

  const PAYPAL_API_BASE =
    mode === "live"
      ? "https://api-m.paypal.com"
      : "https://api-m.sandbox.paypal.com";

  // For simplicity, we'll create a product or use a hardcoded one
  // In production, you might want to store this in your database
  const productData = {
    name: name,
    description: "VectorCraft Image Conversion Service",
    type: "SERVICE",
    category: "SOFTWARE",
  };

  const response = await fetch(`${PAYPAL_API_BASE}/v1/catalogs/products`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify(productData),
  });

  if (response.ok) {
    const product = await response.json();
    return product.id;
  }

  // If product already exists, you might get an error
  // For now, throw the error - in production you'd handle this better
  const error = await response.json();

  // If it's a duplicate, you might have a product ID in your env
  if (process.env.PAYPAL_PRODUCT_ID) {
    return process.env.PAYPAL_PRODUCT_ID;
  }

  throw new Error(`PayPal create product error: ${JSON.stringify(error)}`);
}

export interface CreateSubscriptionParams {
  planId: string;
  returnUrl: string;
  cancelUrl: string;
}

export interface PayPalSubscription {
  id: string;
  status: string;
  approvalUrl: string;
}

/**
 * Create a subscription for a user
 */
export async function createSubscription(
  params: CreateSubscriptionParams
): Promise<PayPalSubscription> {
  const accessToken = await getAccessToken();
  const { mode } = await getPayPalCredentials();

  const PAYPAL_API_BASE =
    mode === "live"
      ? "https://api-m.paypal.com"
      : "https://api-m.sandbox.paypal.com";

  const subscriptionData = {
    plan_id: params.planId,
    application_context: {
      brand_name: "VectorCraft",
      locale: "en-US",
      shipping_preference: "NO_SHIPPING",
      user_action: "SUBSCRIBE_NOW",
      payment_method: {
        payer_selected: "PAYPAL",
        payee_preferred: "IMMEDIATE_PAYMENT_REQUIRED",
      },
      return_url: params.returnUrl,
      cancel_url: params.cancelUrl,
    },
  };

  const response = await fetch(`${PAYPAL_API_BASE}/v1/billing/subscriptions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify(subscriptionData),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(`PayPal create subscription error: ${JSON.stringify(error)}`);
  }

  const subscription = await response.json();

  // Find the approval URL
  const approvalUrl = subscription.links?.find(
    (link: any) => link.rel === "approve"
  )?.href;

  if (!approvalUrl) {
    throw new Error("No approval URL found in PayPal subscription response");
  }

  return {
    id: subscription.id,
    status: subscription.status,
    approvalUrl,
  };
}

export interface SubscriptionDetails {
  id: string;
  status: string;
  plan_id: string;
  subscriber: {
    email_address: string;
    payer_id: string;
    name: {
      given_name: string;
      surname: string;
    };
  };
  billing_info: {
    next_billing_time: string;
    last_payment: {
      amount: {
        currency_code: string;
        value: string;
      };
      time: string;
    };
  };
}

/**
 * Get subscription details
 */
export async function getSubscriptionDetails(
  subscriptionId: string
): Promise<SubscriptionDetails> {
  const accessToken = await getAccessToken();
  const { mode } = await getPayPalCredentials();

  const PAYPAL_API_BASE =
    mode === "live"
      ? "https://api-m.paypal.com"
      : "https://api-m.sandbox.paypal.com";

  const response = await fetch(
    `${PAYPAL_API_BASE}/v1/billing/subscriptions/${subscriptionId}`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(`PayPal get subscription error: ${JSON.stringify(error)}`);
  }

  return await response.json();
}

/**
 * Cancel a subscription
 */
export async function cancelSubscription(
  subscriptionId: string,
  reason?: string
): Promise<void> {
  const accessToken = await getAccessToken();
  const { mode } = await getPayPalCredentials();

  const PAYPAL_API_BASE =
    mode === "live"
      ? "https://api-m.paypal.com"
      : "https://api-m.sandbox.paypal.com";

  const response = await fetch(
    `${PAYPAL_API_BASE}/v1/billing/subscriptions/${subscriptionId}/cancel`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({
        reason: reason || "User requested cancellation",
      }),
    }
  );

  if (!response.ok && response.status !== 204) {
    const error = await response.json();
    throw new Error(`PayPal cancel subscription error: ${JSON.stringify(error)}`);
  }
}
