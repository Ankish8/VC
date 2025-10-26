import * as React from "react";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Toaster } from "sonner";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";

import { ThemeProvider } from "@/components/providers/ThemeProvider";
import { SessionProvider } from "@/components/providers/SessionProvider";
import { FacebookPixel } from "@/components/analytics/FacebookPixel";
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
    default: "VectorCraft - AI-Powered SVG Converter",
    template: "%s | VectorCraft",
  },
  description:
    "Transform raster images into scalable vector graphics (SVG) with VectorCraft's AI-powered conversion. High-quality, fast, and easy to use.",
  keywords: [
    "vectorcraft",
    "raster to svg",
    "image converter",
    "svg converter",
    "vector graphics",
    "image to svg",
    "png to svg",
    "jpg to svg",
  ],
  authors: [{ name: "VectorCraft" }],
  creator: "VectorCraft",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://raster-to-svg.com",
    title: "VectorCraft - AI-Powered SVG Converter",
    description:
      "Transform raster images into scalable vector graphics (SVG) with VectorCraft's AI-powered conversion.",
    siteName: "VectorCraft",
  },
  twitter: {
    card: "summary_large_image",
    title: "VectorCraft - AI-Powered SVG Converter",
    description:
      "Transform raster images into scalable vector graphics (SVG) with VectorCraft's AI-powered conversion.",
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
    icon: [
      { url: "/favicon.svg", type: "image/svg+xml" },
    ],
    shortcut: "/favicon.svg",
    apple: "/favicon.svg",
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
        {/* Facebook Pixel */}
        {process.env.NEXT_PUBLIC_FB_PIXEL_ID && (
          <FacebookPixel pixelId={process.env.NEXT_PUBLIC_FB_PIXEL_ID} />
        )}

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
            <Analytics />
            <SpeedInsights />
          </ThemeProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
