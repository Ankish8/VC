"use client";

import { useEffect } from "react";
import { useTheme } from "next-themes";

interface LandingPageWrapperProps {
  children: React.ReactNode;
}

export function LandingPageWrapper({ children }: LandingPageWrapperProps) {
  const { setTheme } = useTheme();

  useEffect(() => {
    // Force light mode on landing page
    setTheme("light");
  }, [setTheme]);

  return (
    <div className="landing-page">
      {children}
    </div>
  );
}
