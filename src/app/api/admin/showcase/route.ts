import { NextRequest, NextResponse } from "next/server";
import { put } from "@vercel/blob";
import { checkAdminAccess } from "@/lib/admin-guard";
import { prisma } from "@/lib/db";
import { validateImage } from "@/lib/validation";
import { convertImageToSVG } from "@/lib/fal-client";
import { writeFile } from "fs/promises";
import path from "path";

/**
 * GET /api/admin/showcase
 * Fetch all showcase images for admin management
 * Requires admin authentication
 */
export async function GET(request: NextRequest) {
  // Check admin access
  const accessError = await checkAdminAccess();
  if (accessError) return accessError;

  try {
    const showcaseImages = await prisma.showcaseImage.findMany({
      orderBy: {
        displayOrder: "asc",
      },
    });

    return NextResponse.json({ showcaseImages }, { status: 200 });
  } catch (error) {
    console.error("[Admin Showcase GET] Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch showcase images" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/admin/showcase
 * Upload and convert a new showcase image
 * Requires admin authentication
 */
export async function POST(request: NextRequest) {
  // Check admin access
  const accessError = await checkAdminAccess();
  if (accessError) return accessError;

  try {
    // Parse multipart form data
    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json(
        { error: "No file provided. Please select a file to upload." },
        { status: 400 }
      );
    }

    // Validate the image
    const validation = await validateImage(file);

    if (!validation.isValid) {
      return NextResponse.json(
        { error: validation.error || "Invalid image file" },
        { status: 400 }
      );
    }

    if (!validation.dimensions) {
      return NextResponse.json(
        { error: "Failed to read image dimensions" },
        { status: 400 }
      );
    }

    // Check FAL_API_KEY
    if (!process.env.FAL_API_KEY) {
      console.error("FAL_API_KEY environment variable is not set");
      return NextResponse.json(
        { error: "Conversion service is not configured. Please contact support." },
        { status: 500 }
      );
    }

    // Convert file to buffer for upload
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Generate a unique filename
    const timestamp = Date.now();
    const sanitizedFilename = file.name.replace(/[^a-zA-Z0-9.-]/g, "-");
    const filename = `showcase/${timestamp}-${sanitizedFilename}`;

    // Upload raster image to storage
    let rasterImageUrl: string;

    if (process.env.BLOB_READ_WRITE_TOKEN) {
      // Use Vercel Blob for production
      const blob = await put(filename, buffer, {
        access: "public",
        contentType: file.type,
        token: process.env.BLOB_READ_WRITE_TOKEN,
      });
      rasterImageUrl = blob.url;
    } else {
      // Use local file storage for development
      const showcaseDir = path.join(process.cwd(), "public", "showcase");
      const localFilename = `${timestamp}-${sanitizedFilename}`;
      const filePath = path.join(showcaseDir, localFilename);

      // Create directory if it doesn't exist
      const fs = await import("fs/promises");
      await fs.mkdir(showcaseDir, { recursive: true });

      // Write file to local storage
      await writeFile(filePath, buffer);

      // Generate public URL for local file
      rasterImageUrl = `/showcase/${localFilename}`;
    }

    console.log(`[Admin Showcase] Raster image uploaded: ${rasterImageUrl}`);

    // Prepare image URL for Fal.ai conversion
    let imageUrlForFal = rasterImageUrl;

    // If using local storage (URL starts with /), convert to base64
    if (rasterImageUrl.startsWith('/')) {
      console.log('[Admin Showcase] Converting local file to base64 for Fal.ai');
      const fs = await import('fs/promises');
      const localPath = path.join(process.cwd(), 'public', rasterImageUrl);
      const imageBuffer = await fs.readFile(localPath);
      const base64Image = imageBuffer.toString('base64');
      const mimeType = rasterImageUrl.endsWith('.png') ? 'image/png' :
                       rasterImageUrl.endsWith('.jpg') || rasterImageUrl.endsWith('.jpeg') ? 'image/jpeg' :
                       'image/webp';
      imageUrlForFal = `data:${mimeType};base64,${base64Image}`;
    }

    // Call Fal.ai API to convert image to SVG
    console.log(`[Admin Showcase] Starting SVG conversion...`);
    const falResponse = await convertImageToSVG(imageUrlForFal);

    // Download SVG from Fal.ai
    const svgResponse = await fetch(falResponse.image.url);

    if (!svgResponse.ok) {
      throw new Error(`Failed to download SVG from Fal.ai: ${svgResponse.statusText}`);
    }

    const svgBuffer = await svgResponse.arrayBuffer();
    const svgBufferNode = Buffer.from(svgBuffer);

    // Generate SVG filename
    const originalNameWithoutExt = file.name.replace(/\.[^/.]+$/, "");
    const svgFilename = `${originalNameWithoutExt}.svg`;
    const svgBlobPath = `showcase/${timestamp}-${svgFilename}`;

    // Upload SVG to storage
    let svgUrl: string;

    if (process.env.BLOB_READ_WRITE_TOKEN) {
      // Use Vercel Blob for production
      const svgBlob = await put(svgBlobPath, svgBufferNode, {
        access: "public",
        contentType: "image/svg+xml",
        token: process.env.BLOB_READ_WRITE_TOKEN,
      });
      svgUrl = svgBlob.url;
    } else {
      // Use local file storage for development
      const showcaseDir = path.join(process.cwd(), "public", "showcase");
      const localSvgFilename = `${timestamp}-${svgFilename}`;
      const svgFilePath = path.join(showcaseDir, localSvgFilename);

      const fs = await import("fs/promises");
      await fs.mkdir(showcaseDir, { recursive: true });
      await writeFile(svgFilePath, svgBufferNode);

      svgUrl = `/showcase/${localSvgFilename}`;
    }

    console.log(`[Admin Showcase] SVG uploaded: ${svgUrl}`);

    // Get the next display order
    const maxOrderResult = await prisma.showcaseImage.findFirst({
      orderBy: {
        displayOrder: "desc",
      },
      select: {
        displayOrder: true,
      },
    });

    const nextDisplayOrder = (maxOrderResult?.displayOrder ?? -1) + 1;

    // Create showcase image record
    const showcaseImage = await prisma.showcaseImage.create({
      data: {
        rasterImageUrl,
        svgUrl,
        filename: file.name,
        displayOrder: nextDisplayOrder,
      },
    });

    console.log(`[Admin Showcase] Showcase image created with ID: ${showcaseImage.id}`);

    return NextResponse.json(
      {
        message: "Showcase image uploaded and converted successfully",
        showcaseImage,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("[Admin Showcase POST] Error:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
    return NextResponse.json(
      { error: `Failed to upload and convert showcase image: ${errorMessage}` },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/admin/showcase
 * Reorder showcase images
 * Requires admin authentication
 */
export async function PATCH(request: NextRequest) {
  // Check admin access
  const accessError = await checkAdminAccess();
  if (accessError) return accessError;

  try {
    const body = await request.json();
    const { updates } = body as { updates: Array<{ id: string; displayOrder: number }> };

    if (!updates || !Array.isArray(updates)) {
      return NextResponse.json(
        { error: "Invalid request body. Expected 'updates' array." },
        { status: 400 }
      );
    }

    // Update each showcase image's display order
    await Promise.all(
      updates.map((update) =>
        prisma.showcaseImage.update({
          where: { id: update.id },
          data: { displayOrder: update.displayOrder },
        })
      )
    );

    return NextResponse.json(
      { message: "Showcase images reordered successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("[Admin Showcase PATCH] Error:", error);
    return NextResponse.json(
      { error: "Failed to reorder showcase images" },
      { status: 500 }
    );
  }
}
