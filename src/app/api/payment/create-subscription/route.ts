import { NextRequest, NextResponse } from 'next/server';
import { createSubscription, createSubscriptionPlan } from '@/lib/paypal';
import { prisma } from '@/lib/db';

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

/**
 * Check if a plan ID is a placeholder (not a real PayPal ID)
 * Real PayPal plan IDs are long alphanumeric strings like "P-5ML4271244454362WXNWU5NQ"
 * Placeholders are short like "P-PRO-MONTHLY"
 */
function isPlaceholderPlanId(planId: string | null): boolean {
  if (!planId) return true;
  // Real PayPal plan IDs are typically 20+ characters long
  // Placeholders are shorter (like "P-PRO-MONTHLY")
  return planId.length < 20 || !planId.match(/^P-[A-Z0-9]{15,}$/);
}

/**
 * POST /api/payment/create-subscription
 * Creates a PayPal subscription for a pricing plan
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { planType } = body; // starter_monthly, starter_yearly, pro_monthly, pro_yearly

    if (!planType) {
      return NextResponse.json(
        { success: false, error: 'Plan type is required' },
        { status: 400 }
      );
    }

    // Get the plan ID from database
    const siteSettings = await prisma.siteSettings.findFirst();

    if (!siteSettings) {
      return NextResponse.json(
        {
          success: false,
          error: 'Site settings not found. Please run setup first.',
        },
        { status: 500 }
      );
    }

    // Map plan type to plan ID and configuration
    let planId: string | null = null;
    let planName = '';
    let planPrice = 0;
    let planInterval: 'MONTH' | 'YEAR' = 'MONTH';
    let planCredits = 0;
    let dbFieldName = '';

    switch (planType) {
      case 'starter_monthly':
        planId = siteSettings.starterMonthlyPlanId;
        planName = 'Starter Monthly Plan';
        planPrice = siteSettings.starterMonthlyPrice;
        planInterval = 'MONTH';
        planCredits = siteSettings.starterCredits;
        dbFieldName = 'starterMonthlyPlanId';
        break;
      case 'starter_yearly':
        planId = siteSettings.starterYearlyPlanId;
        planName = 'Starter Yearly Plan';
        planPrice = siteSettings.starterYearlyPrice;
        planInterval = 'YEAR';
        planCredits = siteSettings.starterCredits;
        dbFieldName = 'starterYearlyPlanId';
        break;
      case 'pro_monthly':
        planId = siteSettings.proMonthlyPlanId;
        planName = 'Professional Monthly Plan';
        planPrice = siteSettings.proMonthlyPrice;
        planInterval = 'MONTH';
        planCredits = siteSettings.proCredits;
        dbFieldName = 'proMonthlyPlanId';
        break;
      case 'pro_yearly':
        planId = siteSettings.proYearlyPlanId;
        planName = 'Professional Yearly Plan';
        planPrice = siteSettings.proYearlyPrice;
        planInterval = 'YEAR';
        planCredits = siteSettings.proCredits;
        dbFieldName = 'proYearlyPlanId';
        break;
      default:
        return NextResponse.json(
          { success: false, error: 'Invalid plan type' },
          { status: 400 }
        );
    }

    // Auto-create PayPal plan if it doesn't exist or is a placeholder
    if (isPlaceholderPlanId(planId)) {
      console.log(`[Subscription] Plan ID is placeholder or missing, creating PayPal plan for ${planName}...`);

      try {
        const newPlan = await createSubscriptionPlan(
          planName,
          `${planCredits} conversions per ${planInterval === 'MONTH' ? 'month' : 'year'}`,
          planPrice.toString(),
          planInterval
        );

        console.log(`[Subscription] Created PayPal plan: ${newPlan.id}`);

        // Update database with real plan ID
        await prisma.siteSettings.update({
          where: { id: siteSettings.id },
          data: {
            [dbFieldName]: newPlan.id,
          },
        });

        planId = newPlan.id;
        console.log(`[Subscription] Updated database with plan ID: ${newPlan.id}`);
      } catch (error: any) {
        console.error(`[Subscription] Failed to create PayPal plan:`, error);
        return NextResponse.json(
          {
            success: false,
            error: `Failed to create ${planName} in PayPal. Please check your PayPal configuration.`,
            details: error.message,
          },
          { status: 500 }
        );
      }
    }

    // Create the subscription
    const subscription = await createSubscription({
      planId,
      returnUrl: `${APP_URL}/api/payment/capture-subscription?plan=${planType}`,
      cancelUrl: `${APP_URL}/?payment=cancelled`,
    });

    return NextResponse.json({
      success: true,
      subscriptionId: subscription.id,
      approvalUrl: subscription.approvalUrl,
      planType,
    });
  } catch (error: any) {
    console.error('Create subscription error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to create subscription',
      },
      { status: 500 }
    );
  }
}
