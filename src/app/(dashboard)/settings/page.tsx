"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Loader2, Check, X, Calendar, CreditCard, Mail, Lock, User as UserIcon, AlertTriangle } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface UserData {
  id: string;
  name: string | null;
  email: string;
  subscriptionType: string;
  subscriptionStatus: string;
  subscriptionPlan: string | null;
  subscriptionEndsAt: string | null;
  subscriptionStartedAt: string | null;
  creditsRemaining: number;
  creditsTotal: number;
  creditsResetDate: string | null;
  paypalSubscriptionId: string | null;
}

interface CreditStatus {
  remaining: number;
  total: number;
  resetDate: string | null;
  percentage: number;
  isUnlimited: boolean;
}

export default function SettingsPage() {
  const { data: session, update: updateSession } = useSession();
  const [userData, setUserData] = useState<UserData | null>(null);
  const [creditStatus, setCreditStatus] = useState<CreditStatus | null>(null);
  const [loading, setLoading] = useState(true);

  // Profile state
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileSuccess, setProfileSuccess] = useState("");
  const [profileError, setProfileError] = useState("");

  // Password state
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordSuccess, setPasswordSuccess] = useState("");
  const [passwordError, setPasswordError] = useState("");

  // Cancel subscription state
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [cancelLoading, setCancelLoading] = useState(false);
  const [cancelError, setCancelError] = useState("");

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      setLoading(true);
      const [userRes, creditsRes] = await Promise.all([
        fetch("/api/user/profile"),
        fetch("/api/user/credits"),
      ]);

      if (!userRes.ok || !creditsRes.ok) {
        throw new Error("Failed to fetch user data");
      }

      const user = await userRes.json();
      const credits = await creditsRes.json();

      setUserData(user);
      setCreditStatus(credits);
      setName(user.name || "");
      setEmail(user.email || "");
    } catch (error) {
      console.error("Error fetching user data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileLoading(true);
    setProfileSuccess("");
    setProfileError("");

    try {
      const res = await fetch("/api/user/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to update profile");
      }

      const updatedUser = await res.json();
      setUserData(updatedUser);
      setProfileSuccess("Profile updated successfully!");

      // Update session if needed
      await updateSession();
    } catch (error: any) {
      setProfileError(error.message);
    } finally {
      setProfileLoading(false);
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordLoading(true);
    setPasswordSuccess("");
    setPasswordError("");

    if (newPassword !== confirmPassword) {
      setPasswordError("New passwords do not match");
      setPasswordLoading(false);
      return;
    }

    if (newPassword.length < 6) {
      setPasswordError("New password must be at least 6 characters");
      setPasswordLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/auth/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to change password");
      }

      setPasswordSuccess("Password changed successfully!");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (error: any) {
      setPasswordError(error.message);
    } finally {
      setPasswordLoading(false);
    }
  };

  const handleCancelSubscription = async () => {
    setCancelLoading(true);
    setCancelError("");

    try {
      const res = await fetch("/api/payment/cancel-subscription", {
        method: "POST",
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to cancel subscription");
      }

      setShowCancelDialog(false);
      fetchUserData(); // Refresh user data
    } catch (error: any) {
      setCancelError(error.message);
    } finally {
      setCancelLoading(false);
    }
  };

  const getSubscriptionBadgeVariant = (status: string) => {
    switch (status) {
      case "active":
        return "default";
      case "cancelled":
        return "secondary";
      case "expired":
        return "destructive";
      default:
        return "outline";
    }
  };

  const getPlanDisplayName = (plan: string | null, type: string) => {
    if (type === "lifetime") return "Lifetime";
    if (!plan) return "Free";

    const planMap: Record<string, string> = {
      starter_monthly: "Starter (Monthly)",
      starter_yearly: "Starter (Yearly)",
      pro_monthly: "Professional (Monthly)",
      pro_yearly: "Professional (Yearly)",
    };

    return planMap[plan] || "Unknown Plan";
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!userData) {
    return (
      <div className="container mx-auto p-6">
        <Alert>
          <AlertDescription>Failed to load user data. Please try again.</AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <h1 className="text-3xl font-bold mb-8">Account Settings</h1>

      <div className="space-y-6">
        {/* Subscription Info */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              Subscription
            </CardTitle>
            <CardDescription>Manage your subscription and billing</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-sm text-muted-foreground">Current Plan</Label>
                <p className="text-lg font-semibold">
                  {getPlanDisplayName(userData.subscriptionPlan, userData.subscriptionType)}
                </p>
              </div>
              <div>
                <Label className="text-sm text-muted-foreground">Status</Label>
                <div className="mt-1">
                  <Badge variant={getSubscriptionBadgeVariant(userData.subscriptionStatus)}>
                    {userData.subscriptionStatus.charAt(0).toUpperCase() +
                      userData.subscriptionStatus.slice(1)}
                  </Badge>
                </div>
              </div>
            </div>

            {userData.subscriptionStartedAt && (
              <div>
                <Label className="text-sm text-muted-foreground flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Started On
                </Label>
                <p className="text-sm mt-1">
                  {new Date(userData.subscriptionStartedAt).toLocaleDateString()}
                </p>
              </div>
            )}

            {userData.subscriptionEndsAt && (
              <div>
                <Label className="text-sm text-muted-foreground flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  {userData.subscriptionStatus === "cancelled" ? "Access Until" : "Renews On"}
                </Label>
                <p className="text-sm mt-1">
                  {new Date(userData.subscriptionEndsAt).toLocaleDateString()}
                </p>
              </div>
            )}

            {/* Credit Status */}
            {creditStatus && !creditStatus.isUnlimited && (
              <div>
                <Label className="text-sm text-muted-foreground">Credits Remaining</Label>
                <div className="mt-2">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-2xl font-bold">
                      {creditStatus.remaining} / {creditStatus.total}
                    </span>
                    <span className="text-sm text-muted-foreground">
                      {creditStatus.percentage.toFixed(0)}% remaining
                    </span>
                  </div>
                  <div className="w-full bg-secondary rounded-full h-2">
                    <div
                      className="bg-primary h-2 rounded-full transition-all"
                      style={{ width: `${creditStatus.percentage}%` }}
                    />
                  </div>
                  {creditStatus.resetDate && (
                    <p className="text-xs text-muted-foreground mt-2">
                      Resets on {new Date(creditStatus.resetDate).toLocaleDateString()}
                    </p>
                  )}
                </div>
              </div>
            )}

            {creditStatus?.isUnlimited && (
              <div>
                <Label className="text-sm text-muted-foreground">Credits</Label>
                <p className="text-lg font-semibold text-green-600">Unlimited</p>
              </div>
            )}

            <Separator />

            <div className="flex flex-col gap-2">
              {userData.paypalSubscriptionId &&
                userData.subscriptionStatus === "active" &&
                userData.subscriptionType !== "lifetime" && (
                  <>
                    <Button
                      variant="outline"
                      onClick={() =>
                        window.open(
                          `https://www.paypal.com/myaccount/autopay/`,
                          "_blank"
                        )
                      }
                    >
                      Manage Payment Method
                    </Button>
                    <Button variant="destructive" onClick={() => setShowCancelDialog(true)}>
                      Cancel Subscription
                    </Button>
                  </>
                )}
              {userData.subscriptionType === "free" && (
                <Button onClick={() => (window.location.href = "/#pricing")}>
                  Upgrade Plan
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Profile Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserIcon className="h-5 w-5" />
              Profile Information
            </CardTitle>
            <CardDescription>Update your personal information</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleProfileUpdate} className="space-y-4">
              <div>
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your name"
                />
              </div>
              <div>
                <Label htmlFor="email" className="flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  Email Address
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              {profileSuccess && (
                <Alert className="bg-green-50 border-green-200">
                  <Check className="h-4 w-4 text-green-600" />
                  <AlertDescription className="text-green-800">{profileSuccess}</AlertDescription>
                </Alert>
              )}

              {profileError && (
                <Alert variant="destructive">
                  <X className="h-4 w-4" />
                  <AlertDescription>{profileError}</AlertDescription>
                </Alert>
              )}

              <Button type="submit" disabled={profileLoading}>
                {profileLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Save Changes
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Change Password */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lock className="h-5 w-5" />
              Change Password
            </CardTitle>
            <CardDescription>Update your password to keep your account secure</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handlePasswordChange} className="space-y-4">
              <div>
                <Label htmlFor="currentPassword">Current Password</Label>
                <Input
                  id="currentPassword"
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  required
                />
              </div>
              <div>
                <Label htmlFor="newPassword">New Password</Label>
                <Input
                  id="newPassword"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                />
              </div>
              <div>
                <Label htmlFor="confirmPassword">Confirm New Password</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
              </div>

              {passwordSuccess && (
                <Alert className="bg-green-50 border-green-200">
                  <Check className="h-4 w-4 text-green-600" />
                  <AlertDescription className="text-green-800">{passwordSuccess}</AlertDescription>
                </Alert>
              )}

              {passwordError && (
                <Alert variant="destructive">
                  <X className="h-4 w-4" />
                  <AlertDescription>{passwordError}</AlertDescription>
                </Alert>
              )}

              <Button type="submit" disabled={passwordLoading}>
                {passwordLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Change Password
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>

      {/* Cancel Subscription Dialog */}
      <Dialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-destructive" />
              Cancel Subscription?
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to cancel your subscription? You will retain access until the end of
              your current billing period (
              {userData.subscriptionEndsAt &&
                new Date(userData.subscriptionEndsAt).toLocaleDateString()}
              ).
            </DialogDescription>
          </DialogHeader>

          {cancelError && (
            <Alert variant="destructive">
              <X className="h-4 w-4" />
              <AlertDescription>{cancelError}</AlertDescription>
            </Alert>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCancelDialog(false)} disabled={cancelLoading}>
              Keep Subscription
            </Button>
            <Button
              variant="destructive"
              onClick={handleCancelSubscription}
              disabled={cancelLoading}
            >
              {cancelLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Yes, Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
