import { NextRequest, NextResponse } from "next/server";
import { put } from "@vercel/blob";
import { getCurrentUser } from "@/lib/session";
import { prisma } from "@/lib/db";
import { convertImageToSVG } from "@/lib/fal-client";
import { ConversionStatus } from "@/types";
import { writeFile } from "fs/promises";
import path from "path";
import { deductCredit, getUserCreditStatus } from "@/lib/credits";

interface ConvertRequest {
  imageUrl: string;
  filename: string;
  dimensions: {
    width: number;
    height: number;
  };
  fileSize: number;
}

/**
 * POST /api/convert
 * Converts a raster image to SVG using Fal.ai
 * Requires authentication
 */
export async function POST(request: NextRequest) {
  let conversionId: string | null = null;

  try {
    // Check authentication
    const user = await getCurrentUser();

    if (!user || !user.id) {
      return NextResponse.json(
        { error: "Unauthorized. Please log in to convert images." },
        { status: 401 }
      );
    }

    // Parse request body
    const body: ConvertRequest = await request.json();

    // Validate request data
    if (!body.imageUrl || !body.filename || !body.dimensions || !body.fileSize) {
      return NextResponse.json(
        { error: "Missing required fields: imageUrl, filename, dimensions, or fileSize" },
        { status: 400 }
      );
    }

    // Check user's credit status before processing
    const creditStatus = await getUserCreditStatus(user.id);

    // Allow if unlimited (lifetime plan)
    if (!creditStatus.isUnlimited) {
      // Check if user has credits
      if (creditStatus.remaining <= 0) {
        const resetDateStr = creditStatus.resetDate
          ? new Date(creditStatus.resetDate).toLocaleDateString()
          : "N/A";

        return NextResponse.json(
          {
            error: "Insufficient credits",
            message: `You have used all your credits for this billing cycle. Your credits will reset on ${resetDateStr}. Upgrade your plan for more conversions.`,
            creditsRemaining: 0,
            resetDate: creditStatus.resetDate,
          },
          { status: 403 }
        );
      }

      // Soft warning if running low (10% or less remaining)
      if (creditStatus.percentage <= 10 && creditStatus.percentage > 0) {
        console.log(
          `[Convert API] User ${user.id} has ${creditStatus.remaining} credits remaining (${creditStatus.percentage.toFixed(0)}%)`
        );
      }

      // Attempt to deduct credit
      const deducted = await deductCredit(user.id);

      if (!deducted) {
        return NextResponse.json(
          {
            error: "Failed to deduct credit",
            message: "Unable to process conversion. Please try again or contact support.",
          },
          { status: 500 }
        );
      }

      console.log(
        `[Convert API] Deducted 1 credit from user ${user.id}. Remaining: ${creditStatus.remaining - 1}`
      );
    }

    // Check environment variables
    if (!process.env.FAL_API_KEY) {
      console.error("FAL_API_KEY environment variable is not set");
      return NextResponse.json(
        { error: "Conversion service is not configured. Please contact support." },
        { status: 500 }
      );
    }

    // Create conversion record in database with "processing" status
    const conversion = await prisma.conversion.create({
      data: {
        userId: user.id,
        originalImageUrl: body.imageUrl,
        svgUrl: "", // Will be updated after conversion
        originalFilename: body.filename,
        svgFilename: "", // Will be generated from original filename
        originalFileSize: body.fileSize,
        svgFileSize: 0, // Will be updated after conversion
        originalDimensions: `${body.dimensions.width}x${body.dimensions.height}`,
        status: "processing" as ConversionStatus,
      },
    });

    conversionId = conversion.id;

    console.log(
      `[Convert API] Starting conversion for user ${user.id}, conversion ID: ${conversionId}`
    );

    // Prepare image URL for Fal.ai
    let imageUrlForFal = body.imageUrl;

    // If using local storage (URL starts with /), convert to base64
    if (body.imageUrl.startsWith('/')) {
      console.log('[Convert API] Converting local file to base64 for Fal.ai');
      const fs = await import('fs/promises');
      const localPath = path.join(process.cwd(), 'public', body.imageUrl);
      const imageBuffer = await fs.readFile(localPath);
      const base64Image = imageBuffer.toString('base64');
      const mimeType = body.imageUrl.endsWith('.png') ? 'image/png' :
                       body.imageUrl.endsWith('.jpg') || body.imageUrl.endsWith('.jpeg') ? 'image/jpeg' :
                       'image/webp';
      imageUrlForFal = `data:${mimeType};base64,${base64Image}`;
    }

    // Call Fal.ai API to convert image to SVG
    const falResponse = await convertImageToSVG(imageUrlForFal);

    // Download SVG from Fal.ai and upload to Vercel Blob
    const svgResponse = await fetch(falResponse.image.url);

    if (!svgResponse.ok) {
      throw new Error(`Failed to download SVG from Fal.ai: ${svgResponse.statusText}`);
    }

    const svgBuffer = await svgResponse.arrayBuffer();
    const svgBufferNode = Buffer.from(svgBuffer);

    // Generate SVG filename
    const originalNameWithoutExt = body.filename.replace(/\.[^/.]+$/, "");
    const svgFilename = `${originalNameWithoutExt}.svg`;
    const timestamp = Date.now();
    const blobPath = `conversions/${user.id}/${timestamp}-${svgFilename}`;

    // Upload SVG to storage (Vercel Blob or local filesystem)
    let svgUrl: string;

    if (process.env.BLOB_READ_WRITE_TOKEN) {
      // Use Vercel Blob for production
      const svgBlob = await put(blobPath, svgBufferNode, {
        access: "public",
        contentType: "image/svg+xml",
        token: process.env.BLOB_READ_WRITE_TOKEN,
      });
      svgUrl = svgBlob.url;
    } else {
      // Use local file storage for development
      const conversionsDir = path.join(process.cwd(), "public", "uploads", user.id, "conversions");
      const localFilename = `${timestamp}-${svgFilename}`;
      const filePath = path.join(conversionsDir, localFilename);

      // Create directory if it doesn't exist
      const fs = await import("fs/promises");
      await fs.mkdir(conversionsDir, { recursive: true });

      // Write file to local storage
      await writeFile(filePath, svgBufferNode);

      // Generate public URL for local file
      svgUrl = `/uploads/${user.id}/conversions/${localFilename}`;
    }

    // Update conversion record with completed status
    const updatedConversion = await prisma.conversion.update({
      where: { id: conversionId },
      data: {
        svgUrl: svgUrl,
        svgFilename: svgFilename,
        svgFileSize: svgBufferNode.length,
        status: "completed" as ConversionStatus,
      },
    });

    console.log(
      `[Convert API] Conversion completed successfully for ID: ${conversionId}`
    );

    // Return conversion result
    return NextResponse.json(
      {
        id: updatedConversion.id,
        originalImageUrl: updatedConversion.originalImageUrl,
        svgUrl: updatedConversion.svgUrl,
        originalFilename: updatedConversion.originalFilename,
        svgFilename: updatedConversion.svgFilename,
        originalFileSize: updatedConversion.originalFileSize,
        svgFileSize: updatedConversion.svgFileSize,
        originalDimensions: updatedConversion.originalDimensions,
        status: updatedConversion.status,
        createdAt: updatedConversion.createdAt,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("[Convert API] Error:", error);

    const errorMessage =
      error instanceof Error ? error.message : "Unknown error occurred";

    // Update conversion record with failed status if it was created
    if (conversionId) {
      try {
        await prisma.conversion.update({
          where: { id: conversionId },
          data: {
            status: "failed" as ConversionStatus,
            errorMessage: errorMessage,
          },
        });

        console.log(
          `[Convert API] Updated conversion ${conversionId} status to failed`
        );
      } catch (dbError) {
        console.error(
          "[Convert API] Failed to update conversion status:",
          dbError
        );
      }
    }

    return NextResponse.json(
      {
        error: "Failed to convert image",
        details: errorMessage,
      },
      { status: 500 }
    );
  }
}
