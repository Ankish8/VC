import { NextRequest, NextResponse } from 'next/server';
import { redirect } from 'next/navigation';
import { getSubscriptionDetails } from '@/lib/paypal';
import { prisma } from '@/lib/db';
import { hash } from 'bcryptjs';
import { Resend } from 'resend';
import { initializeCreditsForSubscription } from '@/lib/credits';
import { trackSubscribe, getClientInfo, generateEventId } from '@/lib/facebook-conversions-api';

const resend = new Resend(process.env.RESEND_API_KEY);
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

/**
 * Get subscription value based on plan type
 */
function getSubscriptionValue(planType: string): number {
  if (planType.includes('starter_monthly')) return 10;
  if (planType.includes('starter_yearly')) return 8;
  if (planType.includes('professional_monthly')) return 19;
  if (planType.includes('professional_yearly')) return 15;
  return 10; // Default fallback
}

/**
 * Calculate predicted LTV based on plan type
 */
function getPredictedLTV(planType: string): number {
  if (planType.includes('yearly')) {
    // Assume 3-year retention for yearly plans
    return getSubscriptionValue(planType) * 12 * 3;
  } else {
    // Assume 12-month retention for monthly plans
    return getSubscriptionValue(planType) * 12;
  }
}

/**
 * GET /api/payment/capture-subscription
 * Handles the return from PayPal after user approves subscription
 */
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const subscriptionId = searchParams.get('subscription_id');
  const planType = searchParams.get('plan');

  if (!subscriptionId || !planType) {
    redirect('/?payment=error&message=Missing subscription information');
  }

  try {
    // Get subscription details from PayPal
    const subscription = await getSubscriptionDetails(subscriptionId);

    if (subscription.status !== 'ACTIVE') {
      redirect('/?payment=error&message=Subscription not active');
    }

    const email = subscription.subscriber.email_address;
    const payerId = subscription.subscriber.payer_id;
    const firstName = subscription.subscriber.name.given_name;
    const lastName = subscription.subscriber.name.surname;
    const fullName = `${firstName} ${lastName}`;

    // Calculate next billing date
    let nextBillingDate = new Date();
    if (planType.includes('monthly')) {
      nextBillingDate.setMonth(nextBillingDate.getMonth() + 1);
    } else if (planType.includes('yearly')) {
      nextBillingDate.setFullYear(nextBillingDate.getFullYear() + 1);
    }

    // Check if user already exists
    let user = await prisma.user.findUnique({
      where: { email },
    });

    let isNewUser = false;

    if (user) {
      // Update existing user's subscription
      const subscriptionStartDate = new Date();
      const subscriptionTypeValue = planType.includes('yearly') ? 'yearly' : 'monthly';

      user = await prisma.user.update({
        where: { email },
        data: {
          paypalSubscriptionId: subscriptionId,
          subscriptionStatus: 'active',
          subscriptionPlan: planType,
          subscriptionEndsAt: nextBillingDate,
          subscriptionStartedAt: subscriptionStartDate,
          paymentStatus: 'completed',
          subscriptionType: subscriptionTypeValue,
        },
      });

      // Initialize credits for the subscription
      await initializeCreditsForSubscription(
        user.id,
        planType,
        subscriptionTypeValue,
        subscriptionStartDate
      );

      // Track Subscribe event in Facebook Conversions API
      const clientInfo = await getClientInfo();
      const eventId = generateEventId();
      await trackSubscribe({
        email,
        userId: user.id,
        planName: planType.replace('_', ' '),
        value: getSubscriptionValue(planType),
        currency: 'USD',
        predictedLtv: getPredictedLTV(planType),
        clientIp: clientInfo.ip,
        clientUserAgent: clientInfo.userAgent,
        eventId,
      });

      redirect(
        `/?payment=success&existing=true&subscription=${planType.replace('_', ' ')}`
      );
    } else {
      // Create new user account
      isNewUser = true;

      // Generate temporary password
      const tempPassword = Math.random().toString(36).slice(-12);
      const hashedPassword = await hash(tempPassword, 10);
      const subscriptionStartDate = new Date();
      const subscriptionTypeValue = planType.includes('yearly') ? 'yearly' : 'monthly';

      user = await prisma.user.create({
        data: {
          email,
          password: hashedPassword,
          name: fullName,
          paypalSubscriptionId: subscriptionId,
          paypalPayerId: payerId,
          subscriptionStatus: 'active',
          subscriptionPlan: planType,
          subscriptionEndsAt: nextBillingDate,
          subscriptionStartedAt: subscriptionStartDate,
          paymentStatus: 'completed',
          subscriptionType: subscriptionTypeValue,
          mustChangePassword: true,
        },
      });

      // Initialize credits for the new subscription
      await initializeCreditsForSubscription(
        user.id,
        planType,
        subscriptionTypeValue,
        subscriptionStartDate
      );

      // Send welcome email with credentials
      try {
        await resend.emails.send({
          from: 'VectorCraft <noreply@yourdomain.com>',
          to: email,
          subject: 'Welcome to VectorCraft - Your Account Details',
          html: `
            <h1>Welcome to VectorCraft!</h1>
            <p>Hi ${firstName},</p>
            <p>Thank you for subscribing to VectorCraft ${planType.replace('_', ' ').toUpperCase()}!</p>

            <h2>Your Account Details:</h2>
            <p><strong>Email:</strong> ${email}</p>
            <p><strong>Temporary Password:</strong> ${tempPassword}</p>

            <p>Please log in and change your password immediately for security.</p>

            <p><a href="${APP_URL}/login" style="background-color: #4F46E5; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">Log In Now</a></p>

            <p>Your subscription will automatically renew ${planType.includes('yearly') ? 'yearly' : 'monthly'}.</p>

            <p>Best regards,<br>The VectorCraft Team</p>
          `,
        });
      } catch (emailError) {
        console.error('Failed to send welcome email:', emailError);
        // Don't fail the whole process if email fails
      }

      // Track Subscribe event in Facebook Conversions API
      const clientInfo = await getClientInfo();
      const eventId = generateEventId();
      await trackSubscribe({
        email,
        userId: user.id,
        planName: planType.replace('_', ' '),
        value: getSubscriptionValue(planType),
        currency: 'USD',
        predictedLtv: getPredictedLTV(planType),
        clientIp: clientInfo.ip,
        clientUserAgent: clientInfo.userAgent,
        eventId,
      });

      redirect(
        `/?payment=success&newUser=true&email=${encodeURIComponent(email)}&subscription=${planType.replace('_', ' ')}&txn=${encodeURIComponent(subscriptionId)}`
      );
    }
  } catch (error: any) {
    console.error('Capture subscription error:', error);
    redirect(
      `/?payment=error&message=${encodeURIComponent(error.message || 'Subscription capture failed')}`
    );
  }
}
