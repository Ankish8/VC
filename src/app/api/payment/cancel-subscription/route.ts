import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { cancelSubscription } from '@/lib/paypal';
import { prisma } from '@/lib/db';

/**
 * POST /api/payment/cancel-subscription
 * Allows a user to cancel their subscription
 */
export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const session = await auth();

    if (!session?.user?.email) {
      return NextResponse.json(
        { success: false, error: 'Not authenticated' },
        { status: 401 }
      );
    }

    // Get user
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }

    if (!user.paypalSubscriptionId) {
      return NextResponse.json(
        { success: false, error: 'No active subscription found' },
        { status: 400 }
      );
    }

    // Get optional reason from request
    const body = await request.json().catch(() => ({}));
    const reason = body.reason || 'User requested cancellation';

    // Cancel subscription in PayPal
    await cancelSubscription(user.paypalSubscriptionId, reason);

    // Update user in database
    await prisma.user.update({
      where: { id: user.id },
      data: {
        subscriptionStatus: 'cancelled',
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Subscription cancelled successfully',
    });
  } catch (error: any) {
    console.error('Cancel subscription error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to cancel subscription',
      },
      { status: 500 }
    );
  }
}
