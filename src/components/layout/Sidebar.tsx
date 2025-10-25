"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  Sparkles,
  History,
  Settings,
  HelpCircle,
} from "lucide-react";
import { Icons } from "@/components/icons";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";

interface SidebarProps {
  conversions?: {
    total: number;
    today: number;
  };
}

const navigation = [
  {
    name: "Convert",
    href: "/convert",
    icon: Icons.logo as any,
  },
  {
    name: "History",
    href: "/history",
    icon: History,
  },
];

const secondaryNavigation = [
  {
    name: "Help",
    href: "#",
    icon: HelpCircle,
  },
  {
    name: "Settings",
    href: "#",
    icon: Settings,
  },
];

export function Sidebar({ conversions }: SidebarProps) {
  const pathname = usePathname();

  return (
    <div className="flex h-full w-60 flex-col border-r bg-background">
      {/* Logo/Brand */}
      <div className="flex h-14 items-center px-4 border-b">
        <Link href="/convert" className="flex items-center gap-2 font-semibold text-sm">
          <div className="flex h-7 w-7 items-center justify-center rounded-md bg-primary text-primary-foreground">
            <Icons.logo className="h-3.5 w-3.5" />
          </div>
          <span>SVG Converter</span>
        </Link>
      </div>

      <ScrollArea className="flex-1 py-2">
        {/* Primary Navigation */}
        <div className="space-y-0.5 px-2">
          {navigation.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;

            return (
              <Link key={item.name} href={item.href}>
                <div
                  className={cn(
                    "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                    isActive
                      ? "bg-secondary text-secondary-foreground"
                      : "text-muted-foreground hover:bg-secondary/50 hover:text-foreground"
                  )}
                >
                  <Icon className="h-4 w-4" />
                  <span>{item.name}</span>
                </div>
              </Link>
            );
          })}
        </div>

        {/* Stats Section */}
        {conversions && (
          <>
            <Separator className="my-3" />
            <div className="px-4 py-2">
              <p className="text-xs font-medium text-muted-foreground mb-3">
                STATISTICS
              </p>
              <div className="space-y-2 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Total</span>
                  <span className="font-semibold">{conversions.total}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Today</span>
                  <span className="font-semibold">{conversions.today}</span>
                </div>
              </div>
            </div>
          </>
        )}

        {/* Secondary Navigation */}
        <Separator className="my-3" />
        <div className="px-4 py-2">
          <p className="text-xs font-medium text-muted-foreground mb-3">
            MORE
          </p>
        </div>
        <div className="space-y-0.5 px-2">
          {secondaryNavigation.map((item) => {
            const Icon = item.icon;
            return (
              <Link key={item.name} href={item.href}>
                <div
                  className="flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-secondary/50 hover:text-foreground"
                >
                  <Icon className="h-4 w-4" />
                  <span>{item.name}</span>
                </div>
              </Link>
            );
          })}
        </div>
      </ScrollArea>
    </div>
  );
}
