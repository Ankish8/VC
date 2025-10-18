import { fal } from "@fal-ai/client";
import { FalConversionResponse } from "@/types";

// Configure fal client with API key from environment
fal.config({
  credentials: process.env.FAL_API_KEY,
});

/**
 * Converts a raster image to SVG using Fal.ai's vectorize endpoint
 * @param imageUrl - The URL of the image to convert
 * @returns Promise resolving to the conversion response
 * @throws Error if conversion fails or API key is missing
 */
export async function convertImageToSVG(
  imageUrl: string
): Promise<FalConversionResponse> {
  if (!process.env.FAL_API_KEY) {
    throw new Error("FAL_API_KEY environment variable is not set");
  }

  if (!imageUrl) {
    throw new Error("Image URL is required");
  }

  try {
    const result = await fal.subscribe("fal-ai/recraft/vectorize", {
      input: {
        image_url: imageUrl,
      },
      logs: true,
      onQueueUpdate: (update: any) => {
        if (update.status === "IN_PROGRESS") {
          console.log(
            `[Fal.ai] Processing image: ${update.logs?.map((log: any) => log.message).join(" ")}`
          );
        }
      },
    });

    // Log the full response for debugging
    console.log('[Fal.ai] Response:', JSON.stringify(result, null, 2));

    // Extract data from response (fal.ai wraps response in a data object)
    const responseData = (result as any).data || result;

    // Validate response structure
    if (!responseData || !responseData.image || !responseData.image.url) {
      console.error('[Fal.ai] Invalid response structure:', result);
      throw new Error("Invalid response from Fal.ai API");
    }

    return responseData as FalConversionResponse;
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error occurred";
    console.error(`[Fal.ai] Conversion failed: ${errorMessage}`);
    throw new Error(`Failed to convert image to SVG: ${errorMessage}`);
  }
}

/**
 * Validates if Fal.ai API is properly configured
 * @returns boolean indicating if API is ready to use
 */
export function isFalClientConfigured(): boolean {
  return !!process.env.FAL_API_KEY;
}
