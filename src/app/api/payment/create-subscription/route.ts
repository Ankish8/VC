import { NextRequest, NextResponse } from 'next/server';
import { createSubscription } from '@/lib/paypal';
import { prisma } from '@/lib/db';

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

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

    // Map plan type to plan ID
    let planId: string | null = null;
    let planName = '';

    switch (planType) {
      case 'starter_monthly':
        planId = siteSettings.starterMonthlyPlanId;
        planName = 'STARTER Monthly';
        break;
      case 'starter_yearly':
        planId = siteSettings.starterYearlyPlanId;
        planName = 'STARTER Yearly';
        break;
      case 'pro_monthly':
        planId = siteSettings.proMonthlyPlanId;
        planName = 'PROFESSIONAL Monthly';
        break;
      case 'pro_yearly':
        planId = siteSettings.proYearlyPlanId;
        planName = 'PROFESSIONAL Yearly';
        break;
      default:
        return NextResponse.json(
          { success: false, error: 'Invalid plan type' },
          { status: 400 }
        );
    }

    if (!planId) {
      return NextResponse.json(
        {
          success: false,
          error: `${planName} plan not configured. Please create subscription plans first.`,
        },
        { status: 500 }
      );
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
