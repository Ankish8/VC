import * as React from "react";
import { Navbar } from "@/components/layout/Navbar";

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
  return (
    <div className="relative min-h-screen flex flex-col bg-gradient-to-b from-background to-muted/20">
      {/* Navigation Bar */}
      <Navbar />

      {/* Main Content Area - Centered */}
      <main className="flex-1 flex items-start justify-center">
        <div className="w-full max-w-6xl px-4 py-12 md:py-16">
          {children}
        </div>
      </main>
    </div>
  );
}
