"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Split } from "lucide-react";
import { cn } from "@/lib/utils";
import { EditorTool } from "./types";
import { SVGCanvas } from "./SVGCanvas";
import { ToolsPanel } from "./ToolsPanel";
import { ComparisonView } from "./ComparisonView";
import { MiniMap } from "./MiniMap";
import { HexColorPicker } from "react-colorful";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  extractSVGColors,
  replaceSVGColor,
  cloneSVGElement,
  ColorInfo,
} from "@/lib/svg-utils";
import { ColorPaletteOption } from "@/lib/color-palettes";

interface SVGEditorLayoutProps {
  svgUrl: string;
  originalImageUrl?: string;
  filename: string;
  onDownload?: (svgElement: SVGElement) => void;
  onCopyCode?: () => void;
  onConvertAnother?: () => void;
  copiedCode?: boolean;
  // File info
  originalFileSize?: number;
  svgFileSize?: number;
  originalDimensions?: string;
  compressionRatio?: string;
  className?: string;
}

export function SVGEditorLayout({
  svgUrl,
  originalImageUrl,
  filename,
  onDownload,
  onCopyCode,
  onConvertAnother,
  copiedCode,
  originalFileSize,
  svgFileSize,
  originalDimensions,
  compressionRatio,
  className,
}: SVGEditorLayoutProps) {
  // Editor state
  const [activeTool, setActiveTool] = useState<EditorTool>("select");
  const [svgElement, setSvgElement] = useState<SVGElement | null>(null);
  const [originalSvgElement, setOriginalSvgElement] = useState<SVGElement | null>(null);
  const [colors, setColors] = useState<ColorInfo[]>([]);
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [hasChanges, setHasChanges] = useState(false);
  const [appliedPalette, setAppliedPalette] = useState<string | null>(null);

  // UI state
  const [showComparison, setShowComparison] = useState(false);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [newColor, setNewColor] = useState<string>("#000000");
  const [colorToEdit, setColorToEdit] = useState<string | null>(null);

  // Get cursor based on active tool
  const getCursor = () => {
    switch (activeTool) {
      case "colorReplace":
        return "crosshair";
      case "eraser":
        return "not-allowed";
      default:
        return "default";
    }
  };

  // Load SVG
  useEffect(() => {
    const loadSVG = async () => {
      try {
        const response = await fetch(svgUrl);
        const svgText = await response.text();

        const parser = new DOMParser();
        const doc = parser.parseFromString(svgText, "image/svg+xml");
        const svg = doc.querySelector("svg");

        if (svg) {
          const clonedSvg = cloneSVGElement(svg);
          setSvgElement(clonedSvg);
          setOriginalSvgElement(cloneSVGElement(svg));

          // Extract colors
          const extractedColors = extractSVGColors(clonedSvg);
          setColors(extractedColors);
        }
      } catch (error) {
        console.error("Failed to load SVG:", error);
        toast.error("Failed to load SVG");
      }
    };

    loadSVG();
  }, [svgUrl]);

  // Handle color selection
  const handleColorSelect = (color: string) => {
    setSelectedColor(color);
    if (activeTool === "eyedropper") {
      toast.success(`Picked color: ${color}`);
    }
  };

  // Handle color edit
  const handleColorEdit = (color: string) => {
    setColorToEdit(color);
    setNewColor(color);
    setShowColorPicker(true);
  };

  // Apply color change
  const handleApplyColor = () => {
    if (!colorToEdit || !svgElement || colorToEdit === newColor) {
      setShowColorPicker(false);
      return;
    }

    replaceSVGColor(svgElement, colorToEdit, newColor);

    // Re-extract colors
    const updatedColors = extractSVGColors(svgElement);
    setColors(updatedColors);

    setHasChanges(true);
    setShowColorPicker(false);
    setColorToEdit(null);

    toast.success("Color updated successfully");
  };

  // Apply palette
  const handleApplyPalette = (palette: ColorPaletteOption) => {
    if (!svgElement || colors.length === 0) return;

    // Map current colors to palette colors
    const sortedColors = [...colors].sort((a, b) => b.count - a.count);
    const paletteColors = palette.colors.slice(0, sortedColors.length);

    sortedColors.forEach((colorInfo, index) => {
      if (index < paletteColors.length) {
        replaceSVGColor(svgElement, colorInfo.color, paletteColors[index]);
      }
    });

    // Re-extract colors
    const updatedColors = extractSVGColors(svgElement);
    setColors(updatedColors);

    setHasChanges(true);
    setAppliedPalette(palette.name);

    toast.success(`Applied ${palette.name} palette`);
  };

  // Reset changes
  const handleReset = () => {
    if (!originalSvgElement) return;

    const clonedOriginal = cloneSVGElement(originalSvgElement);
    setSvgElement(clonedOriginal);

    const originalColors = extractSVGColors(clonedOriginal);
    setColors(originalColors);

    setHasChanges(false);
    setAppliedPalette(null);
    setSelectedColor(null);

    toast.success("Reset to original");
  };

  // Handle download
  const handleDownload = () => {
    if (!svgElement) return;

    if (onDownload) {
      onDownload(svgElement);
    } else {
      const svgString = new XMLSerializer().serializeToString(svgElement);
      const blob = new Blob([svgString], {
        type: "image/svg+xml;charset=utf-8",
      });
      const url = URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = url;
      link.download = filename.replace(/\.(svg|png|jpg|jpeg|webp)$/i, "-edited.svg");
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      URL.revokeObjectURL(url);
      toast.success("SVG downloaded successfully");
    }
  };

  // Handle SVG element click based on active tool
  const handleElementClick = (element: SVGElement, color: string) => {
    if (activeTool === "colorReplace") {
      // Pick color and show color picker dialog
      handleColorEdit(color);
    } else if (activeTool === "eraser") {
      // Background removal - make color transparent
      if (svgElement) {
        replaceSVGColor(svgElement, color, "transparent");
        const updatedColors = extractSVGColors(svgElement);
        setColors(updatedColors);
        setHasChanges(true);
        toast.success("Color removed");
      }
    }
  };

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }

      switch (e.key.toLowerCase()) {
        case "v":
          setActiveTool("select");
          break;
        case "c":
          setActiveTool("colorReplace");
          break;
        case "e":
          setActiveTool("eraser");
          break;
        case "escape":
          setActiveTool("select");
          setSelectedColor(null);
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <div className={cn("flex w-full bg-background", className)} style={{ height: 'calc(100vh - 200px)' }}>
      {/* Main Canvas Area (80%) */}
      <div className="flex-1 relative flex flex-col">
        {/* Top Toolbar */}
        <div className="border-b p-2 flex items-center justify-between bg-muted/30">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium px-2">
              {filename}
            </span>
            {hasChanges && (
              <span className="text-xs text-muted-foreground bg-yellow-500/10 px-2 py-1 rounded">
                Modified
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            {originalImageUrl && (
              <Button
                variant={showComparison ? "default" : "outline"}
                size="sm"
                onClick={() => setShowComparison(!showComparison)}
                className="gap-2"
              >
                <Split className="h-4 w-4" />
                {showComparison ? "Hide" : "Show"} Comparison
              </Button>
            )}
          </div>
        </div>

        {/* Canvas */}
        <div className="flex-1 relative">
          {showComparison && originalImageUrl ? (
            <ComparisonView
              originalImageUrl={originalImageUrl}
              svgUrl={svgUrl}
              onClose={() => setShowComparison(false)}
            />
          ) : (
            <SVGCanvas
              svgElement={svgElement}
              onElementClick={handleElementClick}
              showGrid={true}
              cursor={getCursor()}
            />
          )}
        </div>
      </div>

      {/* Tools Panel (28%) */}
      <ToolsPanel
        activeTool={activeTool}
        onToolChange={setActiveTool}
        colors={colors}
        selectedColor={selectedColor}
        onColorSelect={handleColorSelect}
        onColorEdit={handleColorEdit}
        onColorReduce={(targetColors) => {
          // Implement color reduction logic here
          console.log("Reduce to", targetColors, "colors");
          // This would require implementing a color quantization algorithm
          // For now, just log it
        }}
        appliedReduction={null}
        hasChanges={hasChanges}
        onReset={handleReset}
        onDownload={handleDownload}
        onCopyCode={onCopyCode}
        onConvertAnother={onConvertAnother}
        copiedCode={copiedCode}
        originalFileSize={originalFileSize}
        svgFileSize={svgFileSize}
        originalDimensions={originalDimensions}
        compressionRatio={compressionRatio}
        className="w-[28%] min-w-[320px] flex-shrink-0"
      />

      {/* Color Picker Dialog */}
      <Dialog open={showColorPicker} onOpenChange={setShowColorPicker}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Color</DialogTitle>
            <DialogDescription>
              Choose a new color to replace{" "}
              <span
                className="inline-block w-4 h-4 rounded border align-middle mx-1"
                style={{ backgroundColor: colorToEdit || undefined }}
              />{" "}
              {colorToEdit?.toUpperCase()}
            </DialogDescription>
          </DialogHeader>

          <div className="flex flex-col items-center gap-4 py-4">
            <HexColorPicker color={newColor} onChange={setNewColor} />

            <div className="flex items-center gap-4 w-full">
              <div className="flex-1">
                <div className="text-xs font-medium text-muted-foreground mb-1">
                  Old Color
                </div>
                <div className="flex items-center gap-2">
                  <div
                    className="w-12 h-12 rounded border-2"
                    style={{ backgroundColor: colorToEdit || undefined }}
                  />
                  <span className="font-mono text-sm">
                    {colorToEdit?.toUpperCase()}
                  </span>
                </div>
              </div>

              <div className="flex-1">
                <div className="text-xs font-medium text-muted-foreground mb-1">
                  New Color
                </div>
                <div className="flex items-center gap-2">
                  <div
                    className="w-12 h-12 rounded border-2"
                    style={{ backgroundColor: newColor }}
                  />
                  <span className="font-mono text-sm">
                    {newColor.toUpperCase()}
                  </span>
                </div>
              </div>
            </div>

            <input
              type="text"
              value={newColor}
              onChange={(e) => setNewColor(e.target.value)}
              className="w-full px-3 py-2 border rounded-md font-mono text-sm"
              placeholder="#000000"
            />
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowColorPicker(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleApplyColor}>Apply Color</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
