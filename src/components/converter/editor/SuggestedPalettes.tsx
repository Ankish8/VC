"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Sparkles, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  materialPalettes,
  tailwindPalettes,
  flatUIPalettes,
  trendingPalettes,
  ColorPaletteOption,
} from "@/lib/color-palettes";

interface SuggestedPalettesProps {
  onApplyPalette: (palette: ColorPaletteOption) => void;
  appliedPalette?: string | null;
  className?: string;
}

export function SuggestedPalettes({
  onApplyPalette,
  appliedPalette,
  className,
}: SuggestedPalettesProps) {
  const [selectedTab, setSelectedTab] = useState<string>("material");

  const renderPaletteCard = (palette: ColorPaletteOption) => {
    const isApplied = appliedPalette === palette.name;

    return (
      <div
        key={palette.name}
        className={cn(
          "relative rounded-lg border p-3 hover:border-primary transition-colors cursor-pointer group",
          isApplied && "border-primary border-2 bg-primary/5"
        )}
        onClick={() => onApplyPalette(palette)}
      >
        {/* Palette Name */}
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium">{palette.name}</span>
          {isApplied && (
            <Badge variant="default" className="text-xs gap-1">
              <Check className="h-3 w-3" />
              Applied
            </Badge>
          )}
        </div>

        {/* Color Swatches */}
        <div className="flex gap-1 mb-2">
          {palette.colors.slice(0, 10).map((color, idx) => (
            <div
              key={idx}
              className="h-6 flex-1 rounded shadow-sm border border-border/50"
              style={{ backgroundColor: color }}
              title={color}
            />
          ))}
        </div>

        {/* Apply Button (shows on hover) */}
        <Button
          size="sm"
          variant={isApplied ? "secondary" : "outline"}
          className={cn(
            "w-full text-xs h-7",
            !isApplied && "opacity-0 group-hover:opacity-100 transition-opacity"
          )}
          onClick={(e) => {
            e.stopPropagation();
            onApplyPalette(palette);
          }}
        >
          {isApplied ? "Applied" : "Apply Palette"}
        </Button>
      </div>
    );
  };

  return (
    <div className={cn("space-y-3", className)}>
      <div className="flex items-center gap-2 px-2">
        <Sparkles className="h-4 w-4 text-primary" />
        <span className="text-sm font-medium">Suggested Palettes</span>
      </div>

      <Tabs value={selectedTab} onValueChange={setSelectedTab}>
        <TabsList className="grid w-full grid-cols-4 h-9">
          <TabsTrigger value="material" className="text-xs">
            Material
          </TabsTrigger>
          <TabsTrigger value="tailwind" className="text-xs">
            Tailwind
          </TabsTrigger>
          <TabsTrigger value="flat" className="text-xs">
            Flat UI
          </TabsTrigger>
          <TabsTrigger value="trending" className="text-xs">
            Trending
          </TabsTrigger>
        </TabsList>

        <ScrollArea className="h-[400px] pr-3">
          <TabsContent value="material" className="mt-3 space-y-2">
            {materialPalettes.map(renderPaletteCard)}
          </TabsContent>

          <TabsContent value="tailwind" className="mt-3 space-y-2">
            {tailwindPalettes.map(renderPaletteCard)}
          </TabsContent>

          <TabsContent value="flat" className="mt-3 space-y-2">
            {flatUIPalettes.map(renderPaletteCard)}
          </TabsContent>

          <TabsContent value="trending" className="mt-3 space-y-2">
            {trendingPalettes.map(renderPaletteCard)}
          </TabsContent>
        </ScrollArea>
      </Tabs>

      <div className="text-xs text-muted-foreground text-center px-2">
        Click any palette to apply it to your SVG
      </div>
    </div>
  );
}
