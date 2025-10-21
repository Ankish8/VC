"use client";

import {
  ReactCompareSlider,
  ReactCompareSliderImage,
} from "react-compare-slider";
import { cn } from "@/lib/utils";

interface ShowcaseComparisonSliderProps {
  rasterImageUrl: string;
  svgUrl: string;
  filename: string;
  className?: string;
}

export function ShowcaseComparisonSlider({
  rasterImageUrl,
  svgUrl,
  filename,
  className,
}: ShowcaseComparisonSliderProps) {
  return (
    <div className={cn("relative w-full h-full", className)}>
      <ReactCompareSlider
        itemOne={
          <ReactCompareSliderImage
            src={rasterImageUrl}
            alt={`${filename} - Original Raster`}
            style={{ objectFit: "contain", backgroundColor: "#f5f5f5" }}
          />
        }
        itemTwo={
          <ReactCompareSliderImage
            src={svgUrl}
            alt={`${filename} - Converted SVG`}
            style={{ objectFit: "contain", backgroundColor: "#f5f5f5" }}
          />
        }
        position={50}
        style={{ height: "100%" }}
      />

      {/* Simple labels like reference */}
      <div className="absolute top-4 left-4 text-xs uppercase tracking-wider text-gray-400 font-semibold">
        PIXELS
      </div>
      <div className="absolute top-4 right-4 text-xs uppercase tracking-wider text-gray-400 font-semibold">
        VECTORS
      </div>
    </div>
  );
}
