/**
 * Client-side Facebook Tracking Utilities
 *
 * Provides helper functions to read Facebook cookies (_fbp, _fbc) from the browser
 * and prepare tracking data for server-side API calls.
 *
 * These cookies are automatically set by Facebook Pixel/GTM and are critical for
 * improving event match quality in Facebook Ads Manager.
 */

// Type declarations for window properties
declare global {
  interface Window {
    dataLayer?: any[];
    fbq?: (...args: any[]) => void;
  }
}

/**
 * Get a cookie value by name
 * @param name - Cookie name to retrieve
 * @returns Cookie value or undefined if not found
 */
function getCookie(name: string): string | undefined {
  if (typeof document === 'undefined') return undefined;

  const match = document.cookie.match(new RegExp('(^|;\\s*)' + name + '=([^;]+)'));
  return match ? decodeURIComponent(match[2]) : undefined;
}

/**
 * Get Facebook Browser ID (fbp) from cookie
 * This cookie is set by Facebook Pixel and identifies the browser
 *
 * @returns Facebook Browser ID or undefined
 */
export function getFbp(): string | undefined {
  return getCookie('_fbp');
}

/**
 * Get Facebook Click ID (fbc) from cookie
 * This cookie is set when a user clicks on a Facebook ad
 * Contains the fbclid parameter from the URL
 *
 * @returns Facebook Click ID or undefined
 */
export function getFbc(): string | undefined {
  // First try to get from cookie
  const fbcCookie = getCookie('_fbc');
  if (fbcCookie) return fbcCookie;

  // If not in cookie, check if fbclid is in current URL
  // and construct the fbc value (format: fb.1.timestamp.fbclid)
  if (typeof window === 'undefined') return undefined;

  const urlParams = new URLSearchParams(window.location.search);
  const fbclid = urlParams.get('fbclid');

  if (fbclid) {
    // Construct fbc value: fb.version.timestamp.fbclid
    return `fb.1.${Date.now()}.${fbclid}`;
  }

  return undefined;
}

/**
 * Get both Facebook IDs for tracking
 * @returns Object with fbp and fbc (if available)
 */
export function getFacebookIds(): { fbp?: string; fbc?: string } {
  return {
    fbp: getFbp(),
    fbc: getFbc(),
  };
}

/**
 * Generate a unique event ID for deduplication
 * Used to deduplicate events sent from both browser (Pixel) and server (CAPI)
 *
 * @returns Unique event ID
 */
export function generateEventId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Track an event with Facebook Pixel (via GTM dataLayer)
 * This fires the browser-side event
 *
 * @param eventName - Facebook event name (e.g., 'Lead', 'Purchase')
 * @param parameters - Event parameters (e.g., { value: 39, currency: 'USD' })
 * @param eventId - Optional event ID for deduplication with server-side event
 */
export function trackFacebookEvent(
  eventName: string,
  parameters?: Record<string, any>,
  eventId?: string
): void {
  if (typeof window === 'undefined') return;

  // Push to GTM dataLayer
  if (window.dataLayer) {
    window.dataLayer.push({
      event: 'facebook_event',
      facebook_event_name: eventName,
      facebook_event_params: parameters || {},
      facebook_event_id: eventId,
    });
  }

  // Also try direct fbq if available (backup)
  if (window.fbq) {
    if (eventId) {
      window.fbq('track', eventName, parameters || {}, { eventID: eventId });
    } else {
      window.fbq('track', eventName, parameters || {});
    }
  }
}
