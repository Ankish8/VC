import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';
import { sendContactNotification } from '@/lib/email-templates/contact-notification';
import { trackLead, getClientInfo, generateEventId } from '@/lib/facebook-conversions-api';

const prisma = new PrismaClient();

// Validation schema for contact form
const contactSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100),
  email: z.string().email('Invalid email address').max(255),
  subject: z.string().min(5, 'Subject must be at least 5 characters').max(200),
  message: z.string().min(10, 'Message must be at least 10 characters').max(2000),
  // Facebook tracking parameters (optional)
  fbp: z.string().optional(),
  fbc: z.string().optional(),
  eventId: z.string().optional(),
});

// Simple rate limiting (in-memory, resets on server restart)
const rateLimitMap = new Map<string, { count: number; timestamp: number }>();
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute
const MAX_REQUESTS = 3; // 3 requests per minute per IP

function checkRateLimit(identifier: string): boolean {
  const now = Date.now();
  const userLimit = rateLimitMap.get(identifier);

  if (!userLimit) {
    rateLimitMap.set(identifier, { count: 1, timestamp: now });
    return true;
  }

  // Reset if window has passed
  if (now - userLimit.timestamp > RATE_LIMIT_WINDOW) {
    rateLimitMap.set(identifier, { count: 1, timestamp: now });
    return true;
  }

  // Check if under limit
  if (userLimit.count < MAX_REQUESTS) {
    userLimit.count++;
    return true;
  }

  return false;
}

export async function POST(request: NextRequest) {
  try {
    // Get IP for rate limiting
    const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown';

    // Check rate limit
    if (!checkRateLimit(ip)) {
      return NextResponse.json(
        { error: 'Too many requests. Please try again in a minute.' },
        { status: 429 }
      );
    }

    // Parse and validate request body
    const body = await request.json();
    const validatedData = contactSchema.parse(body);

    const { name, email, subject, message, fbp, fbc, eventId } = validatedData;

    // Save to database
    const contactSubmission = await prisma.contactSubmission.create({
      data: {
        name,
        email,
        subject,
        message,
        status: 'new',
      },
    });

    console.log('📝 Contact submission saved to database:', contactSubmission.id);

    // Send email notification to support team
    try {
      await sendContactNotification({
        name,
        email,
        subject,
        message,
      });
      console.log('📧 Email notification sent to support team');
    } catch (emailError) {
      // Log error but don't fail the request - submission is already saved
      console.error('⚠️ Failed to send email notification:', emailError);
      // Still return success since submission was saved
    }

    // Track Lead event in Facebook Conversions API
    const clientInfo = await getClientInfo();
    await trackLead({
      email,
      contentName: `Contact Form: ${subject}`,
      clientIp: clientInfo.ip,
      clientUserAgent: clientInfo.userAgent,
      eventId: eventId || generateEventId(), // Use client-provided eventId or generate new one
      fbc, // Facebook Click ID from client
      fbp, // Facebook Browser ID from client
    });

    return NextResponse.json(
      {
        success: true,
        message: 'Thank you for contacting us! We will get back to you soon.',
        id: contactSubmission.id,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('❌ Contact form error:', error);

    // Handle validation errors
    if (error instanceof z.ZodError) {
      const validationErrors = error.errors.map((err) => ({
        field: err.path.join('.'),
        message: err.message,
      }));

      return NextResponse.json(
        {
          error: 'Validation failed',
          details: validationErrors,
        },
        { status: 400 }
      );
    }

    // Handle other errors
    return NextResponse.json(
      {
        error: 'Failed to submit contact form. Please try again later.',
      },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
