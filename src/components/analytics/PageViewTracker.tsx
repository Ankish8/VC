'use client';

import { useEffect } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';

/**
 * PageView Tracker Component
 *
 * Tracks page views on route changes using the Facebook Pixel.
 * This component should be included in the layout to track all page navigations.
 */
export function PageViewTracker() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    // Track page view when route changes
    if (typeof window !== 'undefined' && window.fbq) {
      window.fbq('track', 'PageView');
    }
  }, [pathname, searchParams]);

  return null;
}

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
