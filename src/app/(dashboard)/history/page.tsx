"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import { RefreshCw, History as HistoryIcon, AlertCircle } from "lucide-react";
import { StatsOverview } from "@/components/dashboard/StatsOverview";
import { ConversionHistory } from "@/components/dashboard/ConversionHistory";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Conversion } from "@/types";
import { downloadFile } from "@/lib/file-utils";

interface PaginationMeta {
  page: number;
  limit: number;
  totalCount: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

interface ConversionsResponse {
  conversions: Conversion[];
  pagination: PaginationMeta;
}

interface StatsData {
  totalConversions: number;
  totalBytesSaved: number;
  successRate: number;
  recentActivityCount: number;
}

export default function HistoryPage() {
  const [conversions, setConversions] = useState<Conversion[]>([]);
  const [stats, setStats] = useState<StatsData>({
    totalConversions: 0,
    totalBytesSaved: 0,
    successRate: 0,
    recentActivityCount: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Fetch conversions from API
  const fetchConversions = async (showRefreshingState = false) => {
    try {
      if (showRefreshingState) {
        setIsRefreshing(true);
      } else {
        setIsLoading(true);
      }
      setError(null);

      const response = await fetch("/api/conversions?limit=100");

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to fetch conversions");
      }

      const data: ConversionsResponse = await response.json();
      setConversions(data.conversions);

      // Calculate stats from conversions
      calculateStats(data.conversions);

      if (showRefreshingState) {
        toast.success("Conversions refreshed successfully");
      }
    } catch (error) {
      console.error("Error fetching conversions:", error);
      const errorMessage =
        error instanceof Error ? error.message : "An unknown error occurred";
      setError(errorMessage);
      toast.error("Failed to load conversions");
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  // Calculate statistics from conversions
  const calculateStats = (conversions: Conversion[]) => {
    const totalConversions = conversions.length;

    // Calculate total bytes saved (compression savings)
    const totalBytesSaved = conversions.reduce((total, conversion) => {
      if (conversion.status === "completed") {
        return total + (conversion.originalFileSize - conversion.svgFileSize);
      }
      return total;
    }, 0);

    // Calculate success rate
    const successfulConversions = conversions.filter(
      (c) => c.status === "completed"
    ).length;
    const successRate =
      totalConversions > 0
        ? Math.round((successfulConversions / totalConversions) * 100)
        : 0;

    // Calculate recent activity (last 24 hours)
    const oneDayAgo = new Date();
    oneDayAgo.setHours(oneDayAgo.getHours() - 24);
    const recentActivityCount = conversions.filter((conversion) => {
      const conversionDate = new Date(conversion.createdAt);
      return conversionDate > oneDayAgo;
    }).length;

    setStats({
      totalConversions,
      totalBytesSaved,
      successRate,
      recentActivityCount,
    });
  };

  // Load conversions on mount
  useEffect(() => {
    fetchConversions();
  }, []);

  // Handle conversion deletion
  const handleDelete = async (id: string) => {
    try {
      const response = await fetch(`/api/conversions/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to delete conversion");
      }

      // Remove from local state
      const updatedConversions = conversions.filter((c) => c.id !== id);
      setConversions(updatedConversions);

      // Recalculate stats
      calculateStats(updatedConversions);

      toast.success("Conversion deleted successfully");
    } catch (error) {
      console.error("Error deleting conversion:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Failed to delete conversion";
      toast.error(errorMessage);
    }
  };

  // Handle SVG download
  const handleDownload = async (
    id: string,
    filename: string,
    url: string
  ) => {
    try {
      await downloadFile(url, filename);
      toast.success(`${filename} downloaded successfully`);
    } catch (error) {
      console.error("Error downloading file:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Failed to download file";
      toast.error(errorMessage);
    }
  };

  // Handle refresh
  const handleRefresh = () => {
    fetchConversions(true);
  };

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <HistoryIcon className="h-8 w-8 text-primary" />
            Conversion History
          </h1>
          <p className="text-muted-foreground">
            View and manage all your image conversions
          </p>
        </div>
        <Button
          onClick={handleRefresh}
          disabled={isLoading || isRefreshing}
          variant="outline"
          size="sm"
        >
          <RefreshCw
            className={`h-4 w-4 mr-2 ${isRefreshing ? "animate-spin" : ""}`}
          />
          Refresh
        </Button>
      </div>

      {/* Error Alert */}
      {error && !isLoading && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Stats Overview */}
      <StatsOverview
        totalConversions={stats.totalConversions}
        totalBytesSaved={stats.totalBytesSaved}
        successRate={stats.successRate}
        recentActivityCount={stats.recentActivityCount}
        isLoading={isLoading}
      />

      {/* Conversion History */}
      <ConversionHistory
        conversions={conversions}
        isLoading={isLoading}
        onDelete={handleDelete}
        onDownload={handleDownload}
      />
    </div>
  );
}
