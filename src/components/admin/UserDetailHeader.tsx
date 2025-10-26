"use client";

import { ArrowLeft, User2, Calendar, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { UserActions } from "./UserActions";
import { AdminUser } from "@/types";
import { formatDistance } from "date-fns";
import Link from "next/link";

interface UserDetailHeaderProps {
  user: {
    id: string;
    email: string;
    name: string | null;
    createdAt: Date;
    subscriptionType: string;
    subscriptionStatus: string;
    subscriptionPlan: string | null;
    paypalSubscriptionId: string | null;
    subscriptionStartedAt: Date | null;
    subscriptionEndsAt: Date | null;
  };
  onUserUpdated?: () => void;
}

export function UserDetailHeader({ user, onUserUpdated }: UserDetailHeaderProps) {
  const getPlanBadgeVariant = (plan: string | null, subscriptionType: string) => {
    if (subscriptionType === "free") return "secondary";
    if (subscriptionType === "lifetime") return "default";
    return "outline";
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case "active":
        return "default";
      case "paused":
        return "destructive";
      case "cancelled":
      case "expired":
        return "secondary";
      default:
        return "outline";
    }
  };

  const formatPlanName = (plan: string | null, subscriptionType: string) => {
    if (subscriptionType === "free") return "Free";
    if (subscriptionType === "lifetime") return "Lifetime";
    if (!plan) return subscriptionType;

    return plan
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  // Convert to AdminUser type for UserActions
  const adminUser: AdminUser = {
    ...user,
    creditsRemaining: 0,
    creditsTotal: 0,
    totalConversions: 0,
    lastActivityAt: null,
    isPaused: user.subscriptionStatus === "paused",
  };

  return (
    <div className="space-y-4">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Link href="/admin" className="hover:text-foreground transition-colors">
          Admin
        </Link>
        <span>/</span>
        <Link href="/admin/users" className="hover:text-foreground transition-colors">
          Users
        </Link>
        <span>/</span>
        <span className="text-foreground font-medium">{user.email}</span>
      </div>

      {/* Header Card */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-start justify-between">
            {/* User Info */}
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-4">
                <Link href="/admin/users">
                  <Button variant="ghost" size="sm">
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back to Users
                  </Button>
                </Link>
              </div>

              <div className="space-y-3">
                {/* Email */}
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-12 h-12 rounded-full bg-primary/10">
                    <User2 className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <h1 className="text-2xl font-bold">{user.email}</h1>
                    </div>
                    {user.name && (
                      <p className="text-sm text-muted-foreground mt-1">{user.name}</p>
                    )}
                  </div>
                </div>

                {/* Metadata Row */}
                <div className="flex flex-wrap items-center gap-4 text-sm">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    <span>
                      Joined {formatDistance(new Date(user.createdAt), new Date(), { addSuffix: true })}
                    </span>
                  </div>
                </div>

                {/* Badges Row */}
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant={getPlanBadgeVariant(user.subscriptionPlan, user.subscriptionType)}>
                    {formatPlanName(user.subscriptionPlan, user.subscriptionType)}
                  </Badge>
                  <Badge variant={getStatusBadgeVariant(user.subscriptionStatus)}>
                    {user.subscriptionStatus}
                  </Badge>
                  {user.paypalSubscriptionId && (
                    <Badge variant="outline" className="font-mono text-xs">
                      PayPal: {user.paypalSubscriptionId.substring(0, 12)}...
                    </Badge>
                  )}
                </div>

                {/* Subscription Dates */}
                {(user.subscriptionStartedAt || user.subscriptionEndsAt) && (
                  <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground pt-2">
                    {user.subscriptionStartedAt && (
                      <div>
                        Started: {new Date(user.subscriptionStartedAt).toLocaleDateString()}
                      </div>
                    )}
                    {user.subscriptionEndsAt && (
                      <div>
                        Ends: {new Date(user.subscriptionEndsAt).toLocaleDateString()}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Quick Actions */}
            <div>
              <UserActions user={adminUser} onUserUpdated={onUserUpdated} />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
