import crypto from 'crypto';
import { headers } from 'next/headers';

/**
 * Facebook Conversions API Integration
 * Sends server-side conversion events to Facebook for improved tracking and attribution
 *
 * @see https://developers.facebook.com/docs/marketing-api/conversions-api
 */

// Facebook Pixel ID and Access Token from environment variables
const PIXEL_ID = process.env.NEXT_PUBLIC_FB_PIXEL_ID;
const ACCESS_TOKEN = process.env.FB_CONVERSION_API_TOKEN;
const GRAPH_API_VERSION = 'v21.0'; // Latest as of 2025

/**
 * Standard Facebook event names
 */
export type FacebookEventName =
  | 'Purchase'
  | 'CompleteRegistration'
  | 'Lead'
  | 'InitiateCheckout'
  | 'ViewContent'
  | 'AddPaymentInfo'
  | 'Subscribe'
  | string; // Allow custom events

/**
 * User data for Facebook event matching
 */
interface UserData {
  email?: string;
  phone?: string;
  firstName?: string;
  lastName?: string;
  city?: string;
  state?: string;
  zip?: string;
  country?: string;
  externalId?: string; // User ID from your database
  clientIpAddress?: string;
  clientUserAgent?: string;
  fbc?: string; // Facebook click ID from cookie
  fbp?: string; // Facebook browser ID from cookie
}

/**
 * Custom data for specific events
 */
interface CustomData {
  value?: number;
  currency?: string;
  contentName?: string;
  contentCategory?: string;
  contentIds?: string[];
  contents?: Array<{ id: string; quantity: number; item_price?: number }>;
  numItems?: number;
  status?: string;
  predictedLtv?: number;
  subscriptionPlan?: string;
  [key: string]: any;
}

/**
 * Facebook Conversions API Event
 */
interface FacebookEvent {
  event_name: FacebookEventName;
  event_time: number;
  event_id?: string;
  event_source_url?: string;
  action_source: 'website';
  user_data: {
    em?: (string | null)[]; // Hashed email
    ph?: (string | null)[]; // Hashed phone
    fn?: (string | null)[]; // Hashed first name
    ln?: (string | null)[]; // Hashed last name
    ct?: (string | null)[]; // Hashed city
    st?: (string | null)[]; // Hashed state
    zp?: (string | null)[]; // Hashed zip
    country?: (string | null)[]; // Hashed country
    external_id?: (string | null)[]; // Hashed external ID
    client_ip_address?: string;
    client_user_agent?: string;
    fbc?: string;
    fbp?: string;
  };
  attribution_data?: {
    attribution_share?: string;
  };
  custom_data?: {
    currency?: string;
    value?: string | number;
    [key: string]: any;
  };
  original_event_data?: {
    event_name: FacebookEventName;
    event_time: number;
  };
}

/**
 * SHA256 hash function for user data normalization
 * Facebook requires hashed user data for privacy
 */
function hashData(data: string): string {
  return crypto
    .createHash('sha256')
    .update(data.toLowerCase().trim())
    .digest('hex');
}

/**
 * Normalize and hash user data according to Facebook's requirements
 * All PII fields are returned as arrays, with null if not provided
 */
function normalizeUserData(userData: UserData): FacebookEvent['user_data'] {
  const normalized: FacebookEvent['user_data'] = {
    // PII fields as arrays (Facebook expects array format)
    em: userData.email ? [hashData(userData.email)] : [null],
    ph: userData.phone ? [hashData(userData.phone.replace(/\D/g, ''))] : [null],
    fn: userData.firstName ? [hashData(userData.firstName)] : undefined,
    ln: userData.lastName ? [hashData(userData.lastName)] : undefined,
    ct: userData.city ? [hashData(userData.city)] : undefined,
    st: userData.state ? [hashData(userData.state)] : undefined,
    zp: userData.zip ? [hashData(userData.zip)] : undefined,
    country: userData.country ? [hashData(userData.country)] : undefined,
    external_id: userData.externalId ? [hashData(userData.externalId)] : undefined,

    // Non-PII fields (sent as-is, not hashed)
    client_ip_address: userData.clientIpAddress,
    client_user_agent: userData.clientUserAgent,
    fbc: userData.fbc,
    fbp: userData.fbp,
  };

  return normalized;
}

/**
 * Extract client information from Next.js request headers
 */
export async function getClientInfo(): Promise<{ ip?: string; userAgent?: string }> {
  try {
    const headersList = await headers();

    const ip =
      headersList.get('x-forwarded-for')?.split(',')[0]?.trim() ||
      headersList.get('x-real-ip') ||
      undefined;

    const userAgent = headersList.get('user-agent') || undefined;

    return { ip, userAgent };
  } catch (error) {
    console.error('Error extracting client info:', error);
    return {};
  }
}

/**
 * Generate a unique event ID for deduplication
 * Facebook uses this to deduplicate events sent from both browser and server
 */
export function generateEventId(): string {
  return `${Date.now()}-${crypto.randomBytes(8).toString('hex')}`;
}

/**
 * Send conversion event to Facebook Conversions API
 *
 * @param eventName - Standard or custom event name
 * @param userData - User information for event matching
 * @param customData - Event-specific data (e.g., purchase value)
 * @param eventId - Optional event ID for deduplication with browser pixel
 * @param eventSourceUrl - URL where the event occurred
 * @returns Promise with API response
 */
export async function trackConversionEvent(
  eventName: FacebookEventName,
  userData: UserData,
  customData?: CustomData,
  eventId?: string,
  eventSourceUrl?: string
): Promise<{ success: boolean; error?: string }> {
  // Check if Conversions API is configured
  if (!PIXEL_ID || !ACCESS_TOKEN) {
    console.warn('Facebook Conversions API not configured. Skipping event:', eventName);
    return { success: false, error: 'Not configured' };
  }

  try {
    const eventTime = Math.floor(Date.now() / 1000); // Unix timestamp in seconds

    const event: FacebookEvent = {
      event_name: eventName,
      event_time: eventTime,
      event_id: eventId,
      event_source_url: eventSourceUrl || process.env.NEXT_PUBLIC_APP_URL || 'https://thevectorcraft.com',
      action_source: 'website',
      user_data: normalizeUserData(userData),

      // Attribution data for better attribution modeling
      attribution_data: {
        attribution_share: '1.0', // 100% attribution to this touchpoint
      },

      // Original event data for deduplication
      original_event_data: {
        event_name: eventName,
        event_time: eventTime,
      },
    };

    // Add custom data if provided (ensure value is a string for consistency)
    if (customData && Object.keys(customData).length > 0) {
      event.custom_data = {
        ...customData,
        // Ensure value is formatted as string if provided
        value: customData.value !== undefined ? String(customData.value) : undefined,
      };
    }

    const url = `https://graph.facebook.com/${GRAPH_API_VERSION}/${PIXEL_ID}/events`;

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        data: [event],
        access_token: ACCESS_TOKEN,
        test_event_code: process.env.FB_TEST_EVENT_CODE || (process.env.NODE_ENV === 'development' ? 'TEST92674' : undefined),
      }),
    });

    const result = await response.json();

    if (!response.ok) {
      console.error('Facebook Conversions API Error:', result);
      return {
        success: false,
        error: result.error?.message || 'Unknown error'
      };
    }

    // Log successful event with detailed response info for verification
    console.log(`✓ Facebook Conversions API - ${eventName}`, {
      eventsReceived: result.events_received,
      eventId: eventId,
      fbtrace_id: result.fbtrace_id,
      timestamp: new Date().toISOString(),
    });

    return { success: true };
  } catch (error) {
    console.error('Error sending Facebook Conversion Event:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

/**
 * Track Purchase event
 * Called when a user completes a payment
 */
export async function trackPurchase(params: {
  email: string;
  userId?: string;
  value: number;
  currency?: string;
  transactionId?: string;
  subscriptionPlan?: string;
  clientIp?: string;
  clientUserAgent?: string;
  eventId?: string;
  fbc?: string;
  fbp?: string;
}) {
  return trackConversionEvent(
    'Purchase',
    {
      email: params.email,
      externalId: params.userId,
      clientIpAddress: params.clientIp,
      clientUserAgent: params.clientUserAgent,
      fbc: params.fbc,
      fbp: params.fbp,
    },
    {
      value: params.value,
      currency: params.currency || 'USD',
      content_name: params.subscriptionPlan ? `${params.subscriptionPlan} Plan` : 'Lifetime Access',
      content_type: params.subscriptionPlan ? 'subscription' : 'product',
      subscriptionPlan: params.subscriptionPlan,
      transactionId: params.transactionId,
    },
    params.eventId
  );
}

/**
 * Track CompleteRegistration event
 * Called when a user completes account registration
 */
export async function trackRegistration(params: {
  email: string;
  userId?: string;
  registrationMethod?: string;
  clientIp?: string;
  clientUserAgent?: string;
  eventId?: string;
  fbc?: string;
  fbp?: string;
}) {
  return trackConversionEvent(
    'CompleteRegistration',
    {
      email: params.email,
      externalId: params.userId,
      clientIpAddress: params.clientIp,
      clientUserAgent: params.clientUserAgent,
      fbc: params.fbc,
      fbp: params.fbp,
    },
    {
      content_name: 'Account Registration',
      status: 'completed',
      registrationMethod: params.registrationMethod || 'email',
    },
    params.eventId
  );
}

/**
 * Track Lead event
 * Called when a user submits a contact form or shows purchase intent
 */
export async function trackLead(params: {
  email?: string;
  contentName?: string;
  clientIp?: string;
  clientUserAgent?: string;
  eventId?: string;
  fbc?: string;
  fbp?: string;
}) {
  return trackConversionEvent(
    'Lead',
    {
      email: params.email,
      clientIpAddress: params.clientIp,
      clientUserAgent: params.clientUserAgent,
      fbc: params.fbc,
      fbp: params.fbp,
    },
    {
      content_name: params.contentName || 'Contact Form',
    },
    params.eventId
  );
}

/**
 * Track InitiateCheckout event
 * Called when a user clicks on a pricing plan
 */
export async function trackInitiateCheckout(params: {
  email?: string;
  planName?: string;
  value?: number;
  currency?: string;
  clientIp?: string;
  clientUserAgent?: string;
  eventId?: string;
  fbc?: string;
  fbp?: string;
}) {
  return trackConversionEvent(
    'InitiateCheckout',
    {
      email: params.email,
      clientIpAddress: params.clientIp,
      clientUserAgent: params.clientUserAgent,
      fbc: params.fbc,
      fbp: params.fbp,
    },
    {
      content_name: params.planName,
      value: params.value,
      currency: params.currency || 'USD',
    },
    params.eventId
  );
}

/**
 * Track Subscribe event
 * Called when a user subscribes to a recurring plan
 */
export async function trackSubscribe(params: {
  email: string;
  userId?: string;
  planName: string;
  value: number;
  currency?: string;
  predictedLtv?: number;
  clientIp?: string;
  clientUserAgent?: string;
  eventId?: string;
  fbc?: string;
  fbp?: string;
}) {
  return trackConversionEvent(
    'Subscribe',
    {
      email: params.email,
      externalId: params.userId,
      clientIpAddress: params.clientIp,
      clientUserAgent: params.clientUserAgent,
      fbc: params.fbc,
      fbp: params.fbp,
    },
    {
      value: params.value,
      currency: params.currency || 'USD',
      content_name: params.planName,
      predicted_ltv: params.predictedLtv,
      subscriptionPlan: params.planName,
    },
    params.eventId
  );
}
