"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Split, Undo2, Redo2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { EditorTool } from "./types";
import { SVGCanvas } from "./SVGCanvas";
import { ToolsPanel } from "./ToolsPanel";
import { ComparisonView } from "./ComparisonView";
import { MiniMap } from "./MiniMap";
import { ColorHarmonies } from "./ColorHarmonies";
import { RecentColorsGrid } from "./RecentColorsGrid";
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
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  extractSVGColors,
  replaceSVGColor,
  cloneSVGElement,
  ColorInfo,
} from "@/lib/svg-utils";
import { ColorPaletteOption } from "@/lib/color-palettes";
import { useHistory } from "@/hooks/useHistory";
import { useKeyboardShortcuts } from "@/hooks/useKeyboardShortcuts";
import { useRecentColors } from "@/hooks/useRecentColors";
import { useOnboarding } from "@/hooks/useOnboarding";
import { OnboardingTour, TourStep } from "./OnboardingTour";

// State that should be tracked in history
interface EditorHistoryState {
  svgString: string; // Serialized SVG for immutability
  colors: ColorInfo[];
}

// Serialize SVG to string for storage
function serializeSVG(element: SVGElement | null): string {
  if (!element) return "";
  return new XMLSerializer().serializeToString(element);
}

// Deserialize string back to SVG element
function deserializeSVG(svgString: string): SVGElement | null {
  if (!svgString) return null;
  const parser = new DOMParser();
  const doc = parser.parseFromString(svgString, "image/svg+xml");
  return doc.querySelector("svg");
}

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
  // History management for undo/redo
  const history = useHistory<EditorHistoryState>({
    svgString: "",
    colors: [],
  });

  // Recent colors tracking
  const { recentColors, addRecentColor } = useRecentColors();

  // Onboarding tour
  const {
    isTourOpen,
    completeOnboarding,
    skipOnboarding,
    closeTour,
  } = useOnboarding();

  // Editor state
  const [activeTool, setActiveTool] = useState<EditorTool>("select");
  const [originalSvgElement, setOriginalSvgElement] = useState<SVGElement | null>(null);
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [appliedPalette, setAppliedPalette] = useState<string | null>(null);

  // UI state
  const [showComparison, setShowComparison] = useState(false);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [newColor, setNewColor] = useState<string>("#000000");
  const [colorToEdit, setColorToEdit] = useState<string | null>(null);
  const [isLoadingSVG, setIsLoadingSVG] = useState(true);

  // Derived from history
  const svgElement = deserializeSVG(history.state.svgString);
  const colors = history.state.colors;
  const hasChanges = history.canUndo;

  // Helper to push new state to history
  const updateSVGState = useCallback(
    (newElement: SVGElement) => {
      const newColors = extractSVGColors(newElement);
      history.pushState({
        svgString: serializeSVG(newElement),
        colors: newColors,
      });
    },
    [history]
  );

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
      setIsLoadingSVG(true);
      try {
        const response = await fetch(svgUrl);
        const svgText = await response.text();

        const parser = new DOMParser();
        const doc = parser.parseFromString(svgText, "image/svg+xml");
        const svg = doc.querySelector("svg");

        if (svg) {
          const clonedSvg = cloneSVGElement(svg);
          setOriginalSvgElement(cloneSVGElement(svg));

          // Initialize history with loaded SVG
          const initialColors = extractSVGColors(clonedSvg);
          history.reset({
            svgString: serializeSVG(clonedSvg),
            colors: initialColors,
          });
        }
      } catch (error) {
        console.error("Failed to load SVG:", error);
        toast.error("Failed to load SVG");
      } finally {
        setIsLoadingSVG(false);
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
    console.log("Apply color - Old:", colorToEdit, "New:", newColor, "SVG exists:", !!svgElement);

    if (!colorToEdit || !svgElement || colorToEdit === newColor) {
      console.log("Skipping color change - conditions not met");
      setShowColorPicker(false);
      return;
    }

    console.log("Replacing color in SVG...");
    // Clone element to avoid mutating history
    const newElement = cloneSVGElement(svgElement);
    replaceSVGColor(newElement, colorToEdit, newColor);

    console.log("Updating SVG state...");
    // Push to history
    updateSVGState(newElement);

    // Add to recent colors
    addRecentColor(newColor);

    setShowColorPicker(false);
    setColorToEdit(null);

    toast.success("Color updated successfully");
  };

  // Apply palette
  const handleApplyPalette = (palette: ColorPaletteOption) => {
    if (!svgElement || colors.length === 0) return;

    // Clone element to avoid mutating history
    const newElement = cloneSVGElement(svgElement);

    // Map current colors to palette colors
    const sortedColors = [...colors].sort((a, b) => b.count - a.count);
    const paletteColors = palette.colors.slice(0, sortedColors.length);

    sortedColors.forEach((colorInfo, index) => {
      if (index < paletteColors.length) {
        replaceSVGColor(newElement, colorInfo.color, paletteColors[index]);
      }
    });

    // Push to history
    updateSVGState(newElement);
    setAppliedPalette(palette.name);

    toast.success(`Applied ${palette.name} palette`);
  };

  // Reset changes
  const handleReset = () => {
    if (!originalSvgElement) return;

    const clonedOriginal = cloneSVGElement(originalSvgElement);

    // Reset history to original
    const originalColors = extractSVGColors(clonedOriginal);
    history.reset({
      svgString: serializeSVG(clonedOriginal),
      colors: originalColors,
    });

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
    console.log("Element clicked - Tool:", activeTool, "Color:", color);

    if (activeTool === "colorReplace") {
      // Pick color and show color picker dialog
      console.log("Opening color picker for color:", color);
      handleColorEdit(color);
    } else if (activeTool === "eraser") {
      // Background removal - make color transparent
      if (svgElement) {
        const newElement = cloneSVGElement(svgElement);
        replaceSVGColor(newElement, color, "transparent");
        updateSVGState(newElement);
        toast.success("Color removed");
      }
    }
  };

  // Define tour steps
  const tourSteps: TourStep[] = [
    {
      target: "[data-tour='canvas']",
      title: "SVG Canvas",
      description: "This is your main editing area. Click on colors in the SVG to select and edit them. Use the mouse wheel to zoom in and out, and drag to pan.",
      placement: "right",
    },
    {
      target: "[data-tour='tools']",
      title: "Editor Tools",
      description: "Switch between different editing tools: Select tool for navigation, Color Picker to replace colors, and Eraser to remove elements.",
      placement: "left",
    },
    {
      target: "[data-tour='colors']",
      title: "Color Palette",
      description: "View all colors used in your SVG. Click any color to select it, then use the Color Picker tool to replace it with a new color.",
      placement: "left",
    },
    {
      target: "[data-tour='export']",
      title: "Export Options",
      description: "Export your edited SVG in multiple formats (SVG, PNG, PDF) with customizable quality and optimization settings.",
      placement: "left",
    },
    {
      target: "[data-tour='undo-redo']",
      title: "Undo/Redo",
      description: "Made a mistake? Use these buttons or press Ctrl+Z to undo and Ctrl+Shift+Z to redo your changes.",
      placement: "bottom",
    },
  ];

  // Undo/redo keyboard shortcuts
  useKeyboardShortcuts([
    {
      key: "z",
      ctrl: true,
      handler: () => {
        if (history.canUndo) {
          history.undo();
          toast.success("Undone");
        }
      },
      description: "Undo",
    },
    {
      key: "z",
      ctrl: true,
      shift: true,
      handler: () => {
        if (history.canRedo) {
          history.redo();
          toast.success("Redone");
        }
      },
      description: "Redo",
    },
  ]);

  // Tool keyboard shortcuts
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
    <TooltipProvider>
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
            {/* Undo/Redo Buttons */}
            <div className="flex items-center gap-1 mr-2" data-tour="undo-redo">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      history.undo();
                      toast.success("Undone");
                    }}
                    disabled={!history.canUndo}
                    className="h-8 w-8 p-0"
                  >
                    <Undo2 className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Undo (Cmd+Z)</p>
                </TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      history.redo();
                      toast.success("Redone");
                    }}
                    disabled={!history.canRedo}
                    className="h-8 w-8 p-0"
                  >
                    <Redo2 className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Redo (Cmd+Shift+Z)</p>
                </TooltipContent>
              </Tooltip>
            </div>

            {originalImageUrl && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant={showComparison ? "default" : "outline"}
                    size="sm"
                    onClick={() => setShowComparison(!showComparison)}
                    className="gap-2"
                  >
                    <Split className="h-4 w-4" />
                    {showComparison ? "Hide" : "Show"} Comparison
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Compare original image with SVG side-by-side</p>
                </TooltipContent>
              </Tooltip>
            )}
          </div>
        </div>

        {/* Canvas */}
        <div className="flex-1 relative" data-tour="canvas">
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
              isLoading={isLoadingSVG}
              loadingMessage="Loading SVG editor..."
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
        svgElement={svgElement}
        filename={filename.replace(/\.[^/.]+$/, "")} // Remove extension
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

            {/* Recent Colors */}
            <RecentColorsGrid
              colors={recentColors}
              selectedColor={newColor}
              onColorSelect={setNewColor}
              columns={6}
            />

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

            {/* Color Harmonies */}
            <ColorHarmonies
              baseColor={colorToEdit || newColor}
              onColorSelect={setNewColor}
              selectedColor={newColor}
              className="w-full"
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

      {/* Onboarding Tour */}
      <OnboardingTour
        steps={tourSteps}
        isOpen={isTourOpen}
        onClose={closeTour}
        onComplete={completeOnboarding}
        onSkip={skipOnboarding}
      />
    </div>
  </TooltipProvider>
);
}
