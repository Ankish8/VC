"use client";

import { useState } from "react";
import {
  Download,
  Copy,
  CheckCircle2,
  FileImage,
  FileCode,
  TrendingDown,
  Maximize2,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { ConversionResult } from "@/types";

interface SVGPreviewProps {
  conversion: ConversionResult;
  originalPreviewUrl?: string;
  onDownload: () => void;
  className?: string;
}

export function SVGPreview({
  conversion,
  originalPreviewUrl,
  onDownload,
  className,
}: SVGPreviewProps) {
  const [copiedCode, setCopiedCode] = useState(false);
  const [activeTab, setActiveTab] = useState<"original" | "svg" | "comparison">(
    "svg"
  );

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

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
      setTimeout(() => setCopiedCode(false), 2000);
    } catch (error) {
      console.error("Failed to copy SVG code:", error);
    }
  };

  return (
    <div className={cn("w-full space-y-6", className)}>
      {/* Success Header - Compact */}
      <div className="flex items-center justify-between px-2">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center p-2 bg-green-500/10 rounded-full">
            <CheckCircle2 className="h-5 w-5 text-green-500" />
          </div>
          <h2 className="text-xl font-bold">Conversion Complete</h2>
        </div>
        <Badge variant="secondary" className="text-sm px-3 py-1.5">
          <TrendingDown className="h-3 w-3 mr-1" />
          {calculateCompressionRatio()}% smaller
        </Badge>
      </div>

      {/* Large Preview - No Card Wrapper */}
      <div className="space-y-4">
        {/* Preview Tabs */}
        <Tabs
          value={activeTab}
          onValueChange={(value) =>
            setActiveTab(value as "original" | "svg" | "comparison")
          }
        >
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="original" className="flex items-center gap-2">
              <FileImage className="h-4 w-4" />
              Original
            </TabsTrigger>
            <TabsTrigger value="svg" className="flex items-center gap-2">
              <FileCode className="h-4 w-4" />
              SVG
            </TabsTrigger>
            <TabsTrigger value="comparison" className="flex items-center gap-2">
              <Maximize2 className="h-4 w-4" />
              Compare
            </TabsTrigger>
          </TabsList>

          <TabsContent value="original" className="mt-4">
            <div className="relative w-full overflow-hidden rounded-xl border-2 bg-muted shadow-xl" style={{ minHeight: '70vh' }}>
              {originalPreviewUrl ? (
                <img
                  src={originalPreviewUrl}
                  alt="Original"
                  className="h-full w-full object-contain p-4"
                />
              ) : (
                <img
                  src={conversion.originalImageUrl}
                  alt="Original"
                  className="h-full w-full object-contain p-4"
                  crossOrigin="anonymous"
                />
              )}
            </div>
          </TabsContent>

          <TabsContent value="svg" className="mt-4">
            <div className="relative w-full overflow-hidden rounded-xl border-2 bg-muted shadow-xl" style={{ minHeight: '70vh' }}>
              <img
                src={conversion.svgUrl}
                alt="SVG Preview"
                className="h-full w-full object-contain p-4"
                crossOrigin="anonymous"
              />
            </div>
          </TabsContent>

          <TabsContent value="comparison" className="mt-4">
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-3">
                <div className="relative w-full overflow-hidden rounded-xl border-2 bg-muted shadow-xl" style={{ minHeight: '60vh' }}>
                  {originalPreviewUrl ? (
                    <img
                      src={originalPreviewUrl}
                      alt="Original"
                      className="h-full w-full object-contain p-4"
                    />
                  ) : (
                    <img
                      src={conversion.originalImageUrl}
                      alt="Original"
                      className="h-full w-full object-contain p-4"
                      crossOrigin="anonymous"
                    />
                  )}
                </div>
                <div className="text-center">
                  <Badge variant="outline" className="text-sm py-1.5 px-4">
                    Original
                  </Badge>
                </div>
              </div>

              <div className="space-y-3">
                <div className="relative w-full overflow-hidden rounded-xl border-2 bg-muted shadow-xl" style={{ minHeight: '60vh' }}>
                  <img
                    src={conversion.svgUrl}
                    alt="SVG"
                    className="h-full w-full object-contain p-4"
                    crossOrigin="anonymous"
                  />
                </div>
                <div className="text-center">
                  <Badge variant="outline" className="text-sm py-1.5 px-4">
                    SVG
                  </Badge>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>

        {/* File Information - Below Preview */}
        <div className="grid grid-cols-2 gap-4 rounded-lg border bg-card p-4">
          <div className="flex items-center gap-3">
            <FileImage className="h-5 w-5 text-muted-foreground" />
            <div>
              <div className="text-sm font-medium text-muted-foreground">Original</div>
              <div className="text-lg font-bold">{formatFileSize(conversion.originalFileSize)}</div>
              <div className="text-xs text-muted-foreground">{conversion.originalDimensions}</div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <FileCode className="h-5 w-5 text-muted-foreground" />
            <div>
              <div className="text-sm font-medium text-muted-foreground">SVG</div>
              <div className="text-lg font-bold">{formatFileSize(conversion.svgFileSize)}</div>
              <div className="text-xs text-muted-foreground">Vector Format</div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col gap-3 sm:flex-row">
          <Button onClick={onDownload} className="flex-1 gap-2 h-12" size="lg">
            <Download className="h-5 w-5" />
            Download SVG
          </Button>
          <Button
            variant="outline"
            onClick={handleCopyCode}
            className="flex-1 gap-2 h-12"
            size="lg"
          >
            {copiedCode ? (
              <>
                <CheckCircle2 className="h-5 w-5" />
                Copied!
              </>
            ) : (
              <>
                <Copy className="h-5 w-5" />
                Copy SVG Code
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
