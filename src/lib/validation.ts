import sharp from "sharp";
import { IMAGE_CONSTRAINTS, ImageDimensions } from "@/types";

/**
 * Validates if the file format is supported
 * @param mimeType - The MIME type of the file
 * @returns True if format is allowed, false otherwise
 */
export function validateImageFormat(mimeType: string): boolean {
  return IMAGE_CONSTRAINTS.ALLOWED_FORMATS.includes(mimeType as any);
}

/**
 * Validates if the file size is within limits
 * @param size - The file size in bytes
 * @returns True if size is within limit, false otherwise
 */
export function validateImageSize(size: number): boolean {
  return size > 0 && size <= IMAGE_CONSTRAINTS.MAX_SIZE;
}

/**
 * Gets image dimensions using sharp
 * @param buffer - The image buffer
 * @returns Promise resolving to image dimensions
 */
export async function getImageDimensions(
  buffer: Buffer
): Promise<ImageDimensions> {
  try {
    const metadata = await sharp(buffer).metadata();

    if (!metadata.width || !metadata.height) {
      throw new Error("Could not read image dimensions");
    }

    return {
      width: metadata.width,
      height: metadata.height,
    };
  } catch (error) {
    throw new Error(
      `Failed to read image metadata: ${error instanceof Error ? error.message : "Unknown error"}`
    );
  }
}

/**
 * Validates if the image dimensions are within acceptable limits
 * @param dimensions - The image dimensions
 * @returns Object with isValid boolean and optional error message
 */
export function validateImageDimensions(dimensions: ImageDimensions): {
  isValid: boolean;
  error?: string;
} {
  const { width, height } = dimensions;

  // Check minimum dimensions
  if (width < IMAGE_CONSTRAINTS.MIN_DIMENSION || height < IMAGE_CONSTRAINTS.MIN_DIMENSION) {
    return {
      isValid: false,
      error: `Image dimensions must be at least ${IMAGE_CONSTRAINTS.MIN_DIMENSION}x${IMAGE_CONSTRAINTS.MIN_DIMENSION} pixels`,
    };
  }

  // Check maximum dimension
  if (width > IMAGE_CONSTRAINTS.MAX_DIMENSION || height > IMAGE_CONSTRAINTS.MAX_DIMENSION) {
    return {
      isValid: false,
      error: `Image dimensions cannot exceed ${IMAGE_CONSTRAINTS.MAX_DIMENSION}x${IMAGE_CONSTRAINTS.MAX_DIMENSION} pixels`,
    };
  }

  // Check total resolution (megapixels)
  const totalPixels = width * height;
  if (totalPixels > IMAGE_CONSTRAINTS.MAX_RESOLUTION) {
    return {
      isValid: false,
      error: `Image resolution cannot exceed ${IMAGE_CONSTRAINTS.MAX_RESOLUTION / 1000000}MP`,
    };
  }

  return { isValid: true };
}

/**
 * Validates an image file completely
 * @param file - The file to validate
 * @returns Promise resolving to validation result with dimensions if valid
 */
export async function validateImage(file: File): Promise<{
  isValid: boolean;
  error?: string;
  dimensions?: ImageDimensions;
}> {
  // Validate format
  if (!validateImageFormat(file.type)) {
    return {
      isValid: false,
      error: `Unsupported file format. Allowed formats: ${IMAGE_CONSTRAINTS.ALLOWED_EXTENSIONS.join(", ")}`,
    };
  }

  // Validate size
  if (!validateImageSize(file.size)) {
    return {
      isValid: false,
      error: `File size must be less than ${IMAGE_CONSTRAINTS.MAX_SIZE / (1024 * 1024)}MB`,
    };
  }

  // Get image buffer
  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  // Get and validate dimensions
  try {
    const dimensions = await getImageDimensions(buffer);
    const dimensionValidation = validateImageDimensions(dimensions);

    if (!dimensionValidation.isValid) {
      return {
        isValid: false,
        error: dimensionValidation.error,
      };
    }

    return {
      isValid: true,
      dimensions,
    };
  } catch (error) {
    return {
      isValid: false,
      error: error instanceof Error ? error.message : "Failed to validate image",
    };
  }
}
