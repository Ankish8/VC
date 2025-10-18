import { auth } from "@/lib/auth";

/**
 * Get the current authenticated user session
 * This can be used in Server Components, Server Actions, and API Routes
 * @returns The current session or null if not authenticated
 */
export async function getCurrentUser() {
  const session = await auth();
  return session?.user ?? null;
}

/**
 * Get the current session
 * @returns The current session or null if not authenticated
 */
export async function getSession() {
  return await auth();
}

/**
 * Verify if the user is authenticated
 * @returns true if user is authenticated, false otherwise
 */
export async function isAuthenticated() {
  const session = await auth();
  return !!session?.user;
}
