import { TailwindIndicator } from "@/components/tailwind-indicator";
import { cn, constructMetadata } from "@/lib/utils";
import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = constructMetadata({});

export const viewport: Viewport = {
  colorScheme: "light",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "white" },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="light" style={{ colorScheme: 'light' }}>
      <head>
        <link rel="preconnect" href="https://rsms.me/" />
        <link rel="stylesheet" href="https://rsms.me/inter/inter.css" />
        <script dangerouslySetInnerHTML={{
          __html: `
            (function() {
              // Force light mode - clear any stored preferences
              try {
                localStorage.removeItem('theme');
                localStorage.setItem('theme', 'light');
              } catch (e) {}

              // Remove dark class and ensure light class
              document.documentElement.classList.remove('dark');
              if (!document.documentElement.classList.contains('light')) {
                document.documentElement.classList.add('light');
              }
              document.documentElement.style.colorScheme = 'light';
            })();
          `
        }} />
      </head>
      <body
        className={cn(
          "min-h-screen bg-white antialiased w-full mx-auto scroll-smooth"
        )}
      >
        {children}
        <TailwindIndicator />
      </body>
    </html>
  );
}
