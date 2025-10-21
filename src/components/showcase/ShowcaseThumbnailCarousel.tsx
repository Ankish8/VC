"use client";

import { cn } from "@/lib/utils";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRef, useState, useEffect } from "react";

interface ShowcaseImage {
  id: string;
  rasterImageUrl: string;
  svgUrl: string;
  filename: string;
  displayOrder: number;
}

interface ShowcaseThumbnailCarouselProps {
  images: ShowcaseImage[];
  selectedIndex: number;
  onSelect: (index: number) => void;
}

export function ShowcaseThumbnailCarousel({
  images,
  selectedIndex,
  onSelect,
}: ShowcaseThumbnailCarouselProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const updateScrollButtons = () => {
    if (!scrollContainerRef.current) return;

    const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
    setCanScrollLeft(scrollLeft > 0);
    setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
  };

  useEffect(() => {
    updateScrollButtons();
    const container = scrollContainerRef.current;
    if (container) {
      container.addEventListener("scroll", updateScrollButtons);
      return () => container.removeEventListener("scroll", updateScrollButtons);
    }
  }, [images]);

  const scroll = (direction: "left" | "right") => {
    if (!scrollContainerRef.current) return;

    const scrollAmount = 300;
    const newScrollLeft =
      scrollContainerRef.current.scrollLeft +
      (direction === "left" ? -scrollAmount : scrollAmount);

    scrollContainerRef.current.scrollTo({
      left: newScrollLeft,
      behavior: "smooth",
    });
  };

  if (images.length === 0) {
    return null;
  }

  return (
    <div className="relative px-4">
      {/* Thumbnail Container */}
      <div
        ref={scrollContainerRef}
        className="flex gap-4 overflow-x-auto scrollbar-hide justify-center py-2"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        {images.map((image, index) => (
          <button
            key={image.id}
            onClick={() => onSelect(index)}
            className={cn(
              "relative shrink-0 rounded-lg overflow-hidden transition-all duration-200 cursor-pointer border-2",
              selectedIndex === index
                ? "border-blue-500 opacity-100"
                : "border-gray-300 opacity-70 hover:opacity-100"
            )}
            style={{ width: "120px", height: "120px" }}
          >
            <img
              src={image.rasterImageUrl}
              alt={image.filename}
              className="w-full h-full object-cover"
              loading="eager"
            />
          </button>
        ))}
      </div>
    </div>
  );
}
