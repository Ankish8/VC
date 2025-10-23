import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

/**
 * GET /api/pricing - Get current pricing for all plans
 * Public endpoint - no authentication required
 */
export async function GET(request: NextRequest) {
  try {
    let settings = await prisma.siteSettings.findFirst();

    // Create default settings if none exist
    if (!settings) {
      settings = await prisma.siteSettings.create({
        data: {
          starterMonthlyPrice: 10.00,
          starterYearlyPrice: 96.00,
          proMonthlyPrice: 19.00,
          proYearlyPrice: 180.00,
          lifetimePrice: 39.00,
          starterCredits: 100,
          proCredits: 500,
        },
      });
    }

    // Return pricing in format expected by landing page
    return NextResponse.json({
      starter: {
        monthly: {
          price: settings.starterMonthlyPrice,
          credits: settings.starterCredits,
        },
        yearly: {
          price: settings.starterYearlyPrice,
          pricePerMonth: (settings.starterYearlyPrice / 12).toFixed(2),
          credits: settings.starterCredits,
        },
      },
      professional: {
        monthly: {
          price: settings.proMonthlyPrice,
          credits: settings.proCredits,
        },
        yearly: {
          price: settings.proYearlyPrice,
          pricePerMonth: (settings.proYearlyPrice / 12).toFixed(2),
          credits: settings.proCredits,
        },
      },
      lifetime: {
        price: settings.lifetimePrice,
        credits: -1, // Unlimited
      },
    });
  } catch (error) {
    console.error("Error fetching pricing:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
