/**
 * Facebook Pixel Helper Functions
 *
 * Provides utility functions for tracking events with Google Tag Manager.
 * GTM is loaded in layout.tsx and handles Facebook Pixel tracking.
 */

// Type definitions for GTM dataLayer
declare global {
  interface Window {
    dataLayer: any[];
    fbq?: (
      action: 'track' | 'trackCustom' | 'init' | 'set',
      eventName: string,
      parameters?: Record<string, any>,
      eventId?: { eventID: string }
    ) => void;
  }
}

/**
 * Helper function to track events through GTM dataLayer
 * GTM will handle sending to Facebook Pixel
 *
 * @param eventName - Standard or custom event name (e.g., 'InitiateCheckout', 'Purchase')
 * @param parameters - Event parameters (e.g., { value: 39, currency: 'USD' })
 * @param eventId - Event ID for deduplication with server-side events
 */
export function trackEvent(
  eventName: string,
  parameters?: Record<string, any>,
  eventId?: string
) {
  if (typeof window !== 'undefined' && window.dataLayer) {
    // Push event to GTM dataLayer
    window.dataLayer.push({
      event: 'facebook_event',
      facebook_event_name: eventName,
      facebook_event_params: parameters || {},
      facebook_event_id: eventId,
    });
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
