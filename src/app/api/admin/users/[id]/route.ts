import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/session";
import { prisma } from "@/lib/db";
import { UserDetailStats } from "@/types";

/**
 * GET /api/admin/users/[id]
 * Retrieves detailed information and statistics for a specific user
 * Requires admin authentication
 */
export async function GET(
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

    // Fetch user with all details
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        conversions: {
          select: {
            id: true,
            createdAt: true,
            status: true,
          },
          orderBy: {
            createdAt: "desc",
          },
        },
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Calculate total conversions
    const totalConversions = user.conversions.length;

    // Calculate this month's conversions
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const thisMonthConversions = user.conversions.filter(
      (c) => new Date(c.createdAt) >= startOfMonth
    ).length;

    // Calculate daily usage for last 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const dailyUsageMap = new Map<string, number>();
    for (let i = 0; i < 30; i++) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split("T")[0];
      dailyUsageMap.set(dateStr, 0);
    }

    user.conversions
      .filter((c) => new Date(c.createdAt) >= thirtyDaysAgo)
      .forEach((c) => {
        const dateStr = new Date(c.createdAt).toISOString().split("T")[0];
        if (dailyUsageMap.has(dateStr)) {
          dailyUsageMap.set(dateStr, (dailyUsageMap.get(dateStr) || 0) + 1);
        }
      });

    const dailyUsage = Array.from(dailyUsageMap.entries())
      .map(([date, count]) => ({ date, count }))
      .sort((a, b) => a.date.localeCompare(b.date));

    // Calculate monthly trends for last 12 months
    const monthlyTrendsMap = new Map<string, number>();
    for (let i = 0; i < 12; i++) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      const monthStr = `${date.getFullYear()}-${String(
        date.getMonth() + 1
      ).padStart(2, "0")}`;
      monthlyTrendsMap.set(monthStr, 0);
    }

    user.conversions.forEach((c) => {
      const date = new Date(c.createdAt);
      const monthStr = `${date.getFullYear()}-${String(
        date.getMonth() + 1
      ).padStart(2, "0")}`;
      if (monthlyTrendsMap.has(monthStr)) {
        monthlyTrendsMap.set(
          monthStr,
          (monthlyTrendsMap.get(monthStr) || 0) + 1
        );
      }
    });

    const monthlyTrends = Array.from(monthlyTrendsMap.entries())
      .map(([month, count]) => ({ month, count }))
      .sort((a, b) => a.month.localeCompare(b.month));

    // Prepare response
    const userDetail = {
      // User basic info
      id: user.id,
      email: user.email,
      name: user.name,
      createdAt: user.createdAt,

      // Subscription info
      subscriptionType: user.subscriptionType,
      subscriptionStatus: user.subscriptionStatus,
      subscriptionPlan: user.subscriptionPlan,
      subscriptionStartedAt: user.subscriptionStartedAt,
      subscriptionEndsAt: user.subscriptionEndsAt,
      paypalSubscriptionId: user.paypalSubscriptionId,

      // Credits
      creditsRemaining: user.creditsRemaining,
      creditsTotal: user.creditsTotal,
      creditsResetDate: user.creditsResetDate,

      // Stats
      stats: {
        totalConversions,
        thisMonthConversions,
        creditsRemaining: user.creditsRemaining,
        creditsTotal: user.creditsTotal,
        subscriptionStatus: user.subscriptionStatus,
        subscriptionPlan: user.subscriptionPlan,
        dailyUsage,
        monthlyTrends,
      } as UserDetailStats,
    };

    return NextResponse.json(userDetail, { status: 200 });
  } catch (error) {
    console.error("[Admin User Detail API] Error:", error);

    const errorMessage =
      error instanceof Error ? error.message : "Unknown error occurred";

    return NextResponse.json(
      {
        error: "Failed to retrieve user details",
        details: errorMessage,
      },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/admin/users/[id]
 * Permanently deletes a user and all their data (hard delete)
 * Requires admin authentication
 */
export async function DELETE(
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

    // Prevent admin from deleting themselves
    if (userId === currentUser.id) {
      return NextResponse.json(
        { error: "Cannot delete your own admin account" },
        { status: 400 }
      );
    }

    // Verify user exists
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        _count: {
          select: {
            conversions: true,
          },
        },
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Delete user (conversions will be cascade deleted due to Prisma schema)
    await prisma.user.delete({
      where: { id: userId },
    });

    return NextResponse.json(
      {
        message: "User and all associated data deleted successfully",
        deletedUser: {
          id: user.id,
          email: user.email,
          conversionsDeleted: user._count.conversions,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("[Admin Delete User API] Error:", error);

    const errorMessage =
      error instanceof Error ? error.message : "Unknown error occurred";

    return NextResponse.json(
      {
        error: "Failed to delete user",
        details: errorMessage,
      },
      { status: 500 }
    );
  }
}
