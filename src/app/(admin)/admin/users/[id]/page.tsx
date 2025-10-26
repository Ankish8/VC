"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { UserDetailHeader } from "@/components/admin/UserDetailHeader";
import { UserOverviewTab } from "@/components/admin/UserOverviewTab";
import { DailyUsageChart } from "@/components/admin/DailyUsageChart";
import { MonthlyTrendChart } from "@/components/admin/MonthlyTrendChart";
import { UserImageGallery } from "@/components/admin/UserImageGallery";
import { UserDetailStats } from "@/types";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertCircle, BarChart3, Images, LayoutDashboard } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface UserDetail {
  id: string;
  email: string;
  name: string | null;
  createdAt: Date;
  subscriptionType: string;
  subscriptionStatus: string;
  subscriptionPlan: string | null;
  subscriptionStartedAt: Date | null;
  subscriptionEndsAt: Date | null;
  paypalSubscriptionId: string | null;
  creditsRemaining: number;
  creditsTotal: number;
  creditsResetDate: Date | null;
  stats: UserDetailStats;
}

export default function UserDetailPage() {
  const params = useParams();
  const router = useRouter();
  const userId = params.id as string;

  const [user, setUser] = useState<UserDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("overview");

  const fetchUserDetails = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch(`/api/admin/users/${userId}`);

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to fetch user details");
      }

      const data = await response.json();
      setUser(data);
    } catch (error) {
      console.error("Error fetching user details:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Failed to load user details";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (userId) {
      fetchUserDetails();
    }
  }, [userId]);

  const handleUserUpdated = () => {
    fetchUserDetails();
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-32 w-full" />
        <div className="grid gap-4 md:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-24" />
          ))}
        </div>
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className="space-y-6">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error Loading User</AlertTitle>
          <AlertDescription>
            {error || "User not found"}
            <div className="mt-4">
              <button
                onClick={() => router.push("/admin/users")}
                className="text-sm underline"
              >
                Return to user list
              </button>
            </div>
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <UserDetailHeader user={user} onUserUpdated={handleUserUpdated} />

      {/* Tabbed Interface */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-3 lg:w-[600px]">
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <LayoutDashboard className="h-4 w-4" />
            <span className="hidden sm:inline">Overview</span>
          </TabsTrigger>
          <TabsTrigger value="analytics" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            <span className="hidden sm:inline">Usage Analytics</span>
          </TabsTrigger>
          <TabsTrigger value="gallery" className="flex items-center gap-2">
            <Images className="h-4 w-4" />
            <span className="hidden sm:inline">Image Gallery</span>
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <UserOverviewTab
            user={user}
            stats={user.stats}
            isLoading={false}
          />
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-2">
            <DailyUsageChart data={user.stats.dailyUsage} />
            <MonthlyTrendChart data={user.stats.monthlyTrends} />
          </div>

          {/* Additional Analytics Summary */}
          <div className="grid gap-6 md:grid-cols-3">
            <div className="rounded-lg border bg-card p-6">
              <div className="text-sm text-muted-foreground mb-1">Total Conversions</div>
              <div className="text-3xl font-bold">{user.stats.totalConversions}</div>
            </div>
            <div className="rounded-lg border bg-card p-6">
              <div className="text-sm text-muted-foreground mb-1">This Month</div>
              <div className="text-3xl font-bold">{user.stats.thisMonthConversions}</div>
            </div>
            <div className="rounded-lg border bg-card p-6">
              <div className="text-sm text-muted-foreground mb-1">Daily Average (30d)</div>
              <div className="text-3xl font-bold">
                {user.stats.dailyUsage.length > 0
                  ? (
                      user.stats.dailyUsage.reduce((sum, d) => sum + d.count, 0) /
                      user.stats.dailyUsage.length
                    ).toFixed(1)
                  : "0"}
              </div>
            </div>
          </div>
        </TabsContent>

        {/* Gallery Tab */}
        <TabsContent value="gallery" className="space-y-6">
          <UserImageGallery userId={userId} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
