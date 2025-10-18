import * as React from "react";
import { Navbar } from "@/components/layout/Navbar";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

/**
 * Dashboard layout component that wraps all dashboard pages.
 * Includes the navigation bar and provides consistent spacing and structure.
 *
 * Applied to routes: /convert, /history
 */
export default function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <div className="relative min-h-screen flex flex-col">
      {/* Navigation Bar */}
      <Navbar />

      {/* Main Content Area */}
      <main className="flex-1">
        <div className="container mx-auto px-4 py-6 md:py-8">
          {children}
        </div>
      </main>

      {/* Footer (optional) */}
      <footer className="border-t py-6 md:py-8">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>Raster to SVG Converter - Transform images into scalable vector graphics</p>
        </div>
      </footer>
    </div>
  );
}
