'use client';

import { useEffect, useState } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import ReactPixel from 'react-facebook-pixel';

/**
 * Facebook Pixel Component
 *
 * Loads the Facebook Pixel script and tracks page views.
 * Works in conjunction with the Conversions API for dual tracking.
 *
 * Features:
 * - Automatic page view tracking on route changes
 * - Event deduplication with server-side events
 * - Uses react-facebook-pixel package for reliable tracking
 */

interface FacebookPixelProps {
  pixelId: string;
}

export function FacebookPixel({ pixelId }: FacebookPixelProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [initialized, setInitialized] = useState(false);

  // Initialize pixel on mount
  useEffect(() => {
    if (!pixelId || initialized) return;

    console.log('[Facebook Pixel] Initializing with ID:', pixelId);

    try {
      // Initialize the pixel
      ReactPixel.init(pixelId, undefined, {
        autoConfig: true,
        debug: true, // Enable debug mode to see what's happening
      });

      console.log('[Facebook Pixel] Initialized successfully');

      // Track initial page view
      ReactPixel.pageView();
      console.log('[Facebook Pixel] Initial PageView tracked');

      setInitialized(true);
    } catch (error) {
      console.error('[Facebook Pixel] Initialization error:', error);
    }
  }, [pixelId, initialized]);

  // Track page views on route changes
  useEffect(() => {
    if (!initialized) return;

    console.log('[Facebook Pixel] Route changed, tracking PageView');
    ReactPixel.pageView();
  }, [pathname, searchParams, initialized]);

  if (!pixelId) {
    console.warn('[Facebook Pixel] No pixel ID provided');
    return null;
  }

  return (
    <noscript>
      <img
        height="1"
        width="1"
        style={{ display: 'none' }}
        src={`https://www.facebook.com/tr?id=${pixelId}&ev=PageView&noscript=1`}
        alt=""
      />
    </noscript>
  );
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
  if (eventId) {
    // Include eventID for deduplication with server-side events
    ReactPixel.track(eventName, parameters || {}, { eventID: eventId });
  } else {
    ReactPixel.track(eventName, parameters || {});
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
