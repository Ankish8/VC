import { NextRequest, NextResponse } from "next/server";
import { put } from "@vercel/blob";
import { getCurrentUser } from "@/lib/session";
import { validateImage, getImageDimensions } from "@/lib/validation";
import { writeFile } from "fs/promises";
import path from "path";

/**
 * POST /api/upload
 * Handles file upload to Vercel Blob storage
 * Requires authentication
 */
export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized. Please log in to upload files." },
        { status: 401 }
      );
    }

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

    // Convert file to buffer for upload
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Generate a unique filename
    const timestamp = Date.now();
    const sanitizedFilename = file.name.replace(/[^a-zA-Z0-9.-]/g, "-");
    const filename = `uploads/${user.id}/${timestamp}-${sanitizedFilename}`;

    // Upload to storage (Vercel Blob or local filesystem)
    let uploadUrl: string;

    if (process.env.BLOB_READ_WRITE_TOKEN) {
      // Use Vercel Blob for production
      const blob = await put(filename, buffer, {
        access: "public",
        contentType: file.type,
        token: process.env.BLOB_READ_WRITE_TOKEN,
      });
      uploadUrl = blob.url;
    } else {
      // Use local file storage for development
      const uploadsDir = path.join(process.cwd(), "public", "uploads", user.id);
      const localFilename = `${timestamp}-${sanitizedFilename}`;
      const filePath = path.join(uploadsDir, localFilename);

      // Create directory if it doesn't exist
      const fs = await import("fs/promises");
      await fs.mkdir(uploadsDir, { recursive: true });

      // Write file to local storage
      await writeFile(filePath, buffer);

      // Generate public URL for local file
      uploadUrl = `/uploads/${user.id}/${localFilename}`;
    }

    // Return upload result
    return NextResponse.json(
      {
        url: uploadUrl,
        filename: file.name,
        size: file.size,
        dimensions: {
          width: validation.dimensions.width,
          height: validation.dimensions.height,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("[Upload API] Error:", error);

    const errorMessage =
      error instanceof Error ? error.message : "Unknown error occurred";

    return NextResponse.json(
      {
        error: "Failed to upload file",
        details: errorMessage,
      },
      { status: 500 }
    );
  }
}
