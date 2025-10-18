"use client";

import { useRef, useState } from "react";
import { TransformWrapper, TransformComponent } from "react-zoom-pan-pinch";
import { Button } from "@/components/ui/button";
import { ZoomIn, ZoomOut, Maximize2, RotateCcw } from "lucide-react";
import { cn } from "@/lib/utils";
import { SVGCanvasSkeleton } from "./SVGCanvasSkeleton";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface SVGCanvasProps {
  svgElement: SVGElement | null;
  className?: string;
  onElementClick?: (element: SVGElement, color: string) => void;
  showGrid?: boolean;
  cursor?: string;
  isLoading?: boolean;
  loadingMessage?: string;
}

export function SVGCanvas({
  svgElement,
  className,
  onElementClick,
  showGrid = false,
  cursor = "default",
  isLoading = false,
  loadingMessage,
}: SVGCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [zoom, setZoom] = useState(1);

  const handleSvgClick = (event: React.MouseEvent<HTMLDivElement>) => {
    if (!onElementClick || !svgElement) return;

    const target = event.target as SVGElement;
    if (target.tagName !== "svg") {
      const fill = target.getAttribute("fill") ||
                   window.getComputedStyle(target).fill;
      const stroke = target.getAttribute("stroke") ||
                     window.getComputedStyle(target).stroke;

      const color = fill !== "none" ? fill : stroke;
      if (color && color !== "none") {
        onElementClick(target, color);
      }
    }
  };

  // Show skeleton while loading
  if (isLoading) {
    return <SVGCanvasSkeleton className={className} message={loadingMessage} />;
  }

  return (
    <div className={cn("relative w-full h-full bg-muted/30", className)}>
      <TransformWrapper
        initialScale={1}
        minScale={1}
        maxScale={5}
        wheel={{ step: 0.1 }}
        onZoom={(ref) => setZoom(ref.state.scale)}
      >
        {({ zoomIn, zoomOut, resetTransform, centerView }) => (
          <>
            {/* Zoom Controls */}
            <div className="absolute top-4 right-4 z-10 flex flex-col gap-1 bg-background/95 border rounded-lg p-1 shadow-lg">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => zoomIn()}
                    className="h-8 w-8"
                  >
                    <ZoomIn className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="left">
                  <p>Zoom In (+)</p>
                </TooltipContent>
              </Tooltip>

              <div className="px-2 py-1 text-xs font-medium text-center">
                {Math.round(zoom * 100)}%
              </div>

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => zoomOut()}
                    className="h-8 w-8"
                  >
                    <ZoomOut className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="left">
                  <p>Zoom Out (-)</p>
                </TooltipContent>
              </Tooltip>

              <div className="h-px bg-border my-1" />

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => {
                      resetTransform();
                      centerView();
                    }}
                    className="h-8 w-8"
                  >
                    <RotateCcw className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="left">
                  <p>Reset View (0)</p>
                </TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => centerView(1)}
                    className="h-8 w-8"
                  >
                    <Maximize2 className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="left">
                  <p>Fit to Screen</p>
                </TooltipContent>
              </Tooltip>
            </div>

            {/* Canvas */}
            <TransformComponent
              wrapperClass="!w-full !h-full"
              contentClass="!w-full !h-full flex items-center justify-center"
            >
              <div
                ref={containerRef}
                onClick={handleSvgClick}
                className={cn(
                  "relative inline-block max-w-full max-h-full",
                  showGrid && "bg-[linear-gradient(rgba(0,0,0,.05)_1px,transparent_1px),linear-gradient(90deg,rgba(0,0,0,.05)_1px,transparent_1px)] bg-[size:20px_20px]"
                )}
                style={{ cursor }}
                dangerouslySetInnerHTML={{
                  __html: svgElement?.outerHTML || "",
                }}
              />
            </TransformComponent>
          </>
        )}
      </TransformWrapper>

      {/* Instructions */}
      {!svgElement && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center text-muted-foreground">
            <p className="text-lg font-medium">No SVG loaded</p>
            <p className="text-sm">Upload and convert an image to get started</p>
          </div>
        </div>
      )}
    </div>
  );
}
