"use client";

import { useEffect } from "react";
import { useTheme } from "next-themes";

interface DashboardWrapperProps {
  children: React.ReactNode;
}

export function DashboardWrapper({ children }: DashboardWrapperProps) {
  const { setTheme, resolvedTheme } = useTheme();

  useEffect(() => {
    // On mount, if theme is light due to landing page, restore to system default
    // This allows the theme toggle to work properly
    const storedTheme = localStorage.getItem("theme");
    if (!storedTheme || storedTheme === "light") {
      // Set to system to allow theme toggle to work
      setTheme("system");
    }
  }, []);

  return <>{children}</>;
}
