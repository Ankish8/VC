"use client";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { ColorInfo } from "@/lib/svg-utils";
import { Paintbrush, Edit2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface EnhancedColorPaletteProps {
  colors: ColorInfo[];
  selectedColor: string | null;
  onColorSelect: (color: string) => void;
  onColorEdit: (color: string) => void;
  className?: string;
}

export function EnhancedColorPalette({
  colors,
  selectedColor,
  onColorSelect,
  onColorEdit,
  className,
}: EnhancedColorPaletteProps) {
  if (colors.length === 0) {
    return (
      <div className={cn("text-center p-6 text-muted-foreground", className)}>
        <Paintbrush className="h-8 w-8 mx-auto mb-2 opacity-50" />
        <p className="text-sm">No colors found in this SVG</p>
      </div>
    );
  }

  const totalUsage = colors.reduce((sum, c) => sum + c.count, 0);

  return (
    <div className={cn("space-y-3", className)}>
      <div className="flex items-center justify-between px-2">
        <div className="flex items-center gap-2">
          <Paintbrush className="h-4 w-4" />
          <span className="text-sm font-medium">Current Colors</span>
        </div>
        <Badge variant="secondary" className="text-xs">
          {colors.length} {colors.length === 1 ? "color" : "colors"}
        </Badge>
      </div>

      <Separator />

      <ScrollArea className="h-[300px] pr-3">
        <div className="space-y-2">
          {colors.map((colorInfo) => {
            const isSelected = selectedColor === colorInfo.color;
            const usagePercent = ((colorInfo.count / totalUsage) * 100).toFixed(1);

            return (
              <div
                key={colorInfo.color}
                className={cn(
                  "relative rounded-lg border p-3 transition-all cursor-pointer group",
                  isSelected && "border-primary border-2 bg-primary/5 shadow-sm",
                  !isSelected && "hover:border-primary/50"
                )}
                onClick={() => onColorSelect(colorInfo.color)}
              >
                <div className="flex items-center gap-3">
                  {/* Color Swatch */}
                  <div className="relative">
                    <div
                      className="w-12 h-12 rounded-lg border-2 shadow-sm"
                      style={{ backgroundColor: colorInfo.color }}
                    />
                    {isSelected && (
                      <div className="absolute inset-0 border-2 border-primary rounded-lg" />
                    )}
                  </div>

                  {/* Color Info */}
                  <div className="flex-1 min-w-0">
                    <div className="font-mono text-sm font-semibold truncate">
                      {colorInfo.color.toUpperCase()}
                    </div>
                    <div className="flex items-center gap-2 mt-1 flex-wrap">
                      {/* Type Badges */}
                      {colorInfo.type === "fill" && (
                        <Badge variant="outline" className="text-xs px-1.5 py-0">
                          Fill
                        </Badge>
                      )}
                      {colorInfo.type === "stroke" && (
                        <Badge variant="outline" className="text-xs px-1.5 py-0">
                          Stroke
                        </Badge>
                      )}
                      {colorInfo.type === "both" && (
                        <>
                          <Badge variant="outline" className="text-xs px-1.5 py-0">
                            Fill
                          </Badge>
                          <Badge variant="outline" className="text-xs px-1.5 py-0">
                            Stroke
                          </Badge>
                        </>
                      )}
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">
                      {colorInfo.count} {colorInfo.count === 1 ? "use" : "uses"} · {usagePercent}%
                    </div>
                  </div>

                  {/* Edit Button */}
                  <Button
                    size="icon"
                    variant={isSelected ? "default" : "ghost"}
                    className={cn(
                      "h-8 w-8 shrink-0",
                      !isSelected && "opacity-0 group-hover:opacity-100 transition-opacity"
                    )}
                    onClick={(e) => {
                      e.stopPropagation();
                      onColorEdit(colorInfo.color);
                    }}
                    title="Edit color"
                  >
                    <Edit2 className="h-4 w-4" />
                  </Button>
                </div>

                {/* Usage Bar */}
                <div className="mt-2 h-1 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary transition-all"
                    style={{ width: `${usagePercent}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </ScrollArea>
    </div>
  );
}
