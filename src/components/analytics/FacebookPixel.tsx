'use client';

import { useEffect, useState } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import Script from 'next/script';

/**
 * Facebook Pixel Component
 *
 * Loads the Facebook Pixel script and tracks page views.
 * Works in conjunction with the Conversions API for dual tracking.
 *
 * Features:
 * - Automatic page view tracking on route changes
 * - Event deduplication with server-side events
 * - Test mode detection in development
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

interface FacebookPixelProps {
  pixelId: string;
}

export function FacebookPixel({ pixelId }: FacebookPixelProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPixelLoaded, setIsPixelLoaded] = useState(false);

  // Initialize pixel and track initial page view
  useEffect(() => {
    // Wait for pixel to be available
    const checkPixel = setInterval(() => {
      if (typeof window !== 'undefined' && window.fbq) {
        setIsPixelLoaded(true);
        clearInterval(checkPixel);
      }
    }, 100);

    // Cleanup interval after 5 seconds
    const timeout = setTimeout(() => {
      clearInterval(checkPixel);
    }, 5000);

    return () => {
      clearInterval(checkPixel);
      clearTimeout(timeout);
    };
  }, []);

  // Track page views on route changes (after pixel is loaded)
  useEffect(() => {
    if (isPixelLoaded && typeof window !== 'undefined' && window.fbq) {
      window.fbq('track', 'PageView');
    }
  }, [pathname, searchParams, isPixelLoaded]);

  if (!pixelId) {
    return null;
  }

  return (
    <>
      {/* Facebook Pixel Base Code */}
      <Script
        id="facebook-pixel-init"
        strategy="afterInteractive"
        onLoad={() => {
          // Pixel script loaded, initialize it
          if (typeof window !== 'undefined' && window.fbq) {
            window.fbq('init', pixelId);
            window.fbq('track', 'PageView');
            setIsPixelLoaded(true);
          }
        }}
        dangerouslySetInnerHTML={{
          __html: `
            !function(f,b,e,v,n,t,s)
            {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
            n.callMethod.apply(n,arguments):n.queue.push(arguments)};
            if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
            n.queue=[];t=b.createElement(e);t.async=!0;
            t.src=v;s=b.getElementsByTagName(e)[0];
            s.parentNode.insertBefore(t,s)}(window, document,'script',
            'https://connect.facebook.net/en_US/fbevents.js');
          `,
        }}
      />

      {/* Facebook Pixel NoScript Fallback */}
      <noscript>
        <img
          height="1"
          width="1"
          style={{ display: 'none' }}
          src={`https://www.facebook.com/tr?id=${pixelId}&ev=PageView&noscript=1`}
          alt=""
        />
      </noscript>
    </>
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
