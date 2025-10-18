import * as React from "react";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Toaster } from "sonner";

import { ThemeProvider } from "@/components/providers/ThemeProvider";
import { SessionProvider } from "@/components/providers/SessionProvider";
import { auth } from "@/lib/auth";
import "./globals.css";

// Configure Inter font with Latin subset
const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

/**
 * Application metadata configuration
 */
export const metadata: Metadata = {
  title: {
    default: "Raster to SVG Converter",
    template: "%s | Raster to SVG",
  },
  description:
    "Transform raster images into scalable vector graphics (SVG) with AI-powered conversion. High-quality, fast, and easy to use.",
  keywords: [
    "raster to svg",
    "image converter",
    "svg converter",
    "vector graphics",
    "image to svg",
    "png to svg",
    "jpg to svg",
  ],
  authors: [{ name: "Raster to SVG" }],
  creator: "Raster to SVG",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://raster-to-svg.com",
    title: "Raster to SVG Converter",
    description:
      "Transform raster images into scalable vector graphics (SVG) with AI-powered conversion.",
    siteName: "Raster to SVG",
  },
  twitter: {
    card: "summary_large_image",
    title: "Raster to SVG Converter",
    description:
      "Transform raster images into scalable vector graphics (SVG) with AI-powered conversion.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon-16x16.png",
    apple: "/apple-touch-icon.png",
  },
};

interface RootLayoutProps {
  children: React.ReactNode;
}

/**
 * Root layout component that wraps the entire application.
 * Provides theme, session, and notification context to all pages.
 */
export default async function RootLayout({ children }: RootLayoutProps) {
  // Get server-side session for initial render
  const session = await auth();

  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <SessionProvider session={session}>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            {children}
            <Toaster
              position="top-right"
              expand={false}
              richColors
              closeButton
              duration={4000}
            />
          </ThemeProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
