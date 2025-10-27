'use client';

import { useEffect } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import posthog from 'posthog-js';

export function PostHogProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    // Initialize PostHog
    if (typeof window !== 'undefined') {
      posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY!, {
        api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST || 'https://us.i.posthog.com',
        person_profiles: 'identified_only',
        capture_pageview: false, // We'll manually capture pageviews
        capture_pageleave: true,

        // Session Replay Configuration
        session_recording: {
          enabled: true,
          recordCrossOriginIframes: false,
          maskAllInputs: true, // Mask all input fields by default
          maskInputOptions: {
            password: true,
            email: false, // You can show emails if needed
          },
          maskTextSelector: '[data-ph-mask]', // Mask elements with this data attribute
          blockClass: 'ph-no-capture', // Don't capture elements with this class
          blockSelector: '[data-ph-no-capture]', // Don't capture elements with this attribute
          ignoreClass: 'ph-ignore', // Ignore changes to these elements
          maskTextClass: 'ph-mask-text', // Mask text in these elements

          // Capture console logs and network requests
          recordHeaders: true,
          recordBody: true,
          recordPerformance: true,
          recordCanvas: false, // Disable canvas recording for performance
          sampling: {
            // Record 100% of sessions (adjust based on traffic)
            minimumDuration: 1000, // Only record sessions longer than 1 second
          },
        },

        // Automatically capture clicks, form submissions, and more
        autocapture: {
          dom_event_allowlist: ['click', 'change', 'submit'],
          url_allowlist: [process.env.NEXT_PUBLIC_APP_URL!],
        },

        // Performance optimization
        loaded: (posthog) => {
          if (process.env.NODE_ENV === 'development') {
            console.log('PostHog loaded successfully');
          }
        },
      });
    }

    return () => {
      // Cleanup on unmount
      if (typeof window !== 'undefined') {
        posthog.opt_out_capturing();
      }
    };
  }, []);

  // Track page views
  useEffect(() => {
    if (pathname && typeof window !== 'undefined') {
      let url = window.origin + pathname;
      if (searchParams && searchParams.toString()) {
        url = url + `?${searchParams.toString()}`;
      }
      posthog.capture('$pageview', {
        $current_url: url,
      });
    }
  }, [pathname, searchParams]);

  return <>{children}</>;
}
