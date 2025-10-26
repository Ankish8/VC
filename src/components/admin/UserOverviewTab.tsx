"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { UserStatsCards } from "./UserStatsCards";
import { UserDetailStats } from "@/types";
import { Calendar, CreditCard, Mail, User2, Clock } from "lucide-react";
import { format } from "date-fns";

interface UserOverviewTabProps {
  user: {
    id: string;
    email: string;
    name: string | null;
    createdAt: Date;
    subscriptionType: string;
    subscriptionStatus: string;
    subscriptionPlan: string | null;
    subscriptionStartedAt: Date | null;
    subscriptionEndsAt: Date | null;
    creditsRemaining: number;
    creditsTotal: number;
    creditsResetDate: Date | null;
  };
  stats: UserDetailStats | null;
  isLoading?: boolean;
}

export function UserOverviewTab({ user, stats, isLoading = false }: UserOverviewTabProps) {
  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <UserStatsCards stats={stats} isLoading={isLoading} />

      {/* User Information Grid */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Account Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User2 className="h-5 w-5" />
              Account Information
            </CardTitle>
            <CardDescription>Basic user account details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-[120px_1fr] items-center gap-4">
              <div className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Mail className="h-4 w-4" />
                Email
              </div>
              <div className="text-sm font-mono">{user.email}</div>
            </div>

            {user.name && (
              <div className="grid grid-cols-[120px_1fr] items-center gap-4">
                <div className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <User2 className="h-4 w-4" />
                  Name
                </div>
                <div className="text-sm">{user.name}</div>
              </div>
            )}

            <div className="grid grid-cols-[120px_1fr] items-center gap-4">
              <div className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Joined
              </div>
              <div className="text-sm">
                {format(new Date(user.createdAt), "MMMM dd, yyyy 'at' h:mm a")}
              </div>
            </div>

            <div className="grid grid-cols-[120px_1fr] items-center gap-4">
              <div className="text-sm font-medium text-muted-foreground">User ID</div>
              <div className="text-xs font-mono bg-muted px-2 py-1 rounded">
                {user.id}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Subscription Details */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              Subscription Details
            </CardTitle>
            <CardDescription>Current subscription and credits information</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-[120px_1fr] items-center gap-4">
              <div className="text-sm font-medium text-muted-foreground">Plan</div>
              <div className="text-sm font-semibold capitalize">
                {user.subscriptionPlan
                  ? user.subscriptionPlan
                      .split("_")
                      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
                      .join(" ")
                  : user.subscriptionType.charAt(0).toUpperCase() + user.subscriptionType.slice(1)}
              </div>
            </div>

            <div className="grid grid-cols-[120px_1fr] items-center gap-4">
              <div className="text-sm font-medium text-muted-foreground">Status</div>
              <div className="text-sm capitalize font-semibold">
                <span
                  className={
                    user.subscriptionStatus === "active"
                      ? "text-green-500"
                      : user.subscriptionStatus === "paused"
                      ? "text-destructive"
                      : "text-muted-foreground"
                  }
                >
                  {user.subscriptionStatus}
                </span>
              </div>
            </div>

            {user.subscriptionStartedAt && (
              <div className="grid grid-cols-[120px_1fr] items-center gap-4">
                <div className="text-sm font-medium text-muted-foreground">Started</div>
                <div className="text-sm">
                  {format(new Date(user.subscriptionStartedAt), "MMM dd, yyyy")}
                </div>
              </div>
            )}

            {user.subscriptionEndsAt && (
              <div className="grid grid-cols-[120px_1fr] items-center gap-4">
                <div className="text-sm font-medium text-muted-foreground">Ends</div>
                <div className="text-sm">
                  {format(new Date(user.subscriptionEndsAt), "MMM dd, yyyy")}
                </div>
              </div>
            )}

            <div className="pt-4 border-t">
              <div className="grid grid-cols-[120px_1fr] items-center gap-4">
                <div className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  Credits
                </div>
                <div className="text-sm">
                  <span className="font-bold text-lg">
                    {user.creditsTotal === -1 ? "∞" : user.creditsRemaining}
                  </span>
                  {user.creditsTotal !== -1 && (
                    <span className="text-muted-foreground"> / {user.creditsTotal}</span>
                  )}
                </div>
              </div>

              {user.creditsResetDate && user.creditsTotal !== -1 && (
                <div className="grid grid-cols-[120px_1fr] items-center gap-4 mt-2">
                  <div className="text-sm font-medium text-muted-foreground">Resets</div>
                  <div className="text-sm">
                    {format(new Date(user.creditsResetDate), "MMM dd, yyyy")}
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Stats Summary */}
      {stats && (
        <Card>
          <CardHeader>
            <CardTitle>Usage Summary</CardTitle>
            <CardDescription>Conversion activity summary</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <div className="text-sm text-muted-foreground mb-1">Total Conversions</div>
                <div className="text-3xl font-bold">{stats.totalConversions}</div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground mb-1">This Month</div>
                <div className="text-3xl font-bold">{stats.thisMonthConversions}</div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground mb-1">Average/Month</div>
                <div className="text-3xl font-bold">
                  {stats.monthlyTrends.length > 0
                    ? Math.round(
                        stats.monthlyTrends.reduce((sum, m) => sum + m.count, 0) /
                          stats.monthlyTrends.length
                      )
                    : 0}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
