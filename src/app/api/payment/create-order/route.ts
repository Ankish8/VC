import { createPayPalOrder } from "@/lib/paypal";
import { NextRequest, NextResponse } from "next/server";

/**
 * POST /api/payment/create-order
 * Creates a PayPal order for the Lifetime Deal
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { amount = "39.00" } = body;

    // Get the base URL for return/cancel URLs
    const baseUrl =
      process.env.NEXT_PUBLIC_APP_URL ||
      process.env.NEXTAUTH_URL ||
      "http://localhost:3000";

    // Create PayPal order
    const order = await createPayPalOrder({
      amount,
      currency: "USD",
      description: "VectorCraft Lifetime Deal - Unlimited Vector Conversions",
      returnUrl: `${baseUrl}/api/payment/capture-order`,
      cancelUrl: `${baseUrl}/?payment=cancelled`,
    });

    return NextResponse.json({
      success: true,
      orderId: order.id,
      approvalUrl: order.approvalUrl,
    });
  } catch (error: any) {
    console.error("Error creating PayPal order:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to create PayPal order",
      },
      { status: 500 }
    );
  }
}
