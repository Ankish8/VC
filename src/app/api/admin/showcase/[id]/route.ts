import { NextRequest, NextResponse } from "next/server";
import { checkAdminAccess } from "@/lib/admin-guard";
import { prisma } from "@/lib/db";

/**
 * DELETE /api/admin/showcase/[id]
 * Delete a showcase image
 * Requires admin authentication
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  // Check admin access
  const accessError = await checkAdminAccess();
  if (accessError) return accessError;

  try {
    const { id } = params;

    // Check if showcase image exists
    const showcaseImage = await prisma.showcaseImage.findUnique({
      where: { id },
    });

    if (!showcaseImage) {
      return NextResponse.json(
        { error: "Showcase image not found" },
        { status: 404 }
      );
    }

    // Delete from database
    await prisma.showcaseImage.delete({
      where: { id },
    });

    console.log(`[Admin Showcase DELETE] Deleted showcase image: ${id}`);

    // Note: We're not deleting the actual files from storage
    // to avoid broken links if the same file is referenced elsewhere.
    // You can implement file deletion from Vercel Blob if needed.

    return NextResponse.json(
      { message: "Showcase image deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("[Admin Showcase DELETE] Error:", error);
    return NextResponse.json(
      { error: "Failed to delete showcase image" },
      { status: 500 }
    );
  }
}
