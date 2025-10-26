import { prisma } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import crypto from "crypto";
import { checkRateLimit, getRateLimitResetTime } from "@/lib/rate-limit";
import { sendPasswordResetEmail } from "@/lib/email";

const forgotPasswordSchema = z.object({
  email: z.string().email("Invalid email address"),
});

/**
 * POST /api/auth/forgot-password
 * Request a password reset email
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email } = forgotPasswordSchema.parse(body);

    // Rate limiting: 3 requests per hour per email
    if (!checkRateLimit(email, { windowMs: 60 * 60 * 1000, maxRequests: 3 })) {
      const resetTime = getRateLimitResetTime(email, 60 * 60 * 1000);
      return NextResponse.json(
        {
          error: `Too many password reset requests. Please try again in ${Math.ceil(
            resetTime / 60
          )} minutes.`,
        },
        { status: 429 }
      );
    }

    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email },
    });

    // SECURITY: Always return success, even if user doesn't exist
    // This prevents email enumeration attacks
    if (!user) {
      console.log(`Password reset requested for non-existent email: ${email}`);
      return NextResponse.json({
        success: true,
        message:
          "If an account with that email exists, a password reset link has been sent.",
      });
    }

    // Generate secure random token
    const resetToken = crypto.randomBytes(32).toString("hex");

    // Hash the token before storing (SHA-256)
    const hashedToken = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");

    // Set expiry to 15 minutes from now
    const resetTokenExpiry = new Date(Date.now() + 15 * 60 * 1000);

    // Update user with reset token (invalidates any previous tokens)
    await prisma.user.update({
      where: { email },
      data: {
        resetToken: hashedToken,
        resetTokenExpiry,
        lastResetRequestAt: new Date(),
      },
    });

    // Construct reset URL
    const resetUrl = `${
      process.env.NEXT_PUBLIC_APP_URL || process.env.NEXTAUTH_URL || "http://localhost:3000"
    }/reset-password?token=${resetToken}`;

    // Send password reset email
    try {
      await sendPasswordResetEmail({
        to: email,
        name: user.name || "User",
        resetUrl,
      });

      console.log(`Password reset email sent to: ${email}`);
    } catch (emailError: any) {
      console.error("Failed to send password reset email:", emailError);
      // Don't reveal email sending failures to the user
      // Still return success to prevent information disclosure
    }

    return NextResponse.json({
      success: true,
      message:
        "If an account with that email exists, a password reset link has been sent.",
    });
  } catch (error: any) {
    console.error("Error in forgot-password:", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Failed to process password reset request" },
      { status: 500 }
    );
  }
}
