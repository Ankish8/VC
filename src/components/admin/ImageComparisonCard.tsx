"use client";

import { useState, useRef, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, ImageIcon } from "lucide-react";
import { Conversion } from "@/types";
import { formatDistance } from "date-fns";
import { toast } from "sonner";

interface ImageComparisonCardProps {
  conversion: Conversion;
  onClick: () => void;
}

export function ImageComparisonCard({ conversion, onClick }: ImageComparisonCardProps) {
  const [isInView, setIsInView] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  // Intersection Observer for lazy loading
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsInView(true);
            observer.unobserve(entry.target);
          }
        });
      },
      {
        rootMargin: "200px", // Start loading 200px before the image enters viewport
      }
    );

    if (cardRef.current) {
      observer.observe(cardRef.current);
    }

    return () => {
      if (cardRef.current) {
        observer.unobserve(cardRef.current);
      }
    };
  }, []);

  const handleDownload = async (url: string, filename: string, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent card click

    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      window.URL.revokeObjectURL(blobUrl);
      toast.success(`Downloaded ${filename}`);
    } catch (error) {
      console.error("Error downloading file:", error);
      toast.error("Failed to download file");
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const sizeReduction = conversion.originalFileSize > 0
    ? Math.round(((conversion.originalFileSize - conversion.svgFileSize) / conversion.originalFileSize) * 100)
    : 0;

  return (
    <Card
      ref={cardRef}
      className="overflow-hidden hover:shadow-lg transition-shadow duration-200 cursor-pointer group"
      onClick={onClick}
    >
      <CardContent className="p-0">
        {/* Original Image */}
        <div className="relative bg-muted/30">
          <div className="absolute top-2 left-2 z-10">
            <div className="bg-background/90 backdrop-blur-sm px-2 py-1 rounded text-xs font-medium">
              Original
            </div>
          </div>
          <div className="absolute top-2 right-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
            <Button
              variant="secondary"
              size="sm"
              onClick={(e) => handleDownload(conversion.originalImageUrl, conversion.originalFilename, e)}
            >
              <Download className="h-3 w-3 mr-1" />
              Download
            </Button>
          </div>
          <div className="aspect-video flex items-center justify-center">
            {isInView ? (
              <img
                src={conversion.originalImageUrl}
                alt={conversion.originalFilename}
                className="w-full h-full object-contain"
                loading="lazy"
              />
            ) : (
              <div className="flex items-center justify-center w-full h-full">
                <ImageIcon className="h-12 w-12 text-muted-foreground animate-pulse" />
              </div>
            )}
          </div>
        </div>

        {/* SVG Image */}
        <div className="relative bg-muted/10 border-t">
          <div className="absolute top-2 left-2 z-10">
            <div className="bg-primary/90 text-primary-foreground backdrop-blur-sm px-2 py-1 rounded text-xs font-medium">
              SVG
            </div>
          </div>
          <div className="absolute top-2 right-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
            <Button
              variant="secondary"
              size="sm"
              onClick={(e) => handleDownload(conversion.svgUrl, conversion.svgFilename, e)}
            >
              <Download className="h-3 w-3 mr-1" />
              Download
            </Button>
          </div>
          <div className="aspect-video flex items-center justify-center">
            {isInView ? (
              <img
                src={conversion.svgUrl}
                alt={conversion.svgFilename}
                className="w-full h-full object-contain"
                loading="lazy"
              />
            ) : (
              <div className="flex items-center justify-center w-full h-full">
                <ImageIcon className="h-12 w-12 text-muted-foreground animate-pulse" />
              </div>
            )}
          </div>
        </div>

        {/* Footer Info */}
        <div className="p-4 border-t bg-card space-y-2">
          <div className="font-medium text-sm truncate" title={conversion.originalFilename}>
            {conversion.originalFilename}
          </div>
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <div>
              {formatFileSize(conversion.originalFileSize)} → {formatFileSize(conversion.svgFileSize)}
              {sizeReduction > 0 && (
                <span className="text-green-500 ml-1">(-{sizeReduction}%)</span>
              )}
            </div>
            <div>
              {formatDistance(new Date(conversion.createdAt), new Date(), { addSuffix: true })}
            </div>
          </div>
          <div className="text-xs text-muted-foreground">
            {conversion.originalDimensions}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
