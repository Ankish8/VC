"use client";

import * as React from "react";
import { SessionProvider as NextAuthSessionProvider } from "next-auth/react";
import type { Session } from "next-auth";

interface SessionProviderProps {
  children: React.ReactNode;
  session?: Session | null;
}

/**
 * Session provider component that wraps the application and provides authentication context.
 * This is a client-side wrapper for NextAuth's SessionProvider.
 *
 * @example
 * ```tsx
 * <SessionProvider session={session}>
 *   {children}
 * </SessionProvider>
 * ```
 */
export function SessionProvider({ children, session }: SessionProviderProps) {
  return (
    <NextAuthSessionProvider session={session}>
      {children}
    </NextAuthSessionProvider>
  );
}
