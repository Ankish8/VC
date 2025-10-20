"use client";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, Palette } from "lucide-react";
import { cn } from "@/lib/utils";
import { ColorInfo } from "@/lib/svg-utils";

interface ColorReductionProps {
  currentColorCount: number;
  currentColors: ColorInfo[];
  onReduce: (targetColors: number | "original") => void;
  appliedReduction?: number | "original" | null;
  className?: string;
}

const colorOptions: Array<{ value: number | "original"; label: string; description: string }> = [
  { value: 2, label: "2 Colors", description: "Minimal" },
  { value: 4, label: "4 Colors", description: "Simplified" },
  { value: 8, label: "8 Colors", description: "Balanced" },
  { value: 16, label: "16 Colors", description: "High detail" },
  { value: "original", label: "Original", description: "Keep all colors from SVG" },
];

export function ColorReduction({
  currentColorCount,
  currentColors,
  onReduce,
  appliedReduction,
  className,
}: ColorReductionProps) {
  // Get preview colors for each reduction option (top N colors by frequency)
  const getPreviewColors = (count: number | "original"): string[] => {
    if (count === "original") {
      // Show all colors for original (limit to 20 for display purposes)
      return currentColors.slice(0, Math.min(currentColors.length, 20)).map((c) => c.color);
    }
    const sorted = [...currentColors].sort((a, b) => b.count - a.count);
    return sorted.slice(0, count).map((c) => c.color);
  };

  return (
    <div className={cn("space-y-4", className)}>
      {/* Current Color Count */}
      <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50 border">
        <div className="flex items-center gap-2">
          <Palette className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-medium">Current Colors</span>
        </div>
        <Badge variant="secondary">{currentColorCount}</Badge>
      </div>

      {/* Color Reduction Options */}
      <div className="space-y-2">
        <h4 className="text-xs font-semibold text-muted-foreground mb-2">
          Reduce Colors
        </h4>
        <div className="space-y-2">
          {colorOptions.map((option) => {
            const isApplied = appliedReduction === option.value;
            const isDisabled =
              typeof option.value === "number" && option.value >= currentColorCount;
            const previewColors = getPreviewColors(option.value);

            return (
              <button
                key={option.value}
                onClick={() => !isDisabled && onReduce(option.value)}
                disabled={isDisabled}
                className={cn(
                  "w-full text-left p-3 rounded-lg border transition-all",
                  "hover:bg-accent hover:border-accent-foreground/20",
                  isApplied && "bg-primary/10 border-primary",
                  isDisabled && "opacity-50 cursor-not-allowed hover:bg-transparent"
                )}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-medium">{option.label}</span>
                      {isApplied && (
                        <CheckCircle2 className="h-3 w-3 text-primary" />
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground mb-2">
                      {option.description}
                    </p>

                    {/* Color Palette Preview */}
                    <div className="flex items-center gap-1 flex-wrap">
                      {previewColors.map((color, index) => (
                        <div
                          key={`${color}-${index}`}
                          className="w-5 h-5 rounded border border-muted-foreground/20 flex-shrink-0"
                          style={{ backgroundColor: color }}
                          title={color}
                        />
                      ))}
                      {previewColors.length === 0 && (
                        <span className="text-xs text-muted-foreground italic">
                          No colors
                        </span>
                      )}
                    </div>
                  </div>
                  {typeof option.value === "number" && (
                    <div className="text-xs font-mono text-muted-foreground flex-shrink-0">
                      {option.value}
                    </div>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Helper Text */}
      <p className="text-xs text-muted-foreground">
        Reducing colors simplifies the SVG and decreases file size. Changes can be reset anytime.
      </p>
    </div>
  );
}
