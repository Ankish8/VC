import { NextResponse } from 'next/server';
import { trackLead, getClientInfo, generateEventId } from '@/lib/facebook-conversions-api';
import { getFacebookIds } from '@/components/analytics/FacebookPixel';

/**
 * Test endpoint for Facebook Conversions API
 *
 * Usage: GET /api/test-capi?email=test@example.com
 *
 * This will send a Lead event to Facebook Conversions API and return the response
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email') || 'test@example.com';

    // Get client information
    const { ip, userAgent } = await getClientInfo();

    // Generate event ID for deduplication
    const eventId = generateEventId();

    console.log('🧪 Testing Facebook Conversions API with:', {
      email,
      ip,
      userAgent,
      eventId,
    });

    // Send test Lead event
    const result = await trackLead({
      email,
      contentName: 'CAPI Test',
      clientIp: ip,
      clientUserAgent: userAgent,
      eventId,
    });

    if (result.success) {
      return NextResponse.json({
        success: true,
        message: 'Conversions API event sent successfully! Check your server logs and Facebook Events Manager.',
        eventId,
        details: {
          email,
          ip,
          userAgent: userAgent?.substring(0, 50) + '...',
        },
      });
    } else {
      return NextResponse.json({
        success: false,
        error: result.error,
        message: 'Failed to send event to Facebook Conversions API',
      }, { status: 500 });
    }
  } catch (error) {
    console.error('Test CAPI endpoint error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }, { status: 500 });
  }
}
