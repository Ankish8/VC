/**
 * PayPal REST API Integration
 * Uses PayPal Standard (redirect flow)
 */

const PAYPAL_CLIENT_ID = process.env.PAYPAL_CLIENT_ID!;
const PAYPAL_CLIENT_SECRET = process.env.PAYPAL_CLIENT_SECRET!;
const PAYPAL_MODE = process.env.PAYPAL_MODE || "sandbox"; // sandbox or live

const PAYPAL_API_BASE =
  PAYPAL_MODE === "live"
    ? "https://api-m.paypal.com"
    : "https://api-m.sandbox.paypal.com";

/**
 * Get PayPal access token for API calls
 */
async function getAccessToken(): Promise<string> {
  const auth = Buffer.from(
    `${PAYPAL_CLIENT_ID}:${PAYPAL_CLIENT_SECRET}`
  ).toString("base64");

  const response = await fetch(`${PAYPAL_API_BASE}/v1/oauth2/token`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${auth}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: "grant_type=client_credentials",
  });

  if (!response.ok) {
    throw new Error("Failed to get PayPal access token");
  }

  const data = await response.json();
  return data.access_token;
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
