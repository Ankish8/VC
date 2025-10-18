import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";

/**
 * Root page component that handles initial routing based on authentication status.
 *
 * Behavior:
 * - Authenticated users are redirected to /convert (main application page)
 * - Unauthenticated users are redirected to /login
 *
 * This is a server component that uses NextAuth's auth() function
 * to check authentication status on the server side.
 */
export default async function HomePage() {
  const session = await auth();

  // Redirect based on authentication status
  if (session?.user) {
    // User is authenticated, redirect to convert page
    redirect("/convert");
  } else {
    // User is not authenticated, redirect to login page
    redirect("/login");
  }
}
