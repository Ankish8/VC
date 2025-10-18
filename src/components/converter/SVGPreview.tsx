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
    <Card className={cn("w-full", className)}>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <CardTitle className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-green-500" />
              Conversion Complete
            </CardTitle>
            <CardDescription>
              Your SVG is ready for download
            </CardDescription>
          </div>
          <Badge variant="secondary" className="flex items-center gap-1">
            <TrendingDown className="h-3 w-3" />
            {calculateCompressionRatio()}% smaller
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* File Information */}
        <div className="grid grid-cols-2 gap-4 rounded-lg border bg-muted/50 p-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <FileImage className="h-4 w-4" />
              Original
            </div>
            <div className="text-lg font-semibold">
              {formatFileSize(conversion.originalFileSize)}
            </div>
            <div className="text-xs text-muted-foreground">
              {conversion.originalDimensions}
            </div>
          </div>

          <div className="space-y-1">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <FileCode className="h-4 w-4" />
              SVG
            </div>
            <div className="text-lg font-semibold">
              {formatFileSize(conversion.svgFileSize)}
            </div>
            <div className="text-xs text-muted-foreground">Vector Format</div>
          </div>
        </div>

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
            <TabsTrigger
              value="comparison"
              className="flex items-center gap-2"
            >
              <Maximize2 className="h-4 w-4" />
              Compare
            </TabsTrigger>
          </TabsList>

          <TabsContent value="original" className="mt-4">
            <div className="relative aspect-video w-full overflow-hidden rounded-lg border bg-muted">
              {originalPreviewUrl ? (
                <img
                  src={originalPreviewUrl}
                  alt="Original"
                  className="h-full w-full object-contain"
                />
              ) : (
                <img
                  src={conversion.originalImageUrl}
                  alt="Original"
                  className="h-full w-full object-contain"
                  crossOrigin="anonymous"
                />
              )}
            </div>
            <p className="mt-2 text-center text-sm text-muted-foreground">
              {conversion.originalFilename}
            </p>
          </TabsContent>

          <TabsContent value="svg" className="mt-4">
            <div className="relative aspect-video w-full overflow-hidden rounded-lg border bg-muted">
              <img
                src={conversion.svgUrl}
                alt="SVG Preview"
                className="h-full w-full object-contain"
                crossOrigin="anonymous"
              />
            </div>
            <p className="mt-2 text-center text-sm text-muted-foreground">
              {conversion.svgFilename}
            </p>
          </TabsContent>

          <TabsContent value="comparison" className="mt-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="relative aspect-square w-full overflow-hidden rounded-lg border bg-muted">
                  {originalPreviewUrl ? (
                    <img
                      src={originalPreviewUrl}
                      alt="Original"
                      className="h-full w-full object-contain"
                    />
                  ) : (
                    <img
                      src={conversion.originalImageUrl}
                      alt="Original"
                      className="h-full w-full object-contain"
                      crossOrigin="anonymous"
                    />
                  )}
                </div>
                <Badge variant="outline" className="w-full justify-center">
                  Original
                </Badge>
              </div>

              <div className="space-y-2">
                <div className="relative aspect-square w-full overflow-hidden rounded-lg border bg-muted">
                  <img
                    src={conversion.svgUrl}
                    alt="SVG"
                    className="h-full w-full object-contain"
                    crossOrigin="anonymous"
                  />
                </div>
                <Badge variant="outline" className="w-full justify-center">
                  SVG
                </Badge>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>

      <CardFooter className="flex flex-col gap-2 sm:flex-row">
        <Button onClick={onDownload} className="flex-1 gap-2" size="lg">
          <Download className="h-4 w-4" />
          Download SVG
        </Button>
        <Button
          variant="outline"
          onClick={handleCopyCode}
          className="flex-1 gap-2"
          size="lg"
        >
          {copiedCode ? (
            <>
              <CheckCircle2 className="h-4 w-4" />
              Copied!
            </>
          ) : (
            <>
              <Copy className="h-4 w-4" />
              Copy SVG Code
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  );
}
