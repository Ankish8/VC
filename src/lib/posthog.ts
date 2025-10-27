import posthog from 'posthog-js';

/**
 * PostHog utility functions for event tracking and user management
 */

/**
 * Identify a user with PostHog
 * Call this after successful login/signup
 */
export function identifyUser(userId: string, properties?: Record<string, any>) {
  if (typeof window !== 'undefined') {
    posthog.identify(userId, properties);
  }
}

/**
 * Track a custom event
 * @param eventName - Name of the event (e.g., 'conversion_started', 'image_uploaded')
 * @param properties - Additional event properties
 */
export function trackEvent(eventName: string, properties?: Record<string, any>) {
  if (typeof window !== 'undefined') {
    posthog.capture(eventName, properties);
  }
}

/**
 * Set user properties
 * Use this to update user information (email, plan, etc.)
 */
export function setUserProperties(properties: Record<string, any>) {
  if (typeof window !== 'undefined') {
    posthog.people.set(properties);
  }
}

/**
 * Reset PostHog on logout
 * Call this when user signs out
 */
export function resetPostHog() {
  if (typeof window !== 'undefined') {
    posthog.reset();
  }
}

/**
 * Start a session recording manually
 * Session recordings start automatically, but you can force-start if needed
 */
export function startSessionRecording() {
  if (typeof window !== 'undefined') {
    posthog.startSessionRecording();
  }
}

/**
 * Stop the current session recording
 * Use this for privacy-sensitive pages
 */
export function stopSessionRecording() {
  if (typeof window !== 'undefined') {
    posthog.stopSessionRecording();
  }
}

/**
 * Check if feature flag is enabled
 * @param flagKey - The feature flag key
 * @returns boolean indicating if flag is enabled
 */
export function isFeatureEnabled(flagKey: string): boolean {
  if (typeof window === 'undefined') return false;
  return posthog.isFeatureEnabled(flagKey) || false;
}

/**
 * Get feature flag variant
 * @param flagKey - The feature flag key
 * @returns The variant value or undefined
 */
export function getFeatureFlag(flagKey: string): string | boolean | undefined {
  if (typeof window === 'undefined') return undefined;
  return posthog.getFeatureFlag(flagKey);
}

export default posthog;
