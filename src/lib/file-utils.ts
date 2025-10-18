/**
 * Formats a file size in bytes to a human-readable format
 * @param bytes - The file size in bytes
 * @returns Formatted string like "1.5 MB" or "256 KB"
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 Bytes";

  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
}

/**
 * Triggers a browser download for a file from a URL
 * @param url - The URL of the file to download
 * @param filename - The filename to save as
 * @returns Promise that resolves when download is initiated
 */
export async function downloadFile(
  url: string,
  filename: string
): Promise<void> {
  try {
    // Fetch the file
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`Failed to download file: ${response.statusText}`);
    }

    // Get the blob
    const blob = await response.blob();

    // Create a temporary URL for the blob
    const blobUrl = window.URL.createObjectURL(blob);

    // Create a temporary anchor element and trigger download
    const link = document.createElement("a");
    link.href = blobUrl;
    link.download = filename;
    document.body.appendChild(link);
    link.click();

    // Clean up
    document.body.removeChild(link);
    window.URL.revokeObjectURL(blobUrl);
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error occurred";
    throw new Error(`Failed to download file: ${errorMessage}`);
  }
}

/**
 * Extracts the file extension from a filename
 * @param filename - The filename to extract extension from
 * @returns The file extension including the dot (e.g., ".png") or empty string if no extension
 */
export function getFileExtension(filename: string): string {
  const lastDotIndex = filename.lastIndexOf(".");

  if (lastDotIndex === -1 || lastDotIndex === 0) {
    return "";
  }

  return filename.slice(lastDotIndex);
}

/**
 * Generates a safe filename by removing special characters
 * @param filename - The original filename
 * @returns Sanitized filename
 */
export function sanitizeFilename(filename: string): string {
  const extension = getFileExtension(filename);
  const nameWithoutExt = filename.slice(0, filename.length - extension.length);

  // Remove special characters except dash and underscore
  const sanitized = nameWithoutExt.replace(/[^a-zA-Z0-9-_]/g, "-");

  return `${sanitized}${extension}`;
}

/**
 * Generates a unique filename by appending timestamp
 * @param filename - The original filename
 * @returns Unique filename with timestamp
 */
export function generateUniqueFilename(filename: string): string {
  const extension = getFileExtension(filename);
  const nameWithoutExt = filename.slice(0, filename.length - extension.length);
  const timestamp = Date.now();

  return `${sanitizeFilename(nameWithoutExt)}-${timestamp}${extension}`;
}
