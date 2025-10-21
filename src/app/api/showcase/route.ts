import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

/**
 * GET /api/showcase
 * Public endpoint to fetch showcase images for the landing page
 * No authentication required
 */
export async function GET(request: NextRequest) {
  try {
    const showcaseImages = await prisma.showcaseImage.findMany({
      orderBy: {
        displayOrder: "asc",
      },
      select: {
        id: true,
        rasterImageUrl: true,
        svgUrl: true,
        filename: true,
        displayOrder: true,
      },
    });

    return NextResponse.json(
      { showcaseImages },
      {
        status: 200,
        headers: {
          // Cache for 5 minutes
          "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600",
        },
      }
    );
  } catch (error) {
    console.error("[Showcase API] Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch showcase images" },
      { status: 500 }
    );
  }
}
