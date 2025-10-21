import { getCurrentUser } from "@/lib/session";
import { NextResponse } from "next/server";

/**
 * Server-side admin guard helper
 * Checks if the current user is an admin
 * Returns the user if admin, throws error if not
 */
export async function requireAdmin() {
  const user = await getCurrentUser();

  if (!user) {
    throw new Error("Authentication required. Please log in.");
  }

  const isAdmin = (user as any).isAdmin;

  if (!isAdmin) {
    throw new Error("Admin access required. You do not have permission to access this resource.");
  }

  return user;
}

/**
 * API route helper for admin protection
 * Returns an error response if not admin, otherwise returns null
 */
export async function checkAdminAccess() {
  try {
    await requireAdmin();
    return null; // No error, user is admin
  } catch (error) {
    const message = error instanceof Error ? error.message : "Admin access required";
    return NextResponse.json(
      { error: message },
      { status: message.includes("Authentication") ? 401 : 403 }
    );
  }
}
