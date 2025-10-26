import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/session";
import { prisma } from "@/lib/db";

/**
 * POST /api/admin/users/[id]/resume
 * Resumes a paused user's subscription
 * Requires admin authentication
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Check authentication and admin status
    const currentUser = await getCurrentUser();

    if (!currentUser || !currentUser.id) {
      return NextResponse.json(
        { error: "Unauthorized. Please log in." },
        { status: 401 }
      );
    }

    // Verify admin status
    const adminCheck = await prisma.user.findUnique({
      where: { id: currentUser.id },
      select: { isAdmin: true },
    });

    if (!adminCheck?.isAdmin) {
      return NextResponse.json(
        { error: "Forbidden. Admin access required." },
        { status: 403 }
      );
    }

    const userId = params.id;

    // Verify user exists
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        subscriptionStatus: true,
        paypalSubscriptionId: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Check if not paused
    if (user.subscriptionStatus !== "paused") {
      return NextResponse.json(
        { error: "User subscription is not paused" },
        { status: 400 }
      );
    }

    // Determine the appropriate status to resume to
    // If user has an active PayPal subscription, set to 'active'
    // Otherwise, set to 'none' (for free users or manual upgrades)
    const newStatus = user.paypalSubscriptionId ? "active" : "none";

    // Update user subscription status
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        subscriptionStatus: newStatus,
      },
      select: {
        id: true,
        email: true,
        subscriptionStatus: true,
        subscriptionPlan: true,
      },
    });

    return NextResponse.json(
      {
        message: "User subscription resumed successfully",
        user: updatedUser,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("[Admin Resume Subscription API] Error:", error);

    const errorMessage =
      error instanceof Error ? error.message : "Unknown error occurred";

    return NextResponse.json(
      {
        error: "Failed to resume user subscription",
        details: errorMessage,
      },
      { status: 500 }
    );
  }
}
