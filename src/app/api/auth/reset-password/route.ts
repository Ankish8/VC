import { prisma } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";
import crypto from "crypto";
import { sendPasswordChangedEmail } from "@/lib/email";

const resetPasswordSchema = z.object({
  token: z.string().min(1, "Reset token is required"),
  newPassword: z.string().min(8, "Password must be at least 8 characters long"),
});

/**
 * POST /api/auth/reset-password
 * Reset password using a valid reset token
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { token, newPassword } = resetPasswordSchema.parse(body);

    // Hash the incoming token to match stored hash
    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

    // Find user with matching token and check expiry
    const user = await prisma.user.findFirst({
      where: {
        resetToken: hashedToken,
        resetTokenExpiry: {
          gt: new Date(), // Token must not be expired
        },
      },
    });

    if (!user) {
      return NextResponse.json(
        {
          error:
            "Invalid or expired reset token. Please request a new password reset.",
        },
        { status: 400 }
      );
    }

    // Hash the new password
    const hashedPassword = await bcrypt.hash(newPassword, 12);

    // Update user password and clear reset token fields
    await prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        resetToken: null,
        resetTokenExpiry: null,
        mustChangePassword: false, // Clear this flag if it was set
      },
    });

    console.log(`Password reset successful for user: ${user.email}`);

    // Send confirmation email
    try {
      await sendPasswordChangedEmail({
        to: user.email,
        name: user.name || "User",
      });
      console.log(`Password change confirmation email sent to: ${user.email}`);
    } catch (emailError: any) {
      console.error("Failed to send password change confirmation:", emailError);
      // Don't fail the request if email fails - password was still changed
    }

    return NextResponse.json({
      success: true,
      message: "Password has been reset successfully. You can now sign in.",
    });
  } catch (error: any) {
    console.error("Error in reset-password:", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Failed to reset password" },
      { status: 500 }
    );
  }
}
