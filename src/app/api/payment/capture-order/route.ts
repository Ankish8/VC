import { capturePayPalOrder, isOrderCompleted } from "@/lib/paypal";
import { prisma } from "@/lib/db";
import { sendWelcomeEmail } from "@/lib/email";
import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { trackPurchase, getClientInfo, generateEventId } from "@/lib/facebook-conversions-api";

/**
 * Generate a secure random password
 */
function generateSecurePassword(length: number = 16): string {
  const charset =
    "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*";
  let password = "";
  const randomBytes = crypto.randomBytes(length);

  for (let i = 0; i < length; i++) {
    password += charset[randomBytes[i] % charset.length];
  }

  return password;
}

/**
 * POST /api/payment/capture-order (used by PayPal redirect)
 * GET /api/payment/capture-order (fallback for redirect)
 *
 * Captures the PayPal payment and creates user account
 */
async function handleCaptureOrder(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const token = searchParams.get("token"); // PayPal order ID
    const payerId = searchParams.get("PayerID");

    if (!token) {
      return NextResponse.redirect(
        new URL("/?payment=error&message=missing_order_id", request.url)
      );
    }

    // Capture the PayPal order
    const captureResult = await capturePayPalOrder(token);

    // Verify payment was successful
    if (!isOrderCompleted(captureResult)) {
      return NextResponse.redirect(
        new URL("/?payment=failed&message=payment_not_completed", request.url)
      );
    }

    // Extract payer information
    const payerEmail = captureResult.payer.email_address;
    const payerName = `${captureResult.payer.name.given_name} ${captureResult.payer.name.surname}`;
    const transactionId = captureResult.id;

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: payerEmail },
    });

    if (existingUser) {
      // User already exists, update their subscription
      await prisma.user.update({
        where: { id: existingUser.id },
        data: {
          subscriptionType: "lifetime",
          paymentStatus: "completed",
          paypalTransactionId: transactionId,
          paypalPayerId: payerId || undefined,
          paidAt: new Date(),
          // Set unlimited credits for lifetime users
          creditsRemaining: -1,
          creditsTotal: -1,
          creditsResetDate: null,
        },
      });

      // Track Purchase event in Facebook Conversions API
      const clientInfo = await getClientInfo();
      const eventId = generateEventId();
      await trackPurchase({
        email: payerEmail,
        userId: existingUser.id,
        value: 39.00,
        currency: 'USD',
        transactionId,
        clientIp: clientInfo.ip,
        clientUserAgent: clientInfo.userAgent,
        eventId,
      });

      return NextResponse.redirect(
        new URL(
          "/?payment=success&message=subscription_updated&existing=true",
          request.url
        )
      );
    }

    // Generate temporary password
    const tempPassword = generateSecurePassword(16);
    const hashedPassword = await bcrypt.hash(tempPassword, 12);

    // Create new user account
    const newUser = await prisma.user.create({
      data: {
        email: payerEmail,
        name: payerName,
        password: hashedPassword,
        subscriptionType: "lifetime",
        paymentStatus: "completed",
        paypalTransactionId: transactionId,
        paypalPayerId: payerId || undefined,
        mustChangePassword: true,
        paidAt: new Date(),
        // Set unlimited credits for lifetime users
        creditsRemaining: -1,
        creditsTotal: -1,
        creditsResetDate: null,
      },
    });

    // Send welcome email with credentials
    try {
      await sendWelcomeEmail({
        to: payerEmail,
        name: payerName,
        tempPassword,
      });
      console.log("Welcome email sent to:", payerEmail);
    } catch (emailError: any) {
      console.error("Failed to send welcome email:", emailError);
      // Don't fail the entire process if email fails
      // User account is already created
    }

    // Track Purchase event in Facebook Conversions API
    const clientInfo = await getClientInfo();
    const eventId = generateEventId();
    await trackPurchase({
      email: payerEmail,
      userId: newUser.id,
      value: 39.00,
      currency: 'USD',
      transactionId,
      clientIp: clientInfo.ip,
      clientUserAgent: clientInfo.userAgent,
      eventId,
    });

    // Redirect to success page with transaction ID for email change feature
    return NextResponse.redirect(
      new URL(
        `/?payment=success&email=${encodeURIComponent(payerEmail)}&newUser=true&txn=${encodeURIComponent(transactionId)}`,
        request.url
      )
    );
  } catch (error: any) {
    console.error("Error capturing PayPal order:", error);
    return NextResponse.redirect(
      new URL(
        `/?payment=error&message=${encodeURIComponent(error.message || "capture_failed")}`,
        request.url
      )
    );
  }
}

export async function GET(request: NextRequest) {
  return handleCaptureOrder(request);
}

export async function POST(request: NextRequest) {
  return handleCaptureOrder(request);
}
