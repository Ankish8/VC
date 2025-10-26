import { createPayPalOrder } from "@/lib/paypal";
import { NextRequest, NextResponse } from "next/server";

/**
 * POST /api/payment/create-order
 * Creates a PayPal order for the Lifetime Deal
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { amount = "39.00", fbp, fbc, eventId } = body;

    // Store Facebook tracking data in a way that survives the redirect
    // We'll encode it and pass it through PayPal's return URL
    const trackingData = Buffer.from(JSON.stringify({ fbp, fbc, eventId })).toString('base64');

    // Get the base URL for return/cancel URLs
    const baseUrl =
      process.env.NEXT_PUBLIC_APP_URL ||
      process.env.NEXTAUTH_URL ||
      "http://localhost:3000";

    console.log("Creating PayPal order:", {
      amount,
      baseUrl,
      hasClientId: !!process.env.PAYPAL_CLIENT_ID,
      hasClientSecret: !!process.env.PAYPAL_CLIENT_SECRET,
      mode: process.env.PAYPAL_MODE,
    });

    // Create PayPal order
    const order = await createPayPalOrder({
      amount,
      currency: "USD",
      description: "VectorCraft Lifetime Deal - Unlimited Vector Conversions",
      returnUrl: `${baseUrl}/api/payment/capture-order?tracking=${encodeURIComponent(trackingData)}`,
      cancelUrl: `${baseUrl}/?payment=cancelled`,
    });

    console.log("PayPal order created successfully:", {
      orderId: order.id,
      status: order.status,
    });

    return NextResponse.json({
      success: true,
      orderId: order.id,
      approvalUrl: order.approvalUrl,
    });
  } catch (error: any) {
    console.error("Error creating PayPal order:", {
      message: error.message,
      stack: error.stack,
    });
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to create PayPal order",
      },
      { status: 500 }
    );
  }
}
