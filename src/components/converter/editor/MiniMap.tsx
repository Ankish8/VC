"use client";

import { useRef, useEffect, useState } from "react";
import { cn } from "@/lib/utils";

interface MiniMapProps {
  svgElement: SVGElement | null;
  viewport: {
    x: number;
    y: number;
    width: number;
    height: number;
    scale: number;
  };
  onViewportChange?: (x: number, y: number) => void;
  className?: string;
}

export function MiniMap({
  svgElement,
  viewport,
  onViewportChange,
  className,
}: MiniMapProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    if (!svgElement || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw SVG thumbnail
    const svgString = new XMLSerializer().serializeToString(svgElement);
    const img = new Image();
    const blob = new Blob([svgString], { type: "image/svg+xml" });
    const url = URL.createObjectURL(blob);

    img.onload = () => {
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

      // Draw viewport rectangle
      const viewportRect = {
        x: (viewport.x / viewport.width) * canvas.width,
        y: (viewport.y / viewport.height) * canvas.height,
        width: (canvas.width / viewport.scale),
        height: (canvas.height / viewport.scale),
      };

      ctx.strokeStyle = "#3b82f6";
      ctx.lineWidth = 2;
      ctx.strokeRect(
        viewportRect.x,
        viewportRect.y,
        viewportRect.width,
        viewportRect.height
      );

      ctx.fillStyle = "rgba(59, 130, 246, 0.1)";
      ctx.fillRect(
        viewportRect.x,
        viewportRect.y,
        viewportRect.width,
        viewportRect.height
      );

      URL.revokeObjectURL(url);
    };

    img.src = url;
  }, [svgElement, viewport]);

  const handleClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!canvasRef.current || !onViewportChange) return;

    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * viewport.width;
    const y = ((e.clientY - rect.top) / rect.height) * viewport.height;

    onViewportChange(x, y);
  };

  if (!svgElement) return null;

  return (
    <div
      className={cn(
        "absolute bottom-4 left-4 z-10 bg-background/95 backdrop-blur border-2 rounded-lg shadow-lg overflow-hidden",
        className
      )}
    >
      <div className="px-2 py-1 bg-muted/50 border-b">
        <span className="text-xs font-medium">Navigator</span>
      </div>
      <canvas
        ref={canvasRef}
        width={200}
        height={150}
        className="cursor-pointer hover:opacity-90 transition-opacity"
        onClick={handleClick}
        onMouseDown={() => setIsDragging(true)}
        onMouseUp={() => setIsDragging(false)}
        onMouseLeave={() => setIsDragging(false)}
        title="Click to navigate"
      />
    </div>
  );
}
