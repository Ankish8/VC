import { NextRequest, NextResponse } from 'next/server';
import { checkAdminAccess } from '@/lib/admin-guard';
import { getTimerSettings, updateTimerSettings } from '@/lib/timer-config';
import { prisma } from '@/lib/db';

/**
 * GET /api/admin/settings
 * Fetch all site settings including timer configuration
 */
export async function GET() {
  const adminCheck = await checkAdminAccess();
  if (adminCheck) return adminCheck;

  try {
    const timerSettings = await getTimerSettings();

    // Get subscription plan IDs
    const siteSettings = await prisma.siteSettings.findFirst();

    return NextResponse.json({
      success: true,
      timer: timerSettings,
      subscriptionPlans: {
        starterMonthlyPlanId: siteSettings?.starterMonthlyPlanId || null,
        starterYearlyPlanId: siteSettings?.starterYearlyPlanId || null,
        proMonthlyPlanId: siteSettings?.proMonthlyPlanId || null,
        proYearlyPlanId: siteSettings?.proYearlyPlanId || null,
      },
    });
  } catch (error) {
    console.error('Error fetching admin settings:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch settings' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/admin/settings
 * Update site settings
 */
export async function PUT(request: NextRequest) {
  const adminCheck = await checkAdminAccess();
  if (adminCheck) return adminCheck;

  try {
    const body = await request.json();

    // Update timer settings if provided
    if (body.timer) {
      await updateTimerSettings({
        enabled: body.timer.enabled,
        durationDays: body.timer.durationDays,
        resetNow: body.timer.resetNow,
      });
    }

    // Update PayPal subscription plan IDs if provided
    if (body.subscriptionPlans) {
      const siteSettings = await prisma.siteSettings.findFirst();

      if (siteSettings) {
        await prisma.siteSettings.update({
          where: { id: siteSettings.id },
          data: {
            starterMonthlyPlanId: body.subscriptionPlans.starterMonthlyPlanId,
            starterYearlyPlanId: body.subscriptionPlans.starterYearlyPlanId,
            proMonthlyPlanId: body.subscriptionPlans.proMonthlyPlanId,
            proYearlyPlanId: body.subscriptionPlans.proYearlyPlanId,
          },
        });
      }
    }

    // Fetch updated settings
    const updatedSettings = await getTimerSettings();
    const siteSettings = await prisma.siteSettings.findFirst();

    return NextResponse.json({
      success: true,
      message: 'Settings updated successfully',
      timer: updatedSettings,
      subscriptionPlans: {
        starterMonthlyPlanId: siteSettings?.starterMonthlyPlanId || null,
        starterYearlyPlanId: siteSettings?.starterYearlyPlanId || null,
        proMonthlyPlanId: siteSettings?.proMonthlyPlanId || null,
        proYearlyPlanId: siteSettings?.proYearlyPlanId || null,
      },
    });
  } catch (error) {
    console.error('Error updating admin settings:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update settings' },
      { status: 500 }
    );
  }
}
