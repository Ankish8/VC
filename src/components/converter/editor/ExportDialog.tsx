"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import { Download, FileImage, FileCode, FileType } from "lucide-react";
import { toast } from "sonner";

export type ExportFormat = "svg" | "png" | "pdf";

export interface ExportOptions {
  format: ExportFormat;
  filename: string;
  // SVG-specific options
  svgOptimize?: boolean;
  svgPrecision?: number;
  // PNG-specific options
  pngScale?: number;
  pngQuality?: number;
  // PDF-specific options
  pdfPageSize?: "A4" | "Letter" | "Custom";
  pdfOrientation?: "portrait" | "landscape";
}

interface ExportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onExport: (options: ExportOptions) => void;
  defaultFilename: string;
}

export function ExportDialog({
  open,
  onOpenChange,
  onExport,
  defaultFilename,
}: ExportDialogProps) {
  const [format, setFormat] = useState<ExportFormat>("svg");
  const [filename, setFilename] = useState(defaultFilename);

  // SVG options
  const [svgOptimize, setSvgOptimize] = useState(true);
  const [svgPrecision, setSvgPrecision] = useState(2);

  // PNG options
  const [pngScale, setPngScale] = useState(2);
  const [pngQuality, setPngQuality] = useState(95);

  // PDF options
  const [pdfPageSize, setPdfPageSize] = useState<"A4" | "Letter" | "Custom">("A4");
  const [pdfOrientation, setPdfOrientation] = useState<"portrait" | "landscape">("portrait");

  const handleExport = () => {
    // Validate filename
    if (!filename.trim()) {
      toast.error("Please enter a filename");
      return;
    }

    // Build export options
    const options: ExportOptions = {
      format,
      filename: filename.trim(),
    };

    // Add format-specific options
    if (format === "svg") {
      options.svgOptimize = svgOptimize;
      options.svgPrecision = svgPrecision;
    } else if (format === "png") {
      options.pngScale = pngScale;
      options.pngQuality = pngQuality;
    } else if (format === "pdf") {
      options.pdfPageSize = pdfPageSize;
      options.pdfOrientation = pdfOrientation;
    }

    onExport(options);
    onOpenChange(false);
  };

  const getFileExtension = () => {
    switch (format) {
      case "svg":
        return ".svg";
      case "png":
        return ".png";
      case "pdf":
        return ".pdf";
      default:
        return "";
    }
  };

  const getFormatIcon = () => {
    switch (format) {
      case "svg":
        return <FileCode className="h-5 w-5" />;
      case "png":
        return <FileImage className="h-5 w-5" />;
      case "pdf":
        return <FileType className="h-5 w-5" />;
      default:
        return <Download className="h-5 w-5" />;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {getFormatIcon()}
            Export File
          </DialogTitle>
          <DialogDescription>
            Choose your export format and customize options
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Format Selection */}
          <div className="space-y-2">
            <Label htmlFor="format">Export Format</Label>
            <Select
              value={format}
              onValueChange={(value) => setFormat(value as ExportFormat)}
            >
              <SelectTrigger id="format">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="svg">
                  <div className="flex items-center gap-2">
                    <FileCode className="h-4 w-4" />
                    <div>
                      <div className="font-medium">SVG</div>
                      <div className="text-xs text-muted-foreground">
                        Vector format, scalable
                      </div>
                    </div>
                  </div>
                </SelectItem>
                <SelectItem value="png">
                  <div className="flex items-center gap-2">
                    <FileImage className="h-4 w-4" />
                    <div>
                      <div className="font-medium">PNG</div>
                      <div className="text-xs text-muted-foreground">
                        Raster format, high quality
                      </div>
                    </div>
                  </div>
                </SelectItem>
                <SelectItem value="pdf">
                  <div className="flex items-center gap-2">
                    <FileType className="h-4 w-4" />
                    <div>
                      <div className="font-medium">PDF</div>
                      <div className="text-xs text-muted-foreground">
                        Document format, printable
                      </div>
                    </div>
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Filename */}
          <div className="space-y-2">
            <Label htmlFor="filename">Filename</Label>
            <div className="flex gap-2">
              <Input
                id="filename"
                value={filename}
                onChange={(e) => setFilename(e.target.value)}
                placeholder="Enter filename"
                className="flex-1"
              />
              <div className="flex items-center px-3 border rounded-md bg-muted text-sm text-muted-foreground">
                {getFileExtension()}
              </div>
            </div>
          </div>

          {/* Format-specific options */}
          {format === "svg" && (
            <div className="space-y-3 pt-2 border-t">
              <h4 className="text-sm font-medium">SVG Options</h4>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="optimize"
                  checked={svgOptimize}
                  onCheckedChange={(checked) => setSvgOptimize(checked as boolean)}
                />
                <Label htmlFor="optimize" className="text-sm font-normal cursor-pointer">
                  Optimize SVG (reduce file size)
                </Label>
              </div>

              <div className="space-y-2">
                <Label htmlFor="precision" className="text-sm">
                  Decimal Precision: {svgPrecision}
                </Label>
                <Slider
                  id="precision"
                  min={0}
                  max={5}
                  step={1}
                  value={[svgPrecision]}
                  onValueChange={([value]) => setSvgPrecision(value)}
                  className="w-full"
                />
                <p className="text-xs text-muted-foreground">
                  Higher precision = larger file size but more accurate
                </p>
              </div>
            </div>
          )}

          {format === "png" && (
            <div className="space-y-3 pt-2 border-t">
              <h4 className="text-sm font-medium">PNG Options</h4>

              <div className="space-y-2">
                <Label htmlFor="scale" className="text-sm">
                  Scale: {pngScale}x
                </Label>
                <Slider
                  id="scale"
                  min={1}
                  max={4}
                  step={0.5}
                  value={[pngScale]}
                  onValueChange={([value]) => setPngScale(value)}
                  className="w-full"
                />
                <p className="text-xs text-muted-foreground">
                  Higher scale = larger image and file size
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="quality" className="text-sm">
                  Quality: {pngQuality}%
                </Label>
                <Slider
                  id="quality"
                  min={60}
                  max={100}
                  step={5}
                  value={[pngQuality]}
                  onValueChange={([value]) => setPngQuality(value)}
                  className="w-full"
                />
                <p className="text-xs text-muted-foreground">
                  Higher quality = larger file size
                </p>
              </div>
            </div>
          )}

          {format === "pdf" && (
            <div className="space-y-3 pt-2 border-t">
              <h4 className="text-sm font-medium">PDF Options</h4>

              <div className="space-y-2">
                <Label htmlFor="pageSize">Page Size</Label>
                <Select
                  value={pdfPageSize}
                  onValueChange={(value) => setPdfPageSize(value as "A4" | "Letter" | "Custom")}
                >
                  <SelectTrigger id="pageSize">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="A4">A4 (210 × 297 mm)</SelectItem>
                    <SelectItem value="Letter">Letter (8.5 × 11 in)</SelectItem>
                    <SelectItem value="Custom">Custom (fit to content)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="orientation">Orientation</Label>
                <Select
                  value={pdfOrientation}
                  onValueChange={(value) => setPdfOrientation(value as "portrait" | "landscape")}
                >
                  <SelectTrigger id="orientation">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="portrait">Portrait</SelectItem>
                    <SelectItem value="landscape">Landscape</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleExport} className="gap-2">
            <Download className="h-4 w-4" />
            Export {format.toUpperCase()}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
