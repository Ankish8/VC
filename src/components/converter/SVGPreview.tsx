"use client";

import { useState } from "react";
import { ConversionResult } from "@/types";
import { SVGEditorLayout } from "./editor/SVGEditorLayout";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { toast } from "sonner";

interface SVGPreviewProps {
  conversion: ConversionResult;
  originalPreviewUrl?: string;
  onDownload: () => void;
  onConvertAnother?: () => void;
  className?: string;
}

export function SVGPreview({
  conversion,
  originalPreviewUrl,
  onDownload,
  onConvertAnother,
  className,
}: SVGPreviewProps) {
  const [copiedCode, setCopiedCode] = useState(false);

  const calculateCompressionRatio = (): string => {
    const ratio =
      ((conversion.originalFileSize - conversion.svgFileSize) /
        conversion.originalFileSize) *
      100;
    return ratio.toFixed(1);
  };

  const handleCopyCode = async () => {
    try {
      const response = await fetch(conversion.svgUrl);
      const svgCode = await response.text();
      await navigator.clipboard.writeText(svgCode);
      setCopiedCode(true);
      toast.success("SVG code copied to clipboard");
      setTimeout(() => setCopiedCode(false), 2000);
    } catch (error) {
      console.error("Failed to copy SVG code:", error);
      toast.error("Failed to copy SVG code");
    }
  };

  return (
    <ErrorBoundary>
      <SVGEditorLayout
        svgUrl={conversion.svgUrl}
        originalImageUrl={originalPreviewUrl || conversion.originalImageUrl}
      filename={conversion.svgFilename}
      onDownload={(svgElement) => {
        const svgString = new XMLSerializer().serializeToString(svgElement);
        const blob = new Blob([svgString], {
          type: "image/svg+xml;charset=utf-8",
        });
        const url = URL.createObjectURL(blob);

        const link = document.createElement("a");
        link.href = url;
        link.download = conversion.svgFilename.replace(/\.svg$/i, "-edited.svg");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        URL.revokeObjectURL(url);
        toast.success("SVG downloaded successfully");
      }}
      onCopyCode={handleCopyCode}
      onConvertAnother={onConvertAnother}
      copiedCode={copiedCode}
      originalFileSize={conversion.originalFileSize}
      svgFileSize={conversion.svgFileSize}
      originalDimensions={conversion.originalDimensions}
      compressionRatio={calculateCompressionRatio()}
      className={className}
    />
    </ErrorBoundary>
  );
}
