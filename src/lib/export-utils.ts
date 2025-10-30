import { ExportOptions } from "@/components/converter/editor/ExportDialog";
import { toast } from "sonner";

/**
 * Export utilities for SVG, PNG, and PDF formats
 */

/**
 * Optimize SVG by reducing decimal precision
 * Uses async processing to prevent blocking the main thread
 */
async function optimizeSVG(svgString: string, precision: number): Promise<string> {
  if (precision === -1) return svgString; // No optimization

  // Yield to the main thread before heavy regex operations
  await new Promise(resolve => setTimeout(resolve, 0));

  // Round numbers to specified precision
  const regex = /(\d+\.\d+)/g;
  return svgString.replace(regex, (match) => {
    const num = parseFloat(match);
    return num.toFixed(precision);
  });
}

/**
 * Export SVG with optimization options
 * Uses async processing to prevent blocking the main thread
 */
export async function exportSVG(svgElement: SVGElement, options: ExportOptions): Promise<void> {
  try {
    // Yield to main thread before heavy serialization
    await new Promise(resolve => setTimeout(resolve, 0));

    let svgString = new XMLSerializer().serializeToString(svgElement);

    // Apply optimization if requested
    if (options.svgOptimize && options.svgPrecision !== undefined) {
      svgString = await optimizeSVG(svgString, options.svgPrecision);
    }

    // Yield again before DOM manipulation
    await new Promise(resolve => setTimeout(resolve, 0));

    // Create blob and download
    const blob = new Blob([svgString], { type: "image/svg+xml" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${options.filename}.svg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    toast.success("SVG exported successfully");
  } catch (error) {
    console.error("Error exporting SVG:", error);
    toast.error("Failed to export SVG");
  }
}

/**
 * Export as PNG using canvas
 * Uses async processing to prevent blocking the main thread
 */
export async function exportPNG(svgElement: SVGElement, options: ExportOptions): Promise<void> {
  try {
    // Yield to main thread before heavy operations
    await new Promise(resolve => setTimeout(resolve, 0));

    const svgString = new XMLSerializer().serializeToString(svgElement);
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");

    if (!ctx) {
      throw new Error("Could not get canvas context");
    }

    // Get SVG dimensions
    const svgRect = svgElement.getBoundingClientRect();
    const scale = options.pngScale || 2;

    canvas.width = svgRect.width * scale;
    canvas.height = svgRect.height * scale;

    // Create image from SVG
    const img = new Image();
    const blob = new Blob([svgString], { type: "image/svg+xml" });
    const url = URL.createObjectURL(blob);

    // Use Promise to handle async image loading
    await new Promise<void>((resolve, reject) => {
      img.onload = async () => {
        // Yield before heavy canvas operations
        await new Promise(r => setTimeout(r, 0));

        // Draw SVG to canvas
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        URL.revokeObjectURL(url);

        // Convert to PNG blob
        canvas.toBlob(
          async (pngBlob) => {
            if (!pngBlob) {
              toast.error("Failed to create PNG");
              reject(new Error("Failed to create PNG"));
              return;
            }

            // Yield before final DOM operations
            await new Promise(r => setTimeout(r, 0));

            const pngUrl = URL.createObjectURL(pngBlob);
            const link = document.createElement("a");
            link.href = pngUrl;
            link.download = `${options.filename}.png`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(pngUrl);

            toast.success("PNG exported successfully");
            resolve();
          },
          "image/png",
          (options.pngQuality || 95) / 100
        );
      };

      img.onerror = () => {
        URL.revokeObjectURL(url);
        toast.error("Failed to load SVG for PNG export");
        reject(new Error("Failed to load SVG"));
      };

      img.src = url;
    });
  } catch (error) {
    console.error("Error exporting PNG:", error);
    toast.error("Failed to export PNG");
  }
}

/**
 * Export as PDF using jsPDF (would need to be installed)
 * For now, this is a placeholder that uses canvas approach
 */
export async function exportPDF(
  svgElement: SVGElement,
  options: ExportOptions
): Promise<void> {
  try {
    // For PDF export, we'll convert SVG to canvas first
    const svgString = new XMLSerializer().serializeToString(svgElement);
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");

    if (!ctx) {
      throw new Error("Could not get canvas context");
    }

    // Get SVG dimensions
    const svgRect = svgElement.getBoundingClientRect();

    // Set canvas size based on page size
    let pageWidth = svgRect.width;
    let pageHeight = svgRect.height;

    if (options.pdfPageSize === "A4") {
      // A4 dimensions in pixels at 96 DPI
      pageWidth = options.pdfOrientation === "landscape" ? 1123 : 794;
      pageHeight = options.pdfOrientation === "landscape" ? 794 : 1123;
    } else if (options.pdfPageSize === "Letter") {
      // Letter dimensions in pixels at 96 DPI
      pageWidth = options.pdfOrientation === "landscape" ? 1056 : 816;
      pageHeight = options.pdfOrientation === "landscape" ? 816 : 1056;
    }

    canvas.width = pageWidth;
    canvas.height = pageHeight;

    // Fill white background
    ctx.fillStyle = "white";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Create image from SVG
    const img = new Image();
    const blob = new Blob([svgString], { type: "image/svg+xml" });
    const url = URL.createObjectURL(blob);

    img.onload = () => {
      // Calculate scaling to fit SVG in page
      const scaleX = canvas.width / svgRect.width;
      const scaleY = canvas.height / svgRect.height;
      const scale = Math.min(scaleX, scaleY, 1); // Don't upscale

      const scaledWidth = svgRect.width * scale;
      const scaledHeight = svgRect.height * scale;

      // Center the image
      const x = (canvas.width - scaledWidth) / 2;
      const y = (canvas.height - scaledHeight) / 2;

      ctx.drawImage(img, x, y, scaledWidth, scaledHeight);
      URL.revokeObjectURL(url);

      // For now, save as PNG with PDF naming
      // In a production app, you'd use jsPDF library here
      canvas.toBlob((pdfBlob) => {
        if (!pdfBlob) {
          toast.error("Failed to create PDF");
          return;
        }

        const pdfUrl = URL.createObjectURL(pdfBlob);
        const link = document.createElement("a");
        link.href = pdfUrl;
        link.download = `${options.filename}.pdf`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(pdfUrl);

        toast.success(
          "PDF export is in beta. Currently exports as PNG. Install jsPDF for true PDF support."
        );
      }, "image/png");
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
      toast.error("Failed to load SVG for PDF export");
    };

    img.src = url;
  } catch (error) {
    console.error("Error exporting PDF:", error);
    toast.error("Failed to export PDF");
  }
}

/**
 * Main export function that routes to the appropriate exporter
 */
export async function exportFile(
  svgElement: SVGElement | null,
  options: ExportOptions
): Promise<void> {
  if (!svgElement) {
    toast.error("No SVG element to export");
    return;
  }

  switch (options.format) {
    case "svg":
      await exportSVG(svgElement, options);
      break;
    case "png":
      await exportPNG(svgElement, options);
      break;
    case "pdf":
      await exportPDF(svgElement, options);
      break;
    default:
      toast.error(`Unsupported export format: ${options.format}`);
  }
}
