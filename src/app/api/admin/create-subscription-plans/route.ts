import { NextResponse } from 'next/server';
import { checkAdminAccess } from '@/lib/admin-guard';
import { createSubscriptionPlan } from '@/lib/paypal';
import { prisma } from '@/lib/db';

/**
 * POST /api/admin/create-subscription-plans
 * Creates all 4 subscription plans in PayPal and saves the IDs to database
 * This should only be run once during initial setup
 */
export async function POST() {
  const adminCheck = await checkAdminAccess();
  if (adminCheck) return adminCheck;

  try {
    const plans = [];

    // Create STARTER Monthly Plan ($10/month)
    console.log('Creating STARTER Monthly plan...');
    const starterMonthly = await createSubscriptionPlan({
      name: 'VectorCraft STARTER - Monthly',
      description: '100 conversions per month with SVG & EPS export',
      amount: '10.00',
      currency: 'USD',
      interval: 'MONTH',
    });
    plans.push({ name: 'Starter Monthly', id: starterMonthly.id });

    // Create STARTER Yearly Plan ($96/year = $8/month)
    console.log('Creating STARTER Yearly plan...');
    const starterYearly = await createSubscriptionPlan({
      name: 'VectorCraft STARTER - Yearly',
      description: '100 conversions per month with SVG & EPS export - Annual billing',
      amount: '96.00',
      currency: 'USD',
      interval: 'YEAR',
    });
    plans.push({ name: 'Starter Yearly', id: starterYearly.id });

    // Create PROFESSIONAL Monthly Plan ($19/month)
    console.log('Creating PROFESSIONAL Monthly plan...');
    const proMonthly = await createSubscriptionPlan({
      name: 'VectorCraft PROFESSIONAL - Monthly',
      description: '500 conversions per month with batch processing and priority support',
      amount: '19.00',
      currency: 'USD',
      interval: 'MONTH',
    });
    plans.push({ name: 'Professional Monthly', id: proMonthly.id });

    // Create PROFESSIONAL Yearly Plan ($180/year = $15/month)
    console.log('Creating PROFESSIONAL Yearly plan...');
    const proYearly = await createSubscriptionPlan({
      name: 'VectorCraft PROFESSIONAL - Yearly',
      description: '500 conversions per month with batch processing and priority support - Annual billing',
      amount: '180.00',
      currency: 'USD',
      interval: 'YEAR',
    });
    plans.push({ name: 'Professional Yearly', id: proYearly.id });

    // Save plan IDs to database
    let siteSettings = await prisma.siteSettings.findFirst();

    if (!siteSettings) {
      siteSettings = await prisma.siteSettings.create({
        data: {
          timerEnabled: true,
          timerDurationDays: 7,
          lastResetAt: new Date(),
          starterMonthlyPlanId: starterMonthly.id,
          starterYearlyPlanId: starterYearly.id,
          proMonthlyPlanId: proMonthly.id,
          proYearlyPlanId: proYearly.id,
        },
      });
    } else {
      siteSettings = await prisma.siteSettings.update({
        where: { id: siteSettings.id },
        data: {
          starterMonthlyPlanId: starterMonthly.id,
          starterYearlyPlanId: starterYearly.id,
          proMonthlyPlanId: proMonthly.id,
          proYearlyPlanId: proYearly.id,
        },
      });
    }

    return NextResponse.json({
      success: true,
      message: 'All subscription plans created successfully',
      plans,
      savedToDatabase: true,
    });
  } catch (error: any) {
    console.error('Error creating subscription plans:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to create subscription plans',
        details: error.toString(),
      },
      { status: 500 }
    );
  }
}
