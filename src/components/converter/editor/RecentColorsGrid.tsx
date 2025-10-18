"use client";

import { useRef, useEffect, KeyboardEvent, useState } from "react";
import { cn } from "@/lib/utils";

interface RecentColorsGridProps {
  colors: string[];
  selectedColor?: string;
  onColorSelect: (color: string) => void;
  columns?: number;
  className?: string;
}

export function RecentColorsGrid({
  colors,
  selectedColor,
  onColorSelect,
  columns = 6,
  className,
}: RecentColorsGridProps) {
  const [focusedIndex, setFocusedIndex] = useState<number>(-1);
  const colorButtonsRef = useRef<Map<number, HTMLButtonElement>>(new Map());

  // Focus management
  useEffect(() => {
    if (focusedIndex >= 0 && focusedIndex < colors.length) {
      colorButtonsRef.current.get(focusedIndex)?.focus();
    }
  }, [focusedIndex, colors.length]);

  const handleKeyDown = (e: KeyboardEvent, index: number) => {
    const row = Math.floor(index / columns);
    const col = index % columns;
    const totalRows = Math.ceil(colors.length / columns);

    switch (e.key) {
      case "ArrowRight":
        e.preventDefault();
        if (index < colors.length - 1) {
          setFocusedIndex(index + 1);
        }
        break;

      case "ArrowLeft":
        e.preventDefault();
        if (index > 0) {
          setFocusedIndex(index - 1);
        }
        break;

      case "ArrowDown":
        e.preventDefault();
        if (row < totalRows - 1) {
          const nextIndex = Math.min(index + columns, colors.length - 1);
          setFocusedIndex(nextIndex);
        }
        break;

      case "ArrowUp":
        e.preventDefault();
        if (row > 0) {
          const prevIndex = index - columns;
          setFocusedIndex(prevIndex);
        }
        break;

      case "Enter":
      case " ":
        e.preventDefault();
        onColorSelect(colors[index]);
        break;

      case "Home":
        e.preventDefault();
        setFocusedIndex(row * columns);
        break;

      case "End":
        e.preventDefault();
        const lastInRow = Math.min((row + 1) * columns - 1, colors.length - 1);
        setFocusedIndex(lastInRow);
        break;

      default:
        break;
    }
  };

  if (colors.length === 0) {
    return null;
  }

  return (
    <div className={cn("w-full", className)}>
      <div className="text-xs font-medium text-muted-foreground mb-2">
        Recent Colors
      </div>
      <div
        className={`grid gap-2`}
        style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}
        role="group"
        aria-label="Recent colors"
      >
        {colors.map((color, index) => (
          <button
            key={`${color}-${index}`}
            ref={(el) => {
              if (el) {
                colorButtonsRef.current.set(index, el);
              } else {
                colorButtonsRef.current.delete(index);
              }
            }}
            className={cn(
              "w-full aspect-square rounded border-2 transition-all hover:scale-110 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary",
              selectedColor?.toLowerCase() === color.toLowerCase() &&
                "border-primary ring-2 ring-primary/20"
            )}
            style={{ backgroundColor: color }}
            onClick={() => onColorSelect(color)}
            onKeyDown={(e) => handleKeyDown(e, index)}
            tabIndex={index === 0 ? 0 : -1}
            title={color.toUpperCase()}
            aria-label={`Recent color ${index + 1}: ${color.toUpperCase()}`}
          />
        ))}
      </div>
    </div>
  );
}
