"use client";

import { useState, useEffect, useRef } from "react";
import { HexColorPicker } from "react-colorful";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { ColorPalette } from "./ColorPalette";
import {
  extractSVGColors,
  replaceSVGColor,
  cloneSVGElement,
  ColorInfo,
} from "@/lib/svg-utils";
import { RotateCcw, Download } from "lucide-react";
import { toast } from "sonner";

interface ColorCustomizerProps {
  svgUrl: string;
  originalFilename: string;
  onDownloadModified?: (svgElement: SVGElement) => void;
}

export function ColorCustomizer({
  svgUrl,
  originalFilename,
  onDownloadModified,
}: ColorCustomizerProps) {
  const [colors, setColors] = useState<ColorInfo[]>([]);
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [newColor, setNewColor] = useState<string>("#000000");
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [svgElement, setSvgElement] = useState<SVGElement | null>(null);
  const [originalSvgElement, setOriginalSvgElement] =
    useState<SVGElement | null>(null);
  const [hasChanges, setHasChanges] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

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
        toast.error("Failed to load SVG for color customization");
      }
    };

    loadSVG();
  }, [svgUrl]);

  // Update container with current SVG
  useEffect(() => {
    if (svgElement && containerRef.current) {
      containerRef.current.innerHTML = "";
      containerRef.current.appendChild(svgElement.cloneNode(true));
    }
  }, [svgElement]);

  const handleColorSelect = (color: string) => {
    setSelectedColor(color);
    setNewColor(color);
    setShowColorPicker(true);
  };

  const handleApplyColor = () => {
    if (!selectedColor || !svgElement || selectedColor === newColor) {
      setShowColorPicker(false);
      return;
    }

    // Replace color in SVG
    replaceSVGColor(svgElement, selectedColor, newColor);

    // Re-extract colors to update the palette
    const updatedColors = extractSVGColors(svgElement);
    setColors(updatedColors);

    setHasChanges(true);
    setShowColorPicker(false);
    setSelectedColor(null);

    toast.success("Color updated successfully");
  };

  const handleReset = () => {
    if (!originalSvgElement) return;

    const clonedOriginal = cloneSVGElement(originalSvgElement);
    setSvgElement(clonedOriginal);

    const originalColors = extractSVGColors(clonedOriginal);
    setColors(originalColors);

    setHasChanges(false);
    setSelectedColor(null);

    toast.success("Reset to original colors");
  };

  const handleDownload = () => {
    if (!svgElement) return;

    if (onDownloadModified) {
      onDownloadModified(svgElement);
    } else {
      // Default download behavior
      const svgString = new XMLSerializer().serializeToString(svgElement);
      const blob = new Blob([svgString], {
        type: "image/svg+xml;charset=utf-8",
      });
      const url = URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = url;
      link.download = originalFilename.replace(/\.(svg|png|jpg|jpeg|webp)$/i, "-customized.svg");
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      URL.revokeObjectURL(url);
      toast.success("SVG downloaded successfully");
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">Color Customization</CardTitle>
            <div className="flex gap-2">
              {hasChanges && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleReset}
                  className="gap-2"
                >
                  <RotateCcw className="h-4 w-4" />
                  Reset
                </Button>
              )}
              <Button
                size="sm"
                onClick={handleDownload}
                disabled={!svgElement}
                className="gap-2"
              >
                <Download className="h-4 w-4" />
                Download
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <ColorPalette
            colors={colors}
            selectedColor={selectedColor}
            onColorSelect={handleColorSelect}
          />
        </CardContent>
      </Card>

      {/* Preview */}
      <div
        ref={containerRef}
        className="relative w-full overflow-hidden rounded-xl border-2 bg-muted p-4"
        style={{ minHeight: "400px" }}
      />

      {/* Color Picker Dialog */}
      <Dialog open={showColorPicker} onOpenChange={setShowColorPicker}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Choose New Color</DialogTitle>
            <DialogDescription>
              Replacing{" "}
              <span
                className="inline-block w-4 h-4 rounded border align-middle mx-1"
                style={{ backgroundColor: selectedColor || undefined }}
              />{" "}
              {selectedColor?.toUpperCase()} with a new color
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
                    style={{ backgroundColor: selectedColor || undefined }}
                  />
                  <span className="font-mono text-sm">
                    {selectedColor?.toUpperCase()}
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

            <div className="w-full">
              <label
                htmlFor="hex-input"
                className="text-xs font-medium text-muted-foreground"
              >
                Hex Code
              </label>
              <input
                id="hex-input"
                type="text"
                value={newColor}
                onChange={(e) => setNewColor(e.target.value)}
                className="w-full mt-1 px-3 py-2 border rounded-md font-mono text-sm"
                placeholder="#000000"
              />
            </div>
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
