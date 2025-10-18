"use client";

import { FileImage, TrendingDown, CheckCircle, Activity } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatFileSize } from "@/lib/file-utils";

interface StatsOverviewProps {
  totalConversions: number;
  totalBytesSaved: number;
  successRate: number;
  recentActivityCount: number;
  isLoading?: boolean;
}

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  description?: string;
  badge?: {
    label: string;
    variant?: "default" | "secondary" | "destructive" | "outline";
  };
}

function StatCard({ title, value, icon, description, badge }: StatCardProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <div className="h-4 w-4 text-muted-foreground">{icon}</div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {description && (
          <p className="text-xs text-muted-foreground mt-1">{description}</p>
        )}
        {badge && (
          <Badge variant={badge.variant} className="mt-2">
            {badge.label}
          </Badge>
        )}
      </CardContent>
    </Card>
  );
}

function StatsOverviewSkeleton() {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {[...Array(4)].map((_, i) => (
        <Card key={i}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <div className="h-4 w-24 bg-muted animate-pulse rounded" />
            <div className="h-4 w-4 bg-muted animate-pulse rounded" />
          </CardHeader>
          <CardContent>
            <div className="h-8 w-16 bg-muted animate-pulse rounded mb-1" />
            <div className="h-3 w-32 bg-muted animate-pulse rounded" />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

export function StatsOverview({
  totalConversions,
  totalBytesSaved,
  successRate,
  recentActivityCount,
  isLoading = false,
}: StatsOverviewProps) {
  if (isLoading) {
    return <StatsOverviewSkeleton />;
  }

  // Calculate success rate badge variant
  const getSuccessRateBadge = (rate: number) => {
    if (rate >= 90) {
      return { label: "Excellent", variant: "default" as const };
    } else if (rate >= 70) {
      return { label: "Good", variant: "secondary" as const };
    } else {
      return { label: "Needs Attention", variant: "destructive" as const };
    }
  };

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <StatCard
        title="Total Conversions"
        value={totalConversions}
        icon={<FileImage className="h-4 w-4" />}
        description={
          totalConversions === 0
            ? "No conversions yet"
            : totalConversions === 1
              ? "1 image converted"
              : `${totalConversions} images converted`
        }
      />

      <StatCard
        title="Storage Saved"
        value={formatFileSize(totalBytesSaved)}
        icon={<TrendingDown className="h-4 w-4" />}
        description={
          totalBytesSaved > 0
            ? "Compression savings"
            : "Start converting to save storage"
        }
      />

      <StatCard
        title="Success Rate"
        value={`${successRate}%`}
        icon={<CheckCircle className="h-4 w-4" />}
        description={
          totalConversions > 0
            ? `${Math.round((successRate / 100) * totalConversions)} successful conversions`
            : "No data yet"
        }
        badge={totalConversions > 0 ? getSuccessRateBadge(successRate) : undefined}
      />

      <StatCard
        title="Recent Activity"
        value={recentActivityCount}
        icon={<Activity className="h-4 w-4" />}
        description={
          recentActivityCount === 0
            ? "No recent conversions"
            : recentActivityCount === 1
              ? "1 conversion in last 24h"
              : `${recentActivityCount} conversions in last 24h`
        }
      />
    </div>
  );
}
