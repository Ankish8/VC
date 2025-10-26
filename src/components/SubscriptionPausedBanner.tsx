"use client";

import { AlertCircle, Mail } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import Link from "next/link";

interface SubscriptionPausedBannerProps {
  variant?: "default" | "prominent";
}

export function SubscriptionPausedBanner({
  variant = "default",
}: SubscriptionPausedBannerProps) {
  if (variant === "prominent") {
    return (
      <div className="bg-destructive/10 border-2 border-destructive rounded-lg p-6">
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0">
            <div className="bg-destructive text-destructive-foreground rounded-full p-3">
              <AlertCircle className="h-6 w-6" />
            </div>
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-destructive mb-2">
              Your subscription has been paused
            </h3>
            <p className="text-sm text-muted-foreground mb-4">
              Your account is currently in view-only mode. You can still view your
              conversion history, but you cannot create new conversions. Please
              contact our support team to resolve this issue.
            </p>
            <div className="flex gap-3">
              <Link href="/contact">
                <Button variant="default">
                  <Mail className="mr-2 h-4 w-4" />
                  Contact Support
                </Button>
              </Link>
              <Link href="/history">
                <Button variant="outline">View History</Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <Alert variant="destructive">
      <AlertCircle className="h-4 w-4" />
      <AlertTitle>Subscription Paused</AlertTitle>
      <AlertDescription>
        Your account is in view-only mode. New conversions are disabled.{" "}
        <Link href="/contact" className="underline font-medium">
          Contact support
        </Link>{" "}
        to resolve this issue.
      </AlertDescription>
    </Alert>
  );
}
