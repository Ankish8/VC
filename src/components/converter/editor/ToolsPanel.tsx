"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  Download,
  RotateCcw,
  Copy,
  RefreshCw,
  CheckCircle2,
  FileImage,
  FileCode,
  TrendingDown,
  Wrench,
  Droplets,
  Info,
} from "lucide-react";
import { ExportDialog, ExportOptions } from "./ExportDialog";
import { exportFile } from "@/lib/export-utils";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { EditorTool } from "./types";
import { ToolSelector } from "./ToolSelector";
import { EnhancedColorPalette } from "./EnhancedColorPalette";
import { ColorReduction } from "./ColorReduction";
import { ColorInfo } from "@/lib/svg-utils";

interface ToolsPanelProps {
  activeTool: EditorTool;
  onToolChange: (tool: EditorTool) => void;
  colors: ColorInfo[];
  selectedColor: string | null;
  onColorSelect: (color: string) => void;
  onColorEdit: (color: string) => void;
  onColorReduce?: (targetColors: number | "original") => void;
  appliedReduction?: number | "original" | null;
  hasChanges: boolean;
  onReset: () => void;
  onDownload: () => void;
  onCopyCode?: () => void;
  onConvertAnother?: () => void;
  copiedCode?: boolean;
  // File info
  originalFileSize?: number;
  svgFileSize?: number;
  originalDimensions?: string;
  compressionRatio?: string;
  svgElement?: SVGElement | null;
  filename?: string;
  className?: string;
}

export function ToolsPanel({
  activeTool,
  onToolChange,
  colors,
  selectedColor,
  onColorSelect,
  onColorEdit,
  onColorReduce,
  appliedReduction,
  hasChanges,
  onReset,
  onDownload,
  onCopyCode,
  onConvertAnother,
  copiedCode,
  originalFileSize,
  svgFileSize,
  originalDimensions,
  compressionRatio,
  svgElement,
  filename = "exported",
  className,
}: ToolsPanelProps) {
  const [activeTab, setActiveTab] = useState("tools");
  const [exportDialogOpen, setExportDialogOpen] = useState(false);

  const handleExport = async (options: ExportOptions) => {
    if (svgElement) {
      await exportFile(svgElement, options);
    } else {
      // Fallback to old download method
      onDownload();
    }
  };

  const formatFileSize = (bytes?: number): string => {
    if (!bytes) return "N/A";
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  return (
    <div className={cn("relative flex flex-col bg-card border-l", className)}>
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2.5 border-b bg-muted/30">
        <h3 className="font-semibold text-sm">Editor Panel</h3>
      </div>

      {/* Tabbed Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
        <TabsList className="grid w-full grid-cols-3 mx-3 mt-2">
          <TabsTrigger value="tools" className="text-xs gap-1" data-tour="tools">
            <Wrench className="h-3 w-3" />
            Tools
          </TabsTrigger>
          <TabsTrigger value="colors" className="text-xs gap-1" data-tour="colors">
            <Droplets className="h-3 w-3" />
            Colors
          </TabsTrigger>
          <TabsTrigger value="info" className="text-xs gap-1">
            <Info className="h-3 w-3" />
            Info
          </TabsTrigger>
        </TabsList>

        {/* Tools Tab */}
        <TabsContent value="tools" className="flex-1 mt-0 data-[state=inactive]:hidden">
          <ScrollArea className="h-full">
            <div className="p-3 space-y-3">
              <ToolSelector
                activeTool={activeTool}
                onToolChange={onToolChange}
              />
            </div>
          </ScrollArea>
        </TabsContent>

        {/* Colors Tab - Combined with Reduction */}
        <TabsContent value="colors" className="flex-1 mt-0 data-[state=inactive]:hidden">
          <ScrollArea className="h-full">
            <div className="p-3 space-y-4">
              {/* Color Reduction Section */}
              {onColorReduce && (
                <>
                  <ColorReduction
                    currentColorCount={colors.length}
                    currentColors={colors}
                    onReduce={onColorReduce}
                    appliedReduction={appliedReduction}
                  />
                  <Separator />
                </>
              )}

              {/* Current Colors Section */}
              <div>
                <h4 className="text-xs font-semibold text-muted-foreground mb-2">
                  Current Colors
                </h4>
                <EnhancedColorPalette
                  colors={colors}
                  selectedColor={selectedColor}
                  onColorSelect={onColorSelect}
                  onColorEdit={onColorEdit}
                />
              </div>
            </div>
          </ScrollArea>
        </TabsContent>

        {/* Info Tab */}
        <TabsContent value="info" className="flex-1 mt-0 data-[state=inactive]:hidden">
          <ScrollArea className="h-full">
            <div className="p-3 space-y-3">
              {/* Compression Ratio */}
              {compressionRatio && (
                <div className="flex items-center justify-center py-2.5 px-3 rounded-lg bg-green-500/10 border border-green-500/20">
                  <TrendingDown className="h-4 w-4 text-green-500 mr-2" />
                  <span className="text-sm font-semibold text-green-700 dark:text-green-400">
                    {compressionRatio}% smaller
                  </span>
                </div>
              )}

              {/* File Sizes */}
              <div className="space-y-2">
                <div className="flex items-start gap-2 p-2.5 rounded-lg bg-muted/50 border">
                  <FileImage className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-medium text-muted-foreground mb-0.5">
                      Original Image
                    </div>
                    <div className="text-base font-bold truncate">
                      {formatFileSize(originalFileSize)}
                    </div>
                    {originalDimensions && (
                      <div className="text-xs text-muted-foreground mt-0.5 truncate">
                        {originalDimensions}
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-start gap-2 p-2.5 rounded-lg bg-muted/50 border">
                  <FileCode className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-medium text-muted-foreground mb-0.5">
                      SVG Output
                    </div>
                    <div className="text-base font-bold truncate">
                      {formatFileSize(svgFileSize)}
                    </div>
                    <div className="text-xs text-muted-foreground mt-0.5">
                      Vector Format
                    </div>
                  </div>
                </div>
              </div>

              {/* Keyboard Shortcuts */}
              <Separator />
              <div className="space-y-2">
                <h4 className="text-xs font-semibold text-muted-foreground">
                  Keyboard Shortcuts
                </h4>
                <div className="space-y-1 text-xs">
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Select</span>
                    <kbd className="px-1.5 py-0.5 bg-muted rounded text-xs font-mono">V</kbd>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Color Picker</span>
                    <kbd className="px-1.5 py-0.5 bg-muted rounded text-xs font-mono">C</kbd>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Eraser</span>
                    <kbd className="px-1.5 py-0.5 bg-muted rounded text-xs font-mono">E</kbd>
                  </div>
                </div>
              </div>
            </div>
          </ScrollArea>
        </TabsContent>
      </Tabs>

      {/* Footer Actions */}
      <div className="border-t p-2.5 space-y-1.5 bg-muted/30">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              className="w-full gap-2 h-9"
              onClick={() => setExportDialogOpen(true)}
              size="sm"
              data-tour="export"
            >
              <Download className="h-3.5 w-3.5" />
              Export
            </Button>
          </TooltipTrigger>
          <TooltipContent side="left">
            <p>Export as SVG, PNG, or PDF</p>
          </TooltipContent>
        </Tooltip>

        {onCopyCode && (
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="outline"
                className="w-full gap-2 h-9"
                onClick={onCopyCode}
                size="sm"
              >
                {copiedCode ? (
                  <>
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    Copied!
                  </>
                ) : (
                  <>
                    <Copy className="h-3.5 w-3.5" />
                    Copy Code
                  </>
                )}
              </Button>
            </TooltipTrigger>
            <TooltipContent side="left">
              <p>Copy SVG code to clipboard</p>
            </TooltipContent>
          </Tooltip>
        )}

        {hasChanges && onReset && (
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="outline"
                className="w-full gap-2 h-9"
                onClick={onReset}
                size="sm"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                Reset
              </Button>
            </TooltipTrigger>
            <TooltipContent side="left">
              <p>Discard all changes and reset to original</p>
            </TooltipContent>
          </Tooltip>
        )}

        {onConvertAnother && (
          <>
            <Separator className="my-1.5" />
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="secondary"
                  className="w-full gap-2 h-9"
                  onClick={onConvertAnother}
                  size="sm"
                >
                  <RefreshCw className="h-3.5 w-3.5" />
                  Convert Another
                </Button>
              </TooltipTrigger>
              <TooltipContent side="left">
                <p>Start a new conversion</p>
              </TooltipContent>
            </Tooltip>
          </>
        )}
      </div>

      {/* Export Dialog */}
      <ExportDialog
        open={exportDialogOpen}
        onOpenChange={setExportDialogOpen}
        onExport={handleExport}
        defaultFilename={filename}
      />
    </div>
  );
}
