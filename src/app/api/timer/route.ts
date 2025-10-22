import { NextResponse } from 'next/server';
import { getTimerEndDate } from '@/lib/timer-config';

export const dynamic = 'force-dynamic';

/**
 * Public API endpoint to get the current countdown timer end date
 * Supports auto-loop functionality
 */
export async function GET() {
  try {
    const timerData = await getTimerEndDate();

    return NextResponse.json({
      success: true,
      endDate: timerData.endDate.toISOString(),
      enabled: timerData.enabled,
      durationDays: timerData.durationDays,
    }, {
      headers: {
        'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=120',
      },
    });
  } catch (error) {
    console.error('Error fetching timer:', error);

    // Return a default timer if there's an error
    const defaultEndDate = new Date();
    defaultEndDate.setDate(defaultEndDate.getDate() + 7);

    return NextResponse.json({
      success: false,
      endDate: defaultEndDate.toISOString(),
      enabled: true,
      durationDays: 7,
      error: 'Failed to fetch timer settings',
    }, { status: 500 });
  }
}
