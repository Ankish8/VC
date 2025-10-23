import { prisma } from "@/lib/db";

/**
 * Credit Management Utilities
 * Handles credit allocation, tracking, and reset logic for subscription plans
 */

export interface CreditStatus {
  remaining: number;
  total: number;
  resetDate: Date | null;
  percentage: number;
  isUnlimited: boolean;
  needsReset: boolean;
}

/**
 * Get credit allocation based on subscription plan
 */
export function getCreditAllocationForPlan(
  subscriptionPlan: string | null,
  subscriptionType: string,
  siteSettings: {
    starterCredits: number;
    proCredits: number;
  }
): number {
  // Lifetime users get unlimited (represented as -1)
  if (subscriptionType === "lifetime") {
    return -1;
  }

  // Free users get 0 credits
  if (subscriptionType === "free" || !subscriptionPlan) {
    return 0;
  }

  // Determine credits based on plan
  if (subscriptionPlan.startsWith("starter_")) {
    return siteSettings.starterCredits;
  }

  if (subscriptionPlan.startsWith("pro_")) {
    return siteSettings.proCredits;
  }

  return 0;
}

/**
 * Calculate next reset date based on subscription start date and billing cycle
 */
export function calculateNextResetDate(
  subscriptionStartedAt: Date | null,
  subscriptionPlan: string | null
): Date | null {
  if (!subscriptionStartedAt || !subscriptionPlan) {
    return null;
  }

  const now = new Date();
  const startDate = new Date(subscriptionStartedAt);

  // For yearly plans, reset annually
  if (subscriptionPlan.includes("yearly")) {
    const nextResetYear = startDate.getFullYear() + Math.floor(
      (now.getFullYear() - startDate.getFullYear() +
      (now.getMonth() > startDate.getMonth() ||
      (now.getMonth() === startDate.getMonth() && now.getDate() >= startDate.getDate()) ? 1 : 0))
    );
    return new Date(nextResetYear, startDate.getMonth(), startDate.getDate());
  }

  // For monthly plans, reset monthly
  let nextResetMonth = startDate.getMonth();
  let nextResetYear = startDate.getFullYear();

  while (new Date(nextResetYear, nextResetMonth, startDate.getDate()) <= now) {
    nextResetMonth++;
    if (nextResetMonth > 11) {
      nextResetMonth = 0;
      nextResetYear++;
    }
  }

  return new Date(nextResetYear, nextResetMonth, startDate.getDate());
}

/**
 * Check if user's credits need to be reset
 */
export async function checkAndResetCredits(userId: string): Promise<boolean> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user) return false;

  // Lifetime users don't need resets
  if (user.subscriptionType === "lifetime") {
    return false;
  }

  // Free users don't get credits
  if (user.subscriptionType === "free") {
    return false;
  }

  const now = new Date();
  const resetDate = user.creditsResetDate;

  // If reset date has passed, reset credits
  if (resetDate && now >= resetDate) {
    const siteSettings = await prisma.siteSettings.findFirst();
    if (!siteSettings) return false;

    const newCredits = getCreditAllocationForPlan(
      user.subscriptionPlan,
      user.subscriptionType,
      siteSettings
    );

    const nextResetDate = calculateNextResetDate(
      user.subscriptionStartedAt,
      user.subscriptionPlan
    );

    await prisma.user.update({
      where: { id: userId },
      data: {
        creditsRemaining: newCredits,
        creditsTotal: newCredits,
        creditsResetDate: nextResetDate,
      },
    });

    return true;
  }

  return false;
}

/**
 * Get user's current credit status
 */
export async function getUserCreditStatus(userId: string): Promise<CreditStatus> {
  // Check and reset if needed first
  await checkAndResetCredits(userId);

  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user) {
    return {
      remaining: 0,
      total: 0,
      resetDate: null,
      percentage: 0,
      isUnlimited: false,
      needsReset: false,
    };
  }

  const isUnlimited = user.subscriptionType === "lifetime" || user.creditsTotal === -1;
  const remaining = isUnlimited ? -1 : user.creditsRemaining;
  const total = isUnlimited ? -1 : user.creditsTotal;
  const percentage = isUnlimited ? 100 : total > 0 ? (remaining / total) * 100 : 0;

  return {
    remaining,
    total,
    resetDate: user.creditsResetDate,
    percentage,
    isUnlimited,
    needsReset: false,
  };
}

/**
 * Deduct credits for a conversion
 * Returns true if successful, false if insufficient credits
 */
export async function deductCredit(userId: string): Promise<boolean> {
  await checkAndResetCredits(userId);

  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user) return false;

  // Lifetime users have unlimited credits
  if (user.subscriptionType === "lifetime") {
    return true;
  }

  // Check if user has credits remaining
  if (user.creditsRemaining <= 0) {
    return false;
  }

  // Deduct one credit
  await prisma.user.update({
    where: { id: userId },
    data: {
      creditsRemaining: user.creditsRemaining - 1,
    },
  });

  return true;
}

/**
 * Initialize credits for a new subscription
 */
export async function initializeCreditsForSubscription(
  userId: string,
  subscriptionPlan: string,
  subscriptionType: string,
  subscriptionStartedAt: Date
): Promise<void> {
  const siteSettings = await prisma.siteSettings.findFirst();
  if (!siteSettings) return;

  const credits = getCreditAllocationForPlan(
    subscriptionPlan,
    subscriptionType,
    siteSettings
  );

  const resetDate = calculateNextResetDate(subscriptionStartedAt, subscriptionPlan);

  await prisma.user.update({
    where: { id: userId },
    data: {
      creditsRemaining: credits,
      creditsTotal: credits,
      creditsResetDate: resetDate,
    },
  });
}
