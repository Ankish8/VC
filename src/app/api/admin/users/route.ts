import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/session";
import { prisma } from "@/lib/db";
import { AdminUser, PaginatedUsersResponse } from "@/types";

/**
 * GET /api/admin/users
 * Retrieves all users with pagination, search, and filtering
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

    // Parse query parameters
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = Math.min(
      parseInt(searchParams.get("limit") || "20", 10),
      50
    ); // Max 50 per page
    const search = searchParams.get("search") || "";
    const planType = searchParams.get("planType") || "";
    const status = searchParams.get("status") || "";
    const sortBy = (searchParams.get("sortBy") || "createdAt") as
      | "conversions"
      | "createdAt"
      | "email";
    const sortOrder = (searchParams.get("sortOrder") || "desc") as
      | "asc"
      | "desc";

    // Validate pagination
    if (page < 1 || limit < 1) {
      return NextResponse.json(
        { error: "Invalid pagination parameters" },
        { status: 400 }
      );
    }

    const offset = (page - 1) * limit;

    // Build where clause for filtering
    const whereClause: any = {};

    // Search by email
    if (search) {
      whereClause.email = {
        contains: search,
        mode: "insensitive",
      };
    }

    // Filter by plan type
    if (planType && planType !== "all") {
      if (planType === "free") {
        whereClause.subscriptionType = "free";
      } else {
        whereClause.subscriptionPlan = planType;
      }
    }

    // Filter by status
    if (status && status !== "all") {
      if (status === "paused") {
        whereClause.subscriptionStatus = "paused";
      } else if (status === "active") {
        whereClause.subscriptionStatus = "active";
      }
    }

    // Fetch users with conversion counts
    const [users, totalCount] = await Promise.all([
      prisma.user.findMany({
        where: whereClause,
        select: {
          id: true,
          email: true,
          name: true,
          createdAt: true,
          subscriptionType: true,
          subscriptionStatus: true,
          subscriptionPlan: true,
          paypalSubscriptionId: true,
          creditsRemaining: true,
          creditsTotal: true,
          _count: {
            select: {
              conversions: true,
            },
          },
          conversions: {
            select: {
              createdAt: true,
            },
            orderBy: {
              createdAt: "desc",
            },
            take: 1,
          },
        },
        skip: offset,
        take: limit,
        orderBy:
          sortBy === "conversions"
            ? undefined // We'll sort in memory for conversion count
            : sortBy === "email"
            ? { email: sortOrder }
            : { createdAt: sortOrder },
      }),
      prisma.user.count({
        where: whereClause,
      }),
    ]);

    // Transform users data to AdminUser format
    let adminUsers: AdminUser[] = users.map((user) => ({
      id: user.id,
      email: user.email,
      name: user.name,
      createdAt: user.createdAt,
      subscriptionType: user.subscriptionType,
      subscriptionStatus: user.subscriptionStatus,
      subscriptionPlan: user.subscriptionPlan,
      paypalSubscriptionId: user.paypalSubscriptionId,
      creditsRemaining: user.creditsRemaining,
      creditsTotal: user.creditsTotal,
      totalConversions: user._count.conversions,
      lastActivityAt: user.conversions[0]?.createdAt || null,
      isPaused: user.subscriptionStatus === "paused",
    }));

    // Sort by conversions if requested
    if (sortBy === "conversions") {
      adminUsers.sort((a, b) => {
        return sortOrder === "asc"
          ? a.totalConversions - b.totalConversions
          : b.totalConversions - a.totalConversions;
      });
    }

    // Calculate pagination metadata
    const totalPages = Math.ceil(totalCount / limit);
    const hasNextPage = page < totalPages;
    const hasPreviousPage = page > 1;

    const response: PaginatedUsersResponse = {
      users: adminUsers,
      pagination: {
        page,
        limit,
        totalCount,
        totalPages,
        hasNextPage,
        hasPreviousPage,
      },
    };

    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    console.error("[Admin Users API] Error:", error);

    const errorMessage =
      error instanceof Error ? error.message : "Unknown error occurred";

    return NextResponse.json(
      {
        error: "Failed to retrieve users",
        details: errorMessage,
      },
      { status: 500 }
    );
  }
}
