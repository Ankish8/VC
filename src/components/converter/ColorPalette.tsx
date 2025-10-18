"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ColorInfo } from "@/lib/svg-utils";
import { Paintbrush } from "lucide-react";
import { cn } from "@/lib/utils";

interface ColorPaletteProps {
  colors: ColorInfo[];
  selectedColor: string | null;
  onColorSelect: (color: string) => void;
  className?: string;
}

export function ColorPalette({
  colors,
  selectedColor,
  onColorSelect,
  className,
}: ColorPaletteProps) {
  if (colors.length === 0) {
    return (
      <div className={cn("text-center p-8 text-muted-foreground", className)}>
        <p>No colors found in this SVG</p>
      </div>
    );
  }

  return (
    <div className={cn("space-y-4", className)}>
      <div className="flex items-center gap-2 text-sm font-medium">
        <Paintbrush className="h-4 w-4" />
        <span>SVG Colors ({colors.length})</span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
        {colors.map((colorInfo) => (
          <Button
            key={colorInfo.color}
            variant="outline"
            className={cn(
              "h-auto flex-col items-start p-3 gap-2 hover:border-primary",
              selectedColor === colorInfo.color &&
                "border-primary border-2 bg-primary/5"
            )}
            onClick={() => onColorSelect(colorInfo.color)}
          >
            <div className="flex items-center gap-2 w-full">
              <div
                className="w-8 h-8 rounded border-2 border-border shadow-sm"
                style={{ backgroundColor: colorInfo.color }}
              />
              <div className="flex-1 text-left">
                <div className="font-mono text-xs font-semibold">
                  {colorInfo.color.toUpperCase()}
                </div>
                <div className="flex gap-1 mt-1">
                  {colorInfo.type === "fill" && (
                    <Badge variant="secondary" className="text-xs px-1.5 py-0">
                      Fill
                    </Badge>
                  )}
                  {colorInfo.type === "stroke" && (
                    <Badge variant="secondary" className="text-xs px-1.5 py-0">
                      Stroke
                    </Badge>
                  )}
                  {colorInfo.type === "both" && (
                    <>
                      <Badge
                        variant="secondary"
                        className="text-xs px-1.5 py-0"
                      >
                        Fill
                      </Badge>
                      <Badge
                        variant="secondary"
                        className="text-xs px-1.5 py-0"
                      >
                        Stroke
                      </Badge>
                    </>
                  )}
                </div>
              </div>
            </div>
            <div className="text-xs text-muted-foreground w-full text-left">
              Used {colorInfo.count} time{colorInfo.count !== 1 ? "s" : ""}
            </div>
          </Button>
        ))}
      </div>
    </div>
  );
}
