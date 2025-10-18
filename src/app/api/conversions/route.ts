import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/session";
import { prisma } from "@/lib/db";

/**
 * GET /api/conversions
 * Retrieves all conversions for the authenticated user
 * Supports pagination via query parameters: page, limit
 * Requires authentication
 */
export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const user = await getCurrentUser();

    if (!user || !user.id) {
      return NextResponse.json(
        { error: "Unauthorized. Please log in to view conversions." },
        { status: 401 }
      );
    }

    // Parse pagination parameters from query string
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "10", 10);

    // Validate pagination parameters
    if (page < 1 || limit < 1 || limit > 100) {
      return NextResponse.json(
        { error: "Invalid pagination parameters. Page must be >= 1 and limit between 1-100." },
        { status: 400 }
      );
    }

    // Calculate offset for pagination
    const offset = (page - 1) * limit;

    // Query conversions for the current user
    const [conversions, totalCount] = await Promise.all([
      prisma.conversion.findMany({
        where: {
          userId: user.id,
        },
        orderBy: {
          createdAt: "desc",
        },
        skip: offset,
        take: limit,
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
      }),
      prisma.conversion.count({
        where: {
          userId: user.id,
        },
      }),
    ]);

    // Calculate pagination metadata
    const totalPages = Math.ceil(totalCount / limit);
    const hasNextPage = page < totalPages;
    const hasPreviousPage = page > 1;

    // Return conversions with pagination metadata
    return NextResponse.json(
      {
        conversions,
        pagination: {
          page,
          limit,
          totalCount,
          totalPages,
          hasNextPage,
          hasPreviousPage,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("[Conversions API] Error:", error);

    const errorMessage =
      error instanceof Error ? error.message : "Unknown error occurred";

    return NextResponse.json(
      {
        error: "Failed to retrieve conversions",
        details: errorMessage,
      },
      { status: 500 }
    );
  }
}
