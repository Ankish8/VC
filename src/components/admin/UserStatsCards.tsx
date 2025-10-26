"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Activity, Calendar, CreditCard, TrendingUp } from "lucide-react";
import { UserDetailStats } from "@/types";
import { Skeleton } from "@/components/ui/skeleton";

interface UserStatsCardsProps {
  stats: UserDetailStats | null;
  isLoading?: boolean;
}

export function UserStatsCards({ stats, isLoading = false }: UserStatsCardsProps) {
  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-4" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-16 mb-2" />
              <Skeleton className="h-3 w-32" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (!stats) {
    return null;
  }

  const formatPlanName = (plan: string | null) => {
    if (!plan) return "Free";
    return plan
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  const creditsPercentage = stats.creditsTotal > 0
    ? Math.round((stats.creditsRemaining / stats.creditsTotal) * 100)
    : 0;

  const getCreditsColor = () => {
    if (creditsPercentage <= 10) return "text-destructive";
    if (creditsPercentage <= 30) return "text-yellow-500";
    return "text-green-500";
  };

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {/* Total Conversions */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Conversions</CardTitle>
          <Activity className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.totalConversions}</div>
          <p className="text-xs text-muted-foreground mt-1">All time</p>
        </CardContent>
      </Card>

      {/* This Month */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">This Month</CardTitle>
          <Calendar className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.thisMonthConversions}</div>
          <p className="text-xs text-muted-foreground mt-1">
            {stats.totalConversions > 0
              ? `${Math.round((stats.thisMonthConversions / stats.totalConversions) * 100)}% of total`
              : "No conversions yet"}
          </p>
        </CardContent>
      </Card>

      {/* Credits Status */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Credits Remaining</CardTitle>
          <CreditCard className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className={`text-2xl font-bold ${getCreditsColor()}`}>
            {stats.creditsTotal === -1 ? "∞" : stats.creditsRemaining}
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            {stats.creditsTotal === -1
              ? "Unlimited (Lifetime)"
              : `of ${stats.creditsTotal} credits`}
          </p>
        </CardContent>
      </Card>

      {/* Subscription Plan */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Subscription</CardTitle>
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold truncate">
            {formatPlanName(stats.subscriptionPlan)}
          </div>
          <p className="text-xs text-muted-foreground mt-1 capitalize">
            {stats.subscriptionStatus}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
