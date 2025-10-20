import * as React from "react";
import { Navbar } from "@/components/layout/Navbar";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { auth } from "@/lib/auth";
import ChangePasswordModal from "@/components/auth/ChangePasswordModal";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

/**
 * Dashboard layout component that wraps all dashboard pages.
 * Clean, centered layout with top navigation only.
 *
 * Applied to routes: /convert, /history
 */
export default async function DashboardLayout({ children }: DashboardLayoutProps) {
  const session = await auth();
  const mustChangePassword = (session?.user as any)?.mustChangePassword ?? false;

  return (
    <div className="relative min-h-screen flex flex-col bg-gradient-to-b from-background to-muted/20">
      {/* Password Change Modal - Shows on first login */}
      {mustChangePassword && session?.user?.email && (
        <ChangePasswordModal email={session.user.email} />
      )}

      {/* Navigation Bar */}
      <Navbar />

      {/* Main Content Area - Match Header Width */}
      <main className="flex-1 w-full">
        <div className="container mx-auto px-4 py-12 md:py-16">
          <ErrorBoundary>
            {children}
          </ErrorBoundary>
        </div>
      </main>
    </div>
  );
}
