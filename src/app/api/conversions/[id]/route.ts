import { NextRequest, NextResponse } from "next/server";
import { del } from "@vercel/blob";
import { getCurrentUser } from "@/lib/session";
import { prisma } from "@/lib/db";

/**
 * GET /api/conversions/[id]
 * Retrieves a single conversion by ID
 * Verifies user ownership
 * Requires authentication
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Check authentication
    const user = await getCurrentUser();

    if (!user || !user.id) {
      return NextResponse.json(
        { error: "Unauthorized. Please log in to view conversions." },
        { status: 401 }
      );
    }

    // Get the conversion ID from params
    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        { error: "Conversion ID is required" },
        { status: 400 }
      );
    }

    // Find the conversion
    const conversion = await prisma.conversion.findUnique({
      where: { id },
      select: {
        id: true,
        userId: true,
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

    if (!conversion) {
      return NextResponse.json(
        { error: "Conversion not found" },
        { status: 404 }
      );
    }

    // Verify user owns this conversion
    if (conversion.userId !== user.id) {
      return NextResponse.json(
        { error: "Forbidden. You do not have access to this conversion." },
        { status: 403 }
      );
    }

    // Return conversion data (excluding userId for security)
    const { userId, ...conversionData } = conversion;

    return NextResponse.json(conversionData, { status: 200 });
  } catch (error) {
    console.error("[Conversion Detail API] Error:", error);

    const errorMessage =
      error instanceof Error ? error.message : "Unknown error occurred";

    return NextResponse.json(
      {
        error: "Failed to retrieve conversion",
        details: errorMessage,
      },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/conversions/[id]
 * Deletes a conversion and its associated files from blob storage
 * Verifies user ownership
 * Requires authentication
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Check authentication
    const user = await getCurrentUser();

    if (!user || !user.id) {
      return NextResponse.json(
        { error: "Unauthorized. Please log in to delete conversions." },
        { status: 401 }
      );
    }

    // Get the conversion ID from params
    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        { error: "Conversion ID is required" },
        { status: 400 }
      );
    }

    // Find the conversion
    const conversion = await prisma.conversion.findUnique({
      where: { id },
      select: {
        id: true,
        userId: true,
        originalImageUrl: true,
        svgUrl: true,
      },
    });

    if (!conversion) {
      return NextResponse.json(
        { error: "Conversion not found" },
        { status: 404 }
      );
    }

    // Verify user owns this conversion
    if (conversion.userId !== user.id) {
      return NextResponse.json(
        { error: "Forbidden. You do not have access to this conversion." },
        { status: 403 }
      );
    }

    // TODO: Make blob storage optional for local development
    // Currently blocks deletion if BLOB_READ_WRITE_TOKEN is not set in .env.local
    // Option 1: Set up Vercel Blob and add token to .env.local
    // Option 2: Skip blob deletion in dev mode and only delete DB records
    // Check if blob token is configured
    if (!process.env.BLOB_READ_WRITE_TOKEN) {
      console.error("BLOB_READ_WRITE_TOKEN environment variable is not set");
      return NextResponse.json(
        { error: "File storage is not configured. Please contact support." },
        { status: 500 }
      );
    }

    // Delete files from Vercel Blob storage
    const deletePromises: Promise<void>[] = [];

    // Delete original image if it exists
    if (conversion.originalImageUrl) {
      try {
        deletePromises.push(
          del(conversion.originalImageUrl, {
            token: process.env.BLOB_READ_WRITE_TOKEN,
          })
        );
      } catch (error) {
        console.warn(
          `[Conversion Delete API] Failed to delete original image: ${error}`
        );
        // Continue with deletion even if blob deletion fails
      }
    }

    // Delete SVG if it exists
    if (conversion.svgUrl) {
      try {
        deletePromises.push(
          del(conversion.svgUrl, {
            token: process.env.BLOB_READ_WRITE_TOKEN,
          })
        );
      } catch (error) {
        console.warn(`[Conversion Delete API] Failed to delete SVG: ${error}`);
        // Continue with deletion even if blob deletion fails
      }
    }

    // Wait for blob deletions to complete (best effort)
    await Promise.allSettled(deletePromises);

    // Delete conversion record from database
    await prisma.conversion.delete({
      where: { id },
    });

    console.log(
      `[Conversion Delete API] Successfully deleted conversion ${id} for user ${user.id}`
    );

    return NextResponse.json(
      { message: "Conversion deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("[Conversion Delete API] Error:", error);

    const errorMessage =
      error instanceof Error ? error.message : "Unknown error occurred";

    return NextResponse.json(
      {
        error: "Failed to delete conversion",
        details: errorMessage,
      },
      { status: 500 }
    );
  }
}
