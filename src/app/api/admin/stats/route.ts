import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/session";
import { prisma } from "@/lib/db";
import { AdminDashboardStats } from "@/types";

/**
 * GET /api/admin/stats
 * Retrieves dashboard statistics for the admin panel
 * Requires admin authentication
 */
export async function GET(request: NextRequest) {
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

    // Fetch all required stats in parallel
    const [
      totalUsers,
      totalConversions,
      freeUsers,
      paidUsers,
      activeSubscriptions,
      siteSettings,
    ] = await Promise.all([
      // Total number of users
      prisma.user.count(),

      // Total number of conversions across all users
      prisma.conversion.count(),

      // Number of free users
      prisma.user.count({
        where: {
          subscriptionType: "free",
        },
      }),

      // Number of paid users (non-free)
      prisma.user.count({
        where: {
          subscriptionType: {
            not: "free",
          },
        },
      }),

      // Number of active subscriptions
      prisma.user.count({
        where: {
          subscriptionStatus: "active",
          paypalSubscriptionId: {
            not: null,
          },
        },
      }),

      // Get site settings for pricing
      prisma.siteSettings.findFirst(),
    ]);

    // Calculate monthly revenue estimate
    // This is a rough estimate based on active subscriptions
    let monthlyRevenue = 0;

    if (siteSettings) {
      const [
        starterMonthlyCount,
        starterYearlyCount,
        proMonthlyCount,
        proYearlyCount,
      ] = await Promise.all([
        prisma.user.count({
          where: {
            subscriptionStatus: "active",
            subscriptionPlan: "starter_monthly",
          },
        }),
        prisma.user.count({
          where: {
            subscriptionStatus: "active",
            subscriptionPlan: "starter_yearly",
          },
        }),
        prisma.user.count({
          where: {
            subscriptionStatus: "active",
            subscriptionPlan: "pro_monthly",
          },
        }),
        prisma.user.count({
          where: {
            subscriptionStatus: "active",
            subscriptionPlan: "pro_yearly",
          },
        }),
      ]);

      monthlyRevenue =
        starterMonthlyCount * siteSettings.starterMonthlyPrice +
        starterYearlyCount * (siteSettings.starterYearlyPrice / 12) +
        proMonthlyCount * siteSettings.proMonthlyPrice +
        proYearlyCount * (siteSettings.proYearlyPrice / 12);
    }

    const stats: AdminDashboardStats = {
      totalUsers,
      activeSubscriptions,
      totalConversions,
      monthlyRevenue: Math.round(monthlyRevenue * 100) / 100, // Round to 2 decimal places
      freeUsers,
      paidUsers,
    };

    return NextResponse.json(stats, { status: 200 });
  } catch (error) {
    console.error("[Admin Stats API] Error:", error);

    const errorMessage =
      error instanceof Error ? error.message : "Unknown error occurred";

    return NextResponse.json(
      {
        error: "Failed to retrieve admin statistics",
        details: errorMessage,
      },
      { status: 500 }
    );
  }
}
