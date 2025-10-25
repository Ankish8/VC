import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { clearPayPalCredentialsCache } from "@/lib/paypal";

/**
 * GET /api/admin/paypal-config
 * Fetch PayPal configuration (credentials are masked for security)
 */
export async function GET() {
  try {
    const session = await auth();

    if (!session?.user || !(session.user as any).isAdmin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get or create site settings
    let settings = await prisma.siteSettings.findFirst();

    if (!settings) {
      settings = await prisma.siteSettings.create({
        data: {},
      });
    }

    // Return settings with masked secrets for security
    return NextResponse.json({
      paypalMode: settings.paypalMode,
      paypalSandboxClientId: settings.paypalSandboxClientId || "",
      paypalSandboxSecret: settings.paypalSandboxSecret ? maskSecret(settings.paypalSandboxSecret) : "",
      paypalLiveClientId: settings.paypalLiveClientId || "",
      paypalLiveSecret: settings.paypalLiveSecret ? maskSecret(settings.paypalLiveSecret) : "",
    });
  } catch (error) {
    console.error("Error fetching PayPal config:", error);
    return NextResponse.json({ error: "Failed to fetch PayPal configuration" }, { status: 500 });
  }
}

/**
 * PUT /api/admin/paypal-config
 * Update PayPal configuration
 */
export async function PUT(req: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user || !(session.user as any).isAdmin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const {
      paypalMode,
      paypalSandboxClientId,
      paypalSandboxSecret,
      paypalLiveClientId,
      paypalLiveSecret,
    } = body;

    // Validate mode
    if (paypalMode && !["sandbox", "live"].includes(paypalMode)) {
      return NextResponse.json({ error: "Invalid PayPal mode" }, { status: 400 });
    }

    // Get or create site settings
    let settings = await prisma.siteSettings.findFirst();

    if (!settings) {
      settings = await prisma.siteSettings.create({
        data: {},
      });
    }

    // Prepare update data - only update non-masked values
    const updateData: any = {};

    if (paypalMode !== undefined) {
      updateData.paypalMode = paypalMode;
    }

    // Only update credentials if they're not masked (masked values start with •)
    if (paypalSandboxClientId !== undefined && !paypalSandboxClientId.startsWith("•")) {
      updateData.paypalSandboxClientId = paypalSandboxClientId;
    }

    if (paypalSandboxSecret !== undefined && !paypalSandboxSecret.startsWith("•")) {
      updateData.paypalSandboxSecret = paypalSandboxSecret;
    }

    if (paypalLiveClientId !== undefined && !paypalLiveClientId.startsWith("•")) {
      updateData.paypalLiveClientId = paypalLiveClientId;
    }

    if (paypalLiveSecret !== undefined && !paypalLiveSecret.startsWith("•")) {
      updateData.paypalLiveSecret = paypalLiveSecret;
    }

    // Update settings
    const updatedSettings = await prisma.siteSettings.update({
      where: { id: settings.id },
      data: updateData,
    });

    // Clear the credentials cache so the new credentials are used immediately
    clearPayPalCredentialsCache();

    return NextResponse.json({
      success: true,
      message: "PayPal configuration updated successfully",
    });
  } catch (error) {
    console.error("Error updating PayPal config:", error);
    return NextResponse.json({ error: "Failed to update PayPal configuration" }, { status: 500 });
  }
}

/**
 * Helper function to mask secrets
 */
function maskSecret(secret: string): string {
  if (!secret || secret.length < 8) return secret;
  return "•".repeat(secret.length - 4) + secret.slice(-4);
}
