"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Upload, Trash2, Loader2, Image as ImageIcon } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface ShowcaseImage {
  id: string;
  rasterImageUrl: string;
  svgUrl: string;
  filename: string;
  displayOrder: number;
}

export function AdminShowcaseManager() {
  const [showcaseImages, setShowcaseImages] = useState<ShowcaseImage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const { toast } = useToast();

  // Fetch showcase images
  const fetchShowcaseImages = useCallback(async () => {
    try {
      const response = await fetch("/api/admin/showcase");
      if (!response.ok) throw new Error("Failed to fetch showcase images");

      const data = await response.json();
      setShowcaseImages(data.showcaseImages || []);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load showcase images",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchShowcaseImages();
  }, [fetchShowcaseImages]);

  // Handle file upload
  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      toast({
        title: "Invalid File",
        description: "Please select an image file",
        variant: "destructive",
      });
      return;
    }

    setIsUploading(true);

    try {
      // Upload file
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/admin/showcase", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Upload failed");
      }

      const data = await response.json();

      toast({
        title: "Success",
        description: `${file.name} uploaded and converted successfully`,
      });

      // Refresh showcase images
      await fetchShowcaseImages();

      // Reset file input
      event.target.value = "";
    } catch (error) {
      const message = error instanceof Error ? error.message : "Upload failed";
      toast({
        title: "Upload Failed",
        description: message,
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  // Handle delete
  const handleDelete = async (id: string, filename: string) => {
    if (!confirm(`Are you sure you want to delete "${filename}"?`)) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/showcase/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) throw new Error("Delete failed");

      toast({
        title: "Deleted",
        description: `${filename} has been removed`,
      });

      // Refresh showcase images
      await fetchShowcaseImages();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete showcase image",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Upload Section */}
      <Card className="p-6">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold">Upload Showcase Image</h2>
              <p className="text-sm text-muted-foreground mt-1">
                Upload a raster image. It will be automatically converted to SVG.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <Input
              type="file"
              accept="image/*"
              onChange={handleFileUpload}
              disabled={isUploading}
              className="max-w-md"
            />
            {isUploading && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
                Uploading and converting...
              </div>
            )}
          </div>
        </div>
      </Card>

      {/* Showcase Images Grid */}
      <Card className="p-6">
        <div className="space-y-4">
          <div>
            <h2 className="text-xl font-semibold">Showcase Images</h2>
            <p className="text-sm text-muted-foreground mt-1">
              {showcaseImages.length} image{showcaseImages.length !== 1 ? "s" : ""} in showcase
            </p>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : showcaseImages.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <ImageIcon className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No showcase images yet</p>
              <p className="text-sm text-muted-foreground mt-1">
                Upload an image above to get started
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {showcaseImages.map((image) => (
                <Card key={image.id} className="overflow-hidden">
                  <div className="aspect-video relative bg-muted">
                    <img
                      src={image.rasterImageUrl}
                      alt={image.filename}
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <div className="p-4 space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0 flex-1">
                        <p className="font-medium truncate" title={image.filename}>
                          {image.filename}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Order: {image.displayOrder + 1}
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-destructive hover:text-destructive hover:bg-destructive/10 shrink-0"
                        onClick={() => handleDelete(image.id, image.filename)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="flex gap-2">
                      <a
                        href={image.rasterImageUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-primary hover:underline"
                      >
                        View Raster
                      </a>
                      <span className="text-xs text-muted-foreground">•</span>
                      <a
                        href={image.svgUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-primary hover:underline"
                      >
                        View SVG
                      </a>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}
