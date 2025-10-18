"use client";

import {
  ReactCompareSlider,
  ReactCompareSliderImage,
} from "react-compare-slider";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

interface ComparisonViewProps {
  originalImageUrl: string;
  svgUrl: string;
  onClose: () => void;
  className?: string;
}

export function ComparisonView({
  originalImageUrl,
  svgUrl,
  onClose,
  className,
}: ComparisonViewProps) {
  return (
    <div
      className={cn(
        "relative w-full h-full bg-muted/30 rounded-xl border-2 overflow-hidden",
        className
      )}
    >
      {/* Close Button */}
      <Button
        variant="secondary"
        size="icon"
        className="absolute top-4 right-4 z-10 shadow-lg"
        onClick={onClose}
        title="Close comparison"
      >
        <X className="h-4 w-4" />
      </Button>

      {/* Comparison Slider */}
      <div className="w-full h-full p-4">
        <ReactCompareSlider
          itemOne={
            <ReactCompareSliderImage
              src={originalImageUrl}
              alt="Original"
              style={{ objectFit: "contain" }}
            />
          }
          itemTwo={
            <ReactCompareSliderImage
              src={svgUrl}
              alt="SVG"
              style={{ objectFit: "contain" }}
            />
          }
          position={50}
          className="rounded-lg overflow-hidden"
          style={{ height: "100%" }}
        />
      </div>

      {/* Labels */}
      <div className="absolute bottom-4 left-4 bg-background/90 backdrop-blur px-3 py-1.5 rounded-lg text-xs font-medium border">
        Original
      </div>
      <div className="absolute bottom-4 right-4 bg-background/90 backdrop-blur px-3 py-1.5 rounded-lg text-xs font-medium border">
        SVG
      </div>
    </div>
  );
}
