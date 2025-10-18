"use client";

import { useState } from "react";
import { Search, Filter, FileX } from "lucide-react";
import { ConversionCard } from "./ConversionCard";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Conversion } from "@/types";

interface ConversionHistoryProps {
  conversions: Conversion[];
  isLoading?: boolean;
  onDelete: (id: string) => void;
  onDownload: (id: string, filename: string, url: string) => void;
}

function ConversionCardSkeleton() {
  return (
    <div className="overflow-hidden rounded-lg border bg-card">
      <Skeleton className="aspect-video w-full" />
      <div className="p-4 space-y-3">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-3 w-1/2" />
        <div className="flex items-center justify-between">
          <Skeleton className="h-3 w-24" />
          <Skeleton className="h-3 w-16" />
        </div>
      </div>
      <div className="p-4 pt-0 flex items-center justify-between">
        <Skeleton className="h-3 w-20" />
        <Skeleton className="h-8 w-8 rounded" />
      </div>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      <div className="rounded-full bg-muted p-6 mb-4">
        <FileX className="h-12 w-12 text-muted-foreground" />
      </div>
      <h3 className="text-lg font-semibold mb-2">No conversions yet</h3>
      <p className="text-sm text-muted-foreground mb-6 max-w-sm">
        Start converting your raster images to SVG format to see them here.
      </p>
      <Button asChild>
        <a href="/convert">Convert Your First Image</a>
      </Button>
    </div>
  );
}

function NoResultsState({ searchQuery }: { searchQuery: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      <div className="rounded-full bg-muted p-6 mb-4">
        <Search className="h-12 w-12 text-muted-foreground" />
      </div>
      <h3 className="text-lg font-semibold mb-2">No results found</h3>
      <p className="text-sm text-muted-foreground mb-2 max-w-sm">
        No conversions match your search for &quot;{searchQuery}&quot;
      </p>
      <p className="text-xs text-muted-foreground">
        Try adjusting your search terms
      </p>
    </div>
  );
}

export function ConversionHistory({
  conversions,
  isLoading = false,
  onDelete,
  onDownload,
}: ConversionHistoryProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");

  // Filter conversions based on search query and status
  const filteredConversions = conversions.filter((conversion) => {
    const matchesSearch =
      searchQuery === "" ||
      conversion.originalFilename
        .toLowerCase()
        .includes(searchQuery.toLowerCase()) ||
      conversion.svgFilename
        .toLowerCase()
        .includes(searchQuery.toLowerCase());

    const matchesFilter =
      filterStatus === "all" || conversion.status === filterStatus;

    return matchesSearch && matchesFilter;
  });

  // Loading state
  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <Skeleton className="h-10 flex-1" />
          <Skeleton className="h-10 w-full sm:w-32" />
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <ConversionCardSkeleton key={i} />
          ))}
        </div>
      </div>
    );
  }

  // Empty state
  if (conversions.length === 0) {
    return <EmptyState />;
  }

  return (
    <div className="space-y-6">
      {/* Search and Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-4">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search by filename..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>

        {/* Filter by Status */}
        <div className="flex gap-2">
          <Button
            variant={filterStatus === "all" ? "default" : "outline"}
            size="sm"
            onClick={() => setFilterStatus("all")}
            className="flex-1 sm:flex-none"
          >
            All
          </Button>
          <Button
            variant={filterStatus === "completed" ? "default" : "outline"}
            size="sm"
            onClick={() => setFilterStatus("completed")}
            className="flex-1 sm:flex-none"
          >
            Completed
          </Button>
          <Button
            variant={filterStatus === "failed" ? "default" : "outline"}
            size="sm"
            onClick={() => setFilterStatus("failed")}
            className="flex-1 sm:flex-none"
          >
            Failed
          </Button>
        </div>
      </div>

      {/* Results Count */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {filteredConversions.length === conversions.length ? (
            <>
              Showing {conversions.length}{" "}
              {conversions.length === 1 ? "conversion" : "conversions"}
            </>
          ) : (
            <>
              Showing {filteredConversions.length} of {conversions.length}{" "}
              conversions
            </>
          )}
        </p>
        {searchQuery && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSearchQuery("")}
          >
            Clear search
          </Button>
        )}
      </div>

      {/* Conversions Grid or No Results */}
      {filteredConversions.length === 0 ? (
        <NoResultsState searchQuery={searchQuery} />
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredConversions.map((conversion) => (
            <ConversionCard
              key={conversion.id}
              conversion={conversion}
              onDelete={onDelete}
              onDownload={onDownload}
            />
          ))}
        </div>
      )}
    </div>
  );
}
