import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/session";
import { prisma } from "@/lib/db";
import { Conversion } from "@/types";

/**
 * GET /api/admin/users/[id]/conversions
 * Retrieves all conversions for a specific user with date filtering
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

    // Verify user exists
    const userExists = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true },
    });

    if (!userExists) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Parse query parameters for date filtering
    const { searchParams } = new URL(request.url);
    const filterType = searchParams.get("filter") || "all"; // all, today, yesterday, last7days, last30days

    // Calculate date range based on filter
    let startDate: Date | undefined;
    const now = new Date();

    switch (filterType) {
      case "today":
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        break;
      case "yesterday":
        startDate = new Date(
          now.getFullYear(),
          now.getMonth(),
          now.getDate() - 1
        );
        const endOfYesterday = new Date(
          now.getFullYear(),
          now.getMonth(),
          now.getDate()
        );
        // For yesterday, we need both start and end
        const conversions = await prisma.conversion.findMany({
          where: {
            userId,
            createdAt: {
              gte: startDate,
              lt: endOfYesterday,
            },
          },
          orderBy: {
            createdAt: "desc",
          },
        });
        return NextResponse.json({ conversions }, { status: 200 });
      case "last7days":
        startDate = new Date();
        startDate.setDate(startDate.getDate() - 7);
        break;
      case "last30days":
        startDate = new Date();
        startDate.setDate(startDate.getDate() - 30);
        break;
      case "all":
      default:
        startDate = undefined;
        break;
    }

    // Fetch conversions with optional date filter
    const whereClause: any = {
      userId,
    };

    if (startDate) {
      whereClause.createdAt = {
        gte: startDate,
      };
    }

    const conversions = await prisma.conversion.findMany({
      where: whereClause,
      orderBy: {
        createdAt: "desc",
      },
      select: {
        id: true,
        originalImageUrl: true,
        svgUrl: true,
        originalFilename: true,
        svgFilename: true,
        originalFileSize: true,
        svgFileSize: true,
        originalDimensions: true,
        status: true,
        errorMessage: true,
        createdAt: true,
      },
    });

    return NextResponse.json(
      {
        conversions,
        filter: filterType,
        count: conversions.length,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("[Admin User Conversions API] Error:", error);

    const errorMessage =
      error instanceof Error ? error.message : "Unknown error occurred";

    return NextResponse.json(
      {
        error: "Failed to retrieve user conversions",
        details: errorMessage,
      },
      { status: 500 }
    );
  }
}
