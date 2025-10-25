import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

/**
 * POST /api/admin/paypal-config/test
 * Test PayPal connection with current credentials
 */
export async function POST(req: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user || !(session.user as any).isAdmin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { mode } = body;

    if (!mode || !["sandbox", "live"].includes(mode)) {
      return NextResponse.json({ error: "Invalid mode" }, { status: 400 });
    }

    // Get site settings
    const settings = await prisma.siteSettings.findFirst();

    if (!settings) {
      return NextResponse.json({
        success: false,
        error: "No PayPal configuration found. Please save your credentials first.",
      }, { status: 404 });
    }

    // Get credentials based on mode
    const clientId = mode === "sandbox" ? settings.paypalSandboxClientId : settings.paypalLiveClientId;
    const secret = mode === "sandbox" ? settings.paypalSandboxSecret : settings.paypalLiveSecret;

    if (!clientId || !secret) {
      return NextResponse.json({
        success: false,
        error: `No ${mode} credentials configured. Please save your ${mode} credentials first.`,
      }, { status: 400 });
    }

    // Test PayPal connection by getting an access token
    const PAYPAL_API_BASE =
      mode === "live"
        ? "https://api-m.paypal.com"
        : "https://api-m.sandbox.paypal.com";

    const auth_string = Buffer.from(`${clientId.trim()}:${secret.trim()}`).toString("base64");

    const response = await fetch(`${PAYPAL_API_BASE}/v1/oauth2/token`, {
      method: "POST",
      headers: {
        Authorization: `Basic ${auth_string}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: "grant_type=client_credentials",
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("PayPal test connection error:", {
        status: response.status,
        error: errorText,
      });

      return NextResponse.json({
        success: false,
        error: `Connection failed: ${response.status} - Invalid credentials or API error`,
      }, { status: 400 });
    }

    const data = await response.json();

    if (data.access_token) {
      return NextResponse.json({
        success: true,
        message: `Successfully connected to PayPal ${mode} environment!`,
      });
    } else {
      return NextResponse.json({
        success: false,
        error: "Connection test failed: No access token received",
      }, { status: 400 });
    }
  } catch (error: any) {
    console.error("Error testing PayPal connection:", error);
    return NextResponse.json({
      success: false,
      error: error.message || "Failed to test PayPal connection",
    }, { status: 500 });
  }
}
