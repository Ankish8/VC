import { prisma } from "@/lib/db";
import { sendWelcomeEmail } from "@/lib/email";
import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import crypto from "crypto";

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
 * POST /api/auth/change-email-after-payment
 * Changes user email and resends credentials after payment
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { newEmail, transactionId } = body;

    // Validate inputs
    if (!newEmail || !transactionId) {
      return NextResponse.json(
        { error: "Email and transaction ID are required" },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(newEmail)) {
      return NextResponse.json(
        { error: "Invalid email format" },
        { status: 400 }
      );
    }

    // Find user by transaction ID (works for both one-time payments and subscriptions)
    const user = await prisma.user.findFirst({
      where: {
        OR: [
          { paypalTransactionId: transactionId },
          { paypalSubscriptionId: transactionId },
        ],
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: "Payment not found. Please contact support." },
        { status: 404 }
      );
    }

    // Check if new email is already in use by another user
    const existingUser = await prisma.user.findUnique({
      where: { email: newEmail },
    });

    if (existingUser && existingUser.id !== user.id) {
      return NextResponse.json(
        { error: "This email is already registered. Please use a different email or login with existing credentials." },
        { status: 409 }
      );
    }

    // Generate new temporary password for security
    const tempPassword = generateSecurePassword(16);
    const hashedPassword = await bcrypt.hash(tempPassword, 12);

    // Update user email and password
    await prisma.user.update({
      where: { id: user.id },
      data: {
        email: newEmail,
        password: hashedPassword,
        mustChangePassword: true,
      },
    });

    // Send welcome email to new address
    try {
      await sendWelcomeEmail({
        to: newEmail,
        name: user.name || "User",
        tempPassword,
      });

      console.log("Welcome email resent to new address:", newEmail);

      return NextResponse.json({
        success: true,
        message: "Email updated and credentials sent successfully",
        newEmail,
      });
    } catch (emailError: any) {
      console.error("Failed to send email:", emailError);

      // Rollback the email change if email fails
      await prisma.user.update({
        where: { id: user.id },
        data: {
          email: user.email, // Restore original email
        },
      });

      return NextResponse.json(
        { error: "Failed to send email. Please try again or contact support." },
        { status: 500 }
      );
    }
  } catch (error: any) {
    console.error("Error changing email:", error);
    return NextResponse.json(
      { error: error.message || "Failed to change email" },
      { status: 500 }
    );
  }
}
