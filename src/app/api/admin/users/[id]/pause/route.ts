import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/session";
import { prisma } from "@/lib/db";

/**
 * POST /api/admin/users/[id]/pause
 * Pauses a user's subscription (sets to view-only mode)
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
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Check if already paused
    if (user.subscriptionStatus === "paused") {
      return NextResponse.json(
        { error: "User subscription is already paused" },
        { status: 400 }
      );
    }

    // Update user subscription status to paused
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        subscriptionStatus: "paused",
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
        message: "User subscription paused successfully",
        user: updatedUser,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("[Admin Pause Subscription API] Error:", error);

    const errorMessage =
      error instanceof Error ? error.message : "Unknown error occurred";

    return NextResponse.json(
      {
        error: "Failed to pause user subscription",
        details: errorMessage,
      },
      { status: 500 }
    );
  }
}
