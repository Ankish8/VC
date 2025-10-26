/**
 * Facebook Pixel Helper Functions
 *
 * Provides utility functions for tracking events with the Meta Pixel.
 * The pixel is loaded directly in the layout.tsx file using the official Meta code.
 */

// Type definitions for Facebook Pixel
declare global {
  interface Window {
    fbq: (
      action: 'track' | 'trackCustom' | 'init' | 'set',
      eventName: string,
      parameters?: Record<string, any>,
      eventId?: { eventID: string }
    ) => void;
    _fbq: typeof window.fbq;
  }
}

/**
 * Helper function to track events with deduplication
 * Use this for client-side events that are also tracked server-side
 *
 * @param eventName - Standard or custom event name
 * @param parameters - Event parameters
 * @param eventId - Event ID for deduplication with server-side events
 */
export function trackEvent(
  eventName: string,
  parameters?: Record<string, any>,
  eventId?: string
) {
  if (typeof window !== 'undefined' && window.fbq) {
    if (eventId) {
      // Include eventID for deduplication with server-side events
      window.fbq('track', eventName, parameters || {}, { eventID: eventId });
    } else {
      window.fbq('track', eventName, parameters || {});
    }
  }
}

/**
 * Helper to get Facebook browser ID (fbp) from cookie
 * Used for server-side event tracking
 */
export function getFbp(): string | undefined {
  if (typeof document === 'undefined') return undefined;

  const match = document.cookie.match(/(?:^|;)\s*_fbp=([^;]+)/);
  return match ? match[1] : undefined;
}

/**
 * Helper to get Facebook click ID (fbc) from cookie
 * Used for server-side event tracking
 */
export function getFbc(): string | undefined {
  if (typeof document === 'undefined') return undefined;

  const match = document.cookie.match(/(?:^|;)\s*_fbc=([^;]+)/);
  return match ? match[1] : undefined;
}

/**
 * Get both Facebook IDs for server-side tracking
 */
export function getFacebookIds(): { fbp?: string; fbc?: string } {
  return {
    fbp: getFbp(),
    fbc: getFbc(),
  };
}
