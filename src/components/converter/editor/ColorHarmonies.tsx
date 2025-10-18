"use client";

import { useState, useRef, useEffect, KeyboardEvent } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Palette, ChevronDown, ChevronUp } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  generateAllHarmonies,
  type ColorHarmony,
} from "@/lib/color-harmonies";

interface ColorHarmoniesProps {
  baseColor: string;
  onColorSelect: (color: string) => void;
  selectedColor?: string;
  className?: string;
}

export function ColorHarmonies({
  baseColor,
  onColorSelect,
  selectedColor,
  className,
}: ColorHarmoniesProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [focusedIndex, setFocusedIndex] = useState<number>(-1);
  const colorButtonsRef = useRef<Map<number, HTMLButtonElement>>(new Map());
  const harmonies = generateAllHarmonies(baseColor);

  // Flatten all colors for navigation
  const allColors = harmonies.flatMap((h) => h.colors);

  // Focus management
  useEffect(() => {
    if (focusedIndex >= 0 && focusedIndex < allColors.length) {
      colorButtonsRef.current.get(focusedIndex)?.focus();
    }
  }, [focusedIndex, allColors.length]);

  const handleKeyDown = (e: KeyboardEvent, index: number) => {
    const colorsPerRow = harmonies.reduce(
      (acc, h, idx) => {
        const startIdx = idx === 0 ? 0 : acc[idx - 1].endIdx;
        return [
          ...acc,
          { startIdx, endIdx: startIdx + h.colors.length, count: h.colors.length },
        ];
      },
      [] as { startIdx: number; endIdx: number; count: number }[]
    );

    const currentRow = colorsPerRow.findIndex(
      (row) => index >= row.startIdx && index < row.endIdx
    );
    const currentRowData = colorsPerRow[currentRow];
    const positionInRow = index - currentRowData.startIdx;

    switch (e.key) {
      case "ArrowRight":
        e.preventDefault();
        if (positionInRow < currentRowData.count - 1) {
          setFocusedIndex(index + 1);
        } else if (currentRow < colorsPerRow.length - 1) {
          setFocusedIndex(colorsPerRow[currentRow + 1].startIdx);
        }
        break;

      case "ArrowLeft":
        e.preventDefault();
        if (positionInRow > 0) {
          setFocusedIndex(index - 1);
        } else if (currentRow > 0) {
          setFocusedIndex(colorsPerRow[currentRow - 1].endIdx - 1);
        }
        break;

      case "ArrowDown":
        e.preventDefault();
        if (currentRow < colorsPerRow.length - 1) {
          const nextRowData = colorsPerRow[currentRow + 1];
          const nextIndex = Math.min(
            nextRowData.startIdx + positionInRow,
            nextRowData.endIdx - 1
          );
          setFocusedIndex(nextIndex);
        }
        break;

      case "ArrowUp":
        e.preventDefault();
        if (currentRow > 0) {
          const prevRowData = colorsPerRow[currentRow - 1];
          const prevIndex = Math.min(
            prevRowData.startIdx + positionInRow,
            prevRowData.endIdx - 1
          );
          setFocusedIndex(prevIndex);
        }
        break;

      case "Enter":
      case " ":
        e.preventDefault();
        onColorSelect(allColors[index]);
        break;

      case "Home":
        e.preventDefault();
        setFocusedIndex(currentRowData.startIdx);
        break;

      case "End":
        e.preventDefault();
        setFocusedIndex(currentRowData.endIdx - 1);
        break;

      case "Tab":
        // Allow default tab behavior
        break;

      default:
        break;
    }
  };

  if (!isExpanded) {
    return (
      <Button
        variant="outline"
        size="sm"
        className={cn("w-full gap-2", className)}
        onClick={() => setIsExpanded(true)}
      >
        <Palette className="h-4 w-4" />
        Show Color Harmonies
        <ChevronDown className="h-4 w-4 ml-auto" />
      </Button>
    );
  }

  return (
    <div className={cn("space-y-3", className)}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Palette className="h-4 w-4" />
          <span className="text-sm font-medium">Color Harmonies</span>
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="h-6 w-6 p-0"
          onClick={() => setIsExpanded(false)}
        >
          <ChevronUp className="h-4 w-4" />
        </Button>
      </div>

      <Separator />

      <ScrollArea className="h-[200px] pr-3">
        <div className="space-y-3">
          {harmonies.map((harmony, harmonyIdx) => {
            const startIdx = harmonies
              .slice(0, harmonyIdx)
              .reduce((acc, h) => acc + h.colors.length, 0);

            return (
              <div
                key={harmony.name}
                className="rounded-lg border p-3 space-y-2"
              >
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold">{harmony.name}</span>
                    <Badge variant="secondary" className="text-xs">
                      {harmony.colors.length} colors
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {harmony.description}
                  </p>
                </div>

                <div className="flex gap-2" role="group" aria-label={`${harmony.name} colors`}>
                  {harmony.colors.map((color, colorIdx) => {
                    const globalIdx = startIdx + colorIdx;
                    return (
                      <button
                        key={color}
                        ref={(el) => {
                          if (el) {
                            colorButtonsRef.current.set(globalIdx, el);
                          } else {
                            colorButtonsRef.current.delete(globalIdx);
                          }
                        }}
                        className={cn(
                          "flex-1 aspect-square rounded border-2 transition-all hover:scale-110 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary",
                          selectedColor?.toLowerCase() === color.toLowerCase() &&
                            "border-primary ring-2 ring-primary/20"
                        )}
                        style={{ backgroundColor: color }}
                        onClick={() => onColorSelect(color)}
                        onKeyDown={(e) => handleKeyDown(e, globalIdx)}
                        tabIndex={globalIdx === 0 ? 0 : -1}
                        title={color.toUpperCase()}
                        aria-label={`${harmony.name} color ${colorIdx + 1}: ${color.toUpperCase()}`}
                      />
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </ScrollArea>
    </div>
  );
}
