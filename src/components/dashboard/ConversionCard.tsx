"use client";

import { useState } from "react";
import { formatDistanceToNow } from "date-fns";
import {
  MoreVertical,
  Download,
  Trash,
  Eye,
  Calendar,
  FileImage,
  TrendingDown,
} from "lucide-react";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Conversion, ConversionStatus } from "@/types";
import { formatFileSize } from "@/lib/file-utils";
import Image from "next/image";

interface ConversionCardProps {
  conversion: Conversion;
  onDelete: (id: string) => void;
  onDownload: (id: string, filename: string, url: string) => void;
}

// Status badge variants
const statusConfig: Record<
  ConversionStatus,
  { label: string; variant: "default" | "secondary" | "destructive" | "outline" }
> = {
  completed: { label: "Completed", variant: "default" },
  processing: { label: "Processing", variant: "secondary" },
  pending: { label: "Pending", variant: "outline" },
  failed: { label: "Failed", variant: "destructive" },
};

export function ConversionCard({
  conversion,
  onDelete,
  onDownload,
}: ConversionCardProps) {
  const [showPreview, setShowPreview] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Calculate compression ratio
  const compressionRatio =
    conversion.originalFileSize > 0
      ? (
          ((conversion.originalFileSize - conversion.svgFileSize) /
            conversion.originalFileSize) *
          100
        ).toFixed(1)
      : "0";

  // Format relative time
  const relativeTime = formatDistanceToNow(new Date(conversion.createdAt), {
    addSuffix: true,
  });

  // Handle delete with confirmation
  const handleDeleteClick = () => {
    setShowDeleteConfirm(true);
  };

  const handleConfirmDelete = () => {
    onDelete(conversion.id);
    setShowDeleteConfirm(false);
  };

  // Handle download
  const handleDownload = () => {
    onDownload(conversion.id, conversion.svgFilename, conversion.svgUrl);
  };

  // Get status config
  const status = statusConfig[conversion.status];

  return (
    <>
      <Card className="overflow-hidden hover:shadow-md transition-shadow duration-200">
        <CardContent className="p-0">
          {/* Thumbnail */}
          <div className="relative aspect-video bg-muted overflow-hidden group">
            {conversion.originalImageUrl ? (
              <Image
                src={conversion.originalImageUrl}
                alt={conversion.originalFilename}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              />
            ) : (
              <div className="flex items-center justify-center h-full">
                <FileImage className="h-12 w-12 text-muted-foreground" />
              </div>
            )}

            {/* Overlay on hover */}
            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center gap-2">
              <Button
                size="sm"
                variant="secondary"
                onClick={() => setShowPreview(true)}
                disabled={conversion.status !== "completed"}
              >
                <Eye className="h-4 w-4 mr-1" />
                Preview
              </Button>
            </div>

            {/* Status Badge */}
            <div className="absolute top-2 right-2">
              <Badge variant={status.variant}>{status.label}</Badge>
            </div>
          </div>

          {/* Content */}
          <div className="p-4 space-y-3">
            {/* Filenames */}
            <div className="space-y-1">
              <p className="text-sm font-medium truncate" title={conversion.originalFilename}>
                {conversion.originalFilename}
              </p>
              {conversion.svgFilename && (
                <p className="text-xs text-muted-foreground truncate" title={conversion.svgFilename}>
                  {conversion.svgFilename}
                </p>
              )}
            </div>

            {/* File Stats */}
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <div className="flex items-center gap-1">
                <FileImage className="h-3 w-3" />
                <span>{formatFileSize(conversion.originalFileSize)}</span>
                <span>→</span>
                <span>{formatFileSize(conversion.svgFileSize)}</span>
              </div>
              {conversion.status === "completed" && (
                <div className="flex items-center gap-1 text-green-600 dark:text-green-400">
                  <TrendingDown className="h-3 w-3" />
                  <span>{compressionRatio}%</span>
                </div>
              )}
            </div>

            {/* Dimensions */}
            {conversion.originalDimensions && (
              <div className="text-xs text-muted-foreground">
                {conversion.originalDimensions}
              </div>
            )}

            {/* Error Message */}
            {conversion.status === "failed" && conversion.errorMessage && (
              <div className="text-xs text-destructive bg-destructive/10 p-2 rounded">
                {conversion.errorMessage}
              </div>
            )}
          </div>
        </CardContent>

        <CardFooter className="p-4 pt-0 flex items-center justify-between">
          {/* Date */}
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Calendar className="h-3 w-3" />
            <span>{relativeTime}</span>
          </div>

          {/* Actions */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <MoreVertical className="h-4 w-4" />
                <span className="sr-only">Open menu</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                onClick={() => setShowPreview(true)}
                disabled={conversion.status !== "completed"}
              >
                <Eye className="h-4 w-4 mr-2" />
                View Details
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={handleDownload}
                disabled={conversion.status !== "completed"}
              >
                <Download className="h-4 w-4 mr-2" />
                Download SVG
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={handleDeleteClick}
                className="text-destructive focus:text-destructive"
              >
                <Trash className="h-4 w-4 mr-2" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </CardFooter>
      </Card>

      {/* Preview Dialog */}
      <Dialog open={showPreview} onOpenChange={setShowPreview}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Conversion Details</DialogTitle>
            <DialogDescription>
              View the original and converted SVG images
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            {/* Original Image */}
            <div className="space-y-2">
              <h3 className="text-sm font-medium">Original Image</h3>
              <div className="relative aspect-video bg-muted rounded-lg overflow-hidden">
                {conversion.originalImageUrl && (
                  <Image
                    src={conversion.originalImageUrl}
                    alt={conversion.originalFilename}
                    fill
                    className="object-contain"
                    sizes="(max-width: 1200px) 100vw, 1200px"
                  />
                )}
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">
                  {conversion.originalFilename}
                </span>
                <span className="text-muted-foreground">
                  {formatFileSize(conversion.originalFileSize)}
                </span>
              </div>
            </div>

            {/* SVG Image */}
            {conversion.status === "completed" && conversion.svgUrl && (
              <div className="space-y-2">
                <h3 className="text-sm font-medium">SVG Output</h3>
                <div className="relative aspect-video bg-muted rounded-lg overflow-hidden">
                  <Image
                    src={conversion.svgUrl}
                    alt={conversion.svgFilename}
                    fill
                    className="object-contain"
                    sizes="(max-width: 1200px) 100vw, 1200px"
                  />
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">
                    {conversion.svgFilename}
                  </span>
                  <span className="text-muted-foreground">
                    {formatFileSize(conversion.svgFileSize)}
                  </span>
                </div>
              </div>
            )}

            {/* Stats */}
            <div className="grid grid-cols-2 gap-4 p-4 bg-muted rounded-lg">
              <div>
                <p className="text-sm text-muted-foreground">Compression Ratio</p>
                <p className="text-lg font-semibold text-green-600 dark:text-green-400">
                  {compressionRatio}%
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Dimensions</p>
                <p className="text-lg font-semibold">
                  {conversion.originalDimensions || "N/A"}
                </p>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-2">
              <Button onClick={handleDownload} className="flex-1">
                <Download className="h-4 w-4 mr-2" />
                Download SVG
              </Button>
              <Button
                variant="outline"
                onClick={() => setShowPreview(false)}
                className="flex-1"
              >
                Close
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Conversion</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this conversion? This action cannot
              be undone and will remove both the original and SVG files.
            </DialogDescription>
          </DialogHeader>
          <div className="flex gap-2 justify-end">
            <Button
              variant="outline"
              onClick={() => setShowDeleteConfirm(false)}
            >
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleConfirmDelete}>
              <Trash className="h-4 w-4 mr-2" />
              Delete
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
