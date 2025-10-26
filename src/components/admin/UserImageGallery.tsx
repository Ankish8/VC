"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { ImageComparisonCard } from "./ImageComparisonCard";
import { Conversion } from "@/types";
import { toast } from "sonner";
import { Images, Filter } from "lucide-react";
import Lightbox from "yet-another-react-lightbox";
import "yet-another-react-lightbox/styles.css";

interface UserImageGalleryProps {
  userId: string;
}

export function UserImageGallery({ userId }: UserImageGalleryProps) {
  const [conversions, setConversions] = useState<Conversion[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  useEffect(() => {
    fetchConversions();
  }, [userId, filter]);

  const fetchConversions = async () => {
    try {
      setIsLoading(true);

      const params = new URLSearchParams();
      if (filter !== "all") {
        params.append("filter", filter);
      }

      const response = await fetch(
        `/api/admin/users/${userId}/conversions?${params.toString()}`
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to fetch conversions");
      }

      const data = await response.json();
      setConversions(data.conversions);
    } catch (error) {
      console.error("Error fetching conversions:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to load images"
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Prepare slides for lightbox (show both original and SVG for each conversion)
  const lightboxSlides = conversions.flatMap((conversion, index) => [
    {
      src: conversion.originalImageUrl,
      alt: `${conversion.originalFilename} (Original)`,
      title: `${conversion.originalFilename} - Original`,
    },
    {
      src: conversion.svgUrl,
      alt: `${conversion.svgFilename} (SVG)`,
      title: `${conversion.svgFilename} - SVG Vector`,
    },
  ]);

  const handleImageClick = (index: number) => {
    setLightboxIndex(index * 2); // Multiply by 2 because we have 2 slides per conversion
    setLightboxOpen(true);
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Image Gallery</CardTitle>
          <CardDescription>Loading images...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="space-y-4">
                <Skeleton className="aspect-video w-full" />
                <Skeleton className="aspect-video w-full" />
                <Skeleton className="h-20 w-full" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Images className="h-5 w-5" />
                Image Gallery
              </CardTitle>
              <CardDescription>
                {conversions.length} conversion{conversions.length !== 1 ? "s" : ""} found
              </CardDescription>
            </div>

            {/* Date Filter */}
            <Select value={filter} onValueChange={setFilter}>
              <SelectTrigger className="w-[180px]">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Filter by date" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Time</SelectItem>
                <SelectItem value="today">Today</SelectItem>
                <SelectItem value="yesterday">Yesterday</SelectItem>
                <SelectItem value="last7days">Last 7 Days</SelectItem>
                <SelectItem value="last30days">Last 30 Days</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          {conversions.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <Images className="h-16 w-16 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No images found</h3>
              <p className="text-sm text-muted-foreground max-w-sm">
                {filter === "all"
                  ? "This user hasn't converted any images yet."
                  : "No conversions found for the selected time period. Try changing the filter."}
              </p>
            </div>
          ) : (
            <div className="grid gap-6 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {conversions.map((conversion, index) => (
                <ImageComparisonCard
                  key={conversion.id}
                  conversion={conversion}
                  onClick={() => handleImageClick(index)}
                />
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Lightbox */}
      <Lightbox
        open={lightboxOpen}
        close={() => setLightboxOpen(false)}
        slides={lightboxSlides}
        index={lightboxIndex}
        on={{
          view: ({ index }) => setLightboxIndex(index),
        }}
        carousel={{
          finite: true,
        }}
        render={{
          buttonPrev: lightboxSlides.length <= 1 ? () => null : undefined,
          buttonNext: lightboxSlides.length <= 1 ? () => null : undefined,
        }}
        styles={{
          container: {
            backgroundColor: "rgba(0, 0, 0, 0.95)",
          },
        }}
      />
    </>
  );
}
