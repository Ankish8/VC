import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

/**
 * POST /api/payment/webhook
 * Handles PayPal webhook events for subscription lifecycle
 *
 * Important webhook events:
 * - BILLING.SUBSCRIPTION.ACTIVATED: Subscription activated
 * - BILLING.SUBSCRIPTION.CANCELLED: User cancelled subscription
 * - BILLING.SUBSCRIPTION.SUSPENDED: Payment failed, subscription suspended
 * - BILLING.SUBSCRIPTION.EXPIRED: Subscription expired
 * - PAYMENT.SALE.COMPLETED: Recurring payment completed successfully
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const eventType = body.event_type;

    console.log('PayPal Webhook Event:', eventType, body);

    // In production, you should verify the webhook signature
    // See: https://developer.paypal.com/docs/api/webhooks/v1/#verify-webhook-signature

    switch (eventType) {
      case 'BILLING.SUBSCRIPTION.ACTIVATED': {
        const subscriptionId = body.resource.id;
        const subscriberEmail = body.resource.subscriber?.email_address;

        if (subscriptionId) {
          await prisma.user.updateMany({
            where: { paypalSubscriptionId: subscriptionId },
            data: {
              subscriptionStatus: 'active',
              paymentStatus: 'completed',
            },
          });
        }
        break;
      }

      case 'BILLING.SUBSCRIPTION.CANCELLED': {
        const subscriptionId = body.resource.id;

        if (subscriptionId) {
          await prisma.user.updateMany({
            where: { paypalSubscriptionId: subscriptionId },
            data: {
              subscriptionStatus: 'cancelled',
            },
          });
        }
        break;
      }

      case 'BILLING.SUBSCRIPTION.SUSPENDED': {
        const subscriptionId = body.resource.id;

        if (subscriptionId) {
          await prisma.user.updateMany({
            where: { paypalSubscriptionId: subscriptionId },
            data: {
              subscriptionStatus: 'suspended',
              paymentStatus: 'failed',
            },
          });
        }
        break;
      }

      case 'BILLING.SUBSCRIPTION.EXPIRED': {
        const subscriptionId = body.resource.id;

        if (subscriptionId) {
          await prisma.user.updateMany({
            where: { paypalSubscriptionId: subscriptionId },
            data: {
              subscriptionStatus: 'expired',
            },
          });
        }
        break;
      }

      case 'PAYMENT.SALE.COMPLETED': {
        // Recurring payment completed successfully
        const subscriptionId = body.resource.billing_agreement_id;

        if (subscriptionId) {
          // Update next billing date
          const user = await prisma.user.findFirst({
            where: { paypalSubscriptionId: subscriptionId },
          });

          if (user) {
            let nextBillingDate = new Date();
            if (user.subscriptionPlan?.includes('monthly')) {
              nextBillingDate.setMonth(nextBillingDate.getMonth() + 1);
            } else if (user.subscriptionPlan?.includes('yearly')) {
              nextBillingDate.setFullYear(nextBillingDate.getFullYear() + 1);
            }

            await prisma.user.update({
              where: { id: user.id },
              data: {
                subscriptionEndsAt: nextBillingDate,
                paymentStatus: 'completed',
                subscriptionStatus: 'active',
              },
            });
          }
        }
        break;
      }

      default:
        console.log('Unhandled webhook event type:', eventType);
    }

    return NextResponse.json({ success: true, received: true });
  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json(
      { success: false, error: 'Webhook processing failed' },
      { status: 500 }
    );
  }
}
