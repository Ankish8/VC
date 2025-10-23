"use client";

import { useEffect, useState } from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

interface CreditStatus {
  remaining: number;
  total: number;
  resetDate: string | null;
  percentage: number;
  isUnlimited: boolean;
}

export default function CreditBanner() {
  const [creditStatus, setCreditStatus] = useState<CreditStatus | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCreditStatus();
  }, []);

  const fetchCreditStatus = async () => {
    try {
      const res = await fetch("/api/user/credits");
      if (res.ok) {
        const data = await res.json();
        setCreditStatus(data);
      }
    } catch (error) {
      console.error("Failed to fetch credit status:", error);
    } finally {
      setLoading(false);
    }
  };

  // Don't show banner if loading, unlimited, or has plenty of credits
  if (loading || !creditStatus || creditStatus.isUnlimited) {
    return null;
  }

  // Show warning if 20% or less credits remaining
  if (creditStatus.percentage > 20) {
    return null;
  }

  // Critical warning if no credits left
  if (creditStatus.remaining === 0) {
    const resetDateStr = creditStatus.resetDate
      ? new Date(creditStatus.resetDate).toLocaleDateString()
      : "next billing cycle";

    return (
      <Alert variant="destructive" className="mb-6">
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription className="flex items-center justify-between">
          <div>
            <strong>No credits remaining!</strong> You've used all {creditStatus.total} conversions
            for this billing cycle. Credits reset on {resetDateStr}.
          </div>
          <Link href="/#pricing">
            <Button variant="outline" size="sm" className="ml-4">
              Upgrade Plan
            </Button>
          </Link>
        </AlertDescription>
      </Alert>
    );
  }

  // Low credits warning
  const resetDateStr = creditStatus.resetDate
    ? new Date(creditStatus.resetDate).toLocaleDateString()
    : "next billing cycle";

  return (
    <Alert className="mb-6 border-yellow-600 bg-yellow-50">
      <Zap className="h-4 w-4 text-yellow-600" />
      <AlertDescription className="flex items-center justify-between text-yellow-800">
        <div>
          <strong>Running low on credits!</strong> You have {creditStatus.remaining} of{" "}
          {creditStatus.total} conversions remaining. Credits reset on {resetDateStr}.
        </div>
        <Link href="/#pricing">
          <Button variant="outline" size="sm" className="ml-4">
            Upgrade
          </Button>
        </Link>
      </AlertDescription>
    </Alert>
  );
}
