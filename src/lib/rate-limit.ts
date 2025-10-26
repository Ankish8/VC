/**
 * Simple in-memory rate limiting utility
 * Resets on server restart
 */

interface RateLimitEntry {
  count: number;
  timestamp: number;
}

const rateLimitMap = new Map<string, RateLimitEntry>();

export interface RateLimitConfig {
  windowMs: number; // Time window in milliseconds
  maxRequests: number; // Maximum requests per window
}

/**
 * Check if a request should be rate limited
 * @param identifier - Unique identifier (email, IP, etc.)
 * @param config - Rate limit configuration
 * @returns true if request is allowed, false if rate limited
 */
export function checkRateLimit(
  identifier: string,
  config: RateLimitConfig = { windowMs: 60 * 60 * 1000, maxRequests: 3 } // Default: 3 per hour
): boolean {
  const now = Date.now();
  const userLimit = rateLimitMap.get(identifier);

  if (!userLimit) {
    rateLimitMap.set(identifier, { count: 1, timestamp: now });
    return true;
  }

  // Reset if window has passed
  if (now - userLimit.timestamp > config.windowMs) {
    rateLimitMap.set(identifier, { count: 1, timestamp: now });
    return true;
  }

  // Check if under limit
  if (userLimit.count < config.maxRequests) {
    userLimit.count++;
    return true;
  }

  return false;
}

/**
 * Get remaining time until rate limit resets (in seconds)
 * @param identifier - Unique identifier
 * @param windowMs - Time window in milliseconds
 * @returns Seconds until reset, or 0 if no active limit
 */
export function getRateLimitResetTime(
  identifier: string,
  windowMs: number = 60 * 60 * 1000
): number {
  const userLimit = rateLimitMap.get(identifier);
  if (!userLimit) return 0;

  const now = Date.now();
  const elapsed = now - userLimit.timestamp;
  const remaining = Math.max(0, windowMs - elapsed);

  return Math.ceil(remaining / 1000);
}

/**
 * Clear rate limit for an identifier (useful for testing or manual reset)
 */
export function clearRateLimit(identifier: string): void {
  rateLimitMap.delete(identifier);
}

/**
 * Clean up expired entries (optional, for memory management)
 * Call this periodically if you have many identifiers
 */
export function cleanupExpiredEntries(windowMs: number = 60 * 60 * 1000): void {
  const now = Date.now();
  for (const [identifier, entry] of rateLimitMap.entries()) {
    if (now - entry.timestamp > windowMs) {
      rateLimitMap.delete(identifier);
    }
  }
}
