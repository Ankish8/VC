"use client";

import { SkeletonShimmer } from "@/components/ui/skeleton";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface SVGCanvasSkeletonProps {
  className?: string;
  message?: string;
}

/**
 * Loading skeleton for SVG canvas with shimmer effect
 * Provides visual feedback while SVG is being loaded or processed
 */
export function SVGCanvasSkeleton({
  className,
  message = "Loading SVG...",
}: SVGCanvasSkeletonProps) {
  return (
    <div className={cn("relative w-full h-full bg-muted/30", className)}>
      {/* Main skeleton area */}
      <div className="absolute inset-0 flex items-center justify-center p-8">
        <div className="w-full max-w-2xl space-y-6">
          {/* Large central rectangle - simulates SVG canvas */}
          <SkeletonShimmer className="w-full h-64 rounded-lg" />

          {/* Smaller elements - simulate SVG paths/shapes */}
          <div className="grid grid-cols-3 gap-4">
            <SkeletonShimmer className="h-24 rounded-md" />
            <SkeletonShimmer className="h-24 rounded-md" />
            <SkeletonShimmer className="h-24 rounded-md" />
          </div>

          {/* Loading message */}
          <div className="flex items-center justify-center gap-3 pt-4">
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
            <p className="text-sm font-medium text-muted-foreground">
              {message}
            </p>
          </div>
        </div>
      </div>

      {/* Zoom controls skeleton - matches actual controls position */}
      <div className="absolute top-4 right-4 z-10 flex flex-col gap-1 bg-background/95 border rounded-lg p-1 shadow-lg">
        <SkeletonShimmer className="h-8 w-8 rounded-md" />
        <SkeletonShimmer className="h-6 w-8 rounded-md" />
        <SkeletonShimmer className="h-8 w-8 rounded-md" />
        <div className="h-px bg-border my-1" />
        <SkeletonShimmer className="h-8 w-8 rounded-md" />
        <SkeletonShimmer className="h-8 w-8 rounded-md" />
      </div>
    </div>
  );
}
