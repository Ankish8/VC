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

      {/* Labels with semi-transparent background */}
      <div className="absolute top-4 left-4 bg-black/70 backdrop-blur-sm px-3 py-1.5 rounded-md text-xs uppercase tracking-wider text-white font-semibold">
        RASTER
      </div>
      <div className="absolute top-4 right-4 bg-black/70 backdrop-blur-sm px-3 py-1.5 rounded-md text-xs uppercase tracking-wider text-white font-semibold">
        VECTORS
      </div>
    </div>
  );
}
