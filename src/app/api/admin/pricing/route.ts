import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { checkAdminAccess } from "@/lib/admin-guard";
import { createSubscriptionPlan } from "@/lib/paypal";

// GET /api/admin/pricing - Get current pricing configuration
export async function GET(request: NextRequest) {
  try {
    const adminCheck = await checkAdminAccess();
    if (adminCheck) {
      // adminCheck is a NextResponse error, return it
      return adminCheck;
    }

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

    return NextResponse.json({
      starterMonthlyPrice: settings.starterMonthlyPrice,
      starterYearlyPrice: settings.starterYearlyPrice,
      proMonthlyPrice: settings.proMonthlyPrice,
      proYearlyPrice: settings.proYearlyPrice,
      lifetimePrice: settings.lifetimePrice,
      starterCredits: settings.starterCredits,
      proCredits: settings.proCredits,
    });
  } catch (error) {
    console.error("Error fetching pricing settings:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// PUT /api/admin/pricing - Update pricing configuration and create new PayPal plans
export async function PUT(request: NextRequest) {
  try {
    const adminCheck = await checkAdminAccess();
    if (adminCheck) {
      // adminCheck is a NextResponse error, return it
      return adminCheck;
    }

    const body = await request.json();
    const {
      starterMonthlyPrice,
      starterYearlyPrice,
      proMonthlyPrice,
      proYearlyPrice,
      lifetimePrice,
      starterCredits,
      proCredits,
    } = body;

    // Validate input
    if (
      typeof starterMonthlyPrice !== "number" ||
      typeof starterYearlyPrice !== "number" ||
      typeof proMonthlyPrice !== "number" ||
      typeof proYearlyPrice !== "number" ||
      typeof lifetimePrice !== "number" ||
      typeof starterCredits !== "number" ||
      typeof proCredits !== "number"
    ) {
      return NextResponse.json({ error: "Invalid input values" }, { status: 400 });
    }

    if (
      starterMonthlyPrice < 0 ||
      starterYearlyPrice < 0 ||
      proMonthlyPrice < 0 ||
      proYearlyPrice < 0 ||
      lifetimePrice < 0 ||
      starterCredits < 1 ||
      proCredits < 1
    ) {
      return NextResponse.json(
        { error: "Prices must be non-negative and credits must be at least 1" },
        { status: 400 }
      );
    }

    // Create new PayPal subscription plans with updated pricing
    console.log("Creating new PayPal subscription plans with updated pricing...");

    try {
      // Create Starter Monthly Plan
      const starterMonthlyPlan = await createSubscriptionPlan(
        "Starter Monthly Plan",
        `${starterCredits} conversions per month`,
        starterMonthlyPrice.toString(),
        "MONTH"
      );

      // Create Starter Yearly Plan
      const starterYearlyPlan = await createSubscriptionPlan(
        "Starter Yearly Plan",
        `${starterCredits} conversions per month, billed annually`,
        starterYearlyPrice.toString(),
        "YEAR"
      );

      // Create Pro Monthly Plan
      const proMonthlyPlan = await createSubscriptionPlan(
        "Professional Monthly Plan",
        `${proCredits} conversions per month with priority support`,
        proMonthlyPrice.toString(),
        "MONTH"
      );

      // Create Pro Yearly Plan
      const proYearlyPlan = await createSubscriptionPlan(
        "Professional Yearly Plan",
        `${proCredits} conversions per month with priority support, billed annually`,
        proYearlyPrice.toString(),
        "YEAR"
      );

      // Update settings with new prices, credits, and PayPal plan IDs
      let settings = await prisma.siteSettings.findFirst();

      if (!settings) {
        settings = await prisma.siteSettings.create({
          data: {
            starterMonthlyPrice,
            starterYearlyPrice,
            proMonthlyPrice,
            proYearlyPrice,
            lifetimePrice,
            starterCredits,
            proCredits,
            starterMonthlyPlanId: starterMonthlyPlan.id,
            starterYearlyPlanId: starterYearlyPlan.id,
            proMonthlyPlanId: proMonthlyPlan.id,
            proYearlyPlanId: proYearlyPlan.id,
          },
        });
      } else {
        settings = await prisma.siteSettings.update({
          where: { id: settings.id },
          data: {
            starterMonthlyPrice,
            starterYearlyPrice,
            proMonthlyPrice,
            proYearlyPrice,
            lifetimePrice,
            starterCredits,
            proCredits,
            starterMonthlyPlanId: starterMonthlyPlan.id,
            starterYearlyPlanId: starterYearlyPlan.id,
            proMonthlyPlanId: proMonthlyPlan.id,
            proYearlyPlanId: proYearlyPlan.id,
          },
        });
      }

      return NextResponse.json({
        message: "Pricing settings and PayPal plans updated successfully",
        settings: {
          starterMonthlyPrice: settings.starterMonthlyPrice,
          starterYearlyPrice: settings.starterYearlyPrice,
          proMonthlyPrice: settings.proMonthlyPrice,
          proYearlyPrice: settings.proYearlyPrice,
          lifetimePrice: settings.lifetimePrice,
          starterCredits: settings.starterCredits,
          proCredits: settings.proCredits,
        },
        paypalPlans: {
          starterMonthly: starterMonthlyPlan.id,
          starterYearly: starterYearlyPlan.id,
          proMonthly: proMonthlyPlan.id,
          proYearly: proYearlyPlan.id,
        },
      });
    } catch (paypalError: any) {
      console.error("Error creating PayPal plans:", paypalError);

      // Still update the database even if PayPal fails
      let settings = await prisma.siteSettings.findFirst();
      if (!settings) {
        settings = await prisma.siteSettings.create({
          data: {
            starterMonthlyPrice,
            starterYearlyPrice,
            proMonthlyPrice,
            proYearlyPrice,
            lifetimePrice,
            starterCredits,
            proCredits,
          },
        });
      } else {
        settings = await prisma.siteSettings.update({
          where: { id: settings.id },
          data: {
            starterMonthlyPrice,
            starterYearlyPrice,
            proMonthlyPrice,
            proYearlyPrice,
            lifetimePrice,
            starterCredits,
            proCredits,
          },
        });
      }

      return NextResponse.json({
        message: "Pricing updated but PayPal plan creation failed. Please check PayPal configuration.",
        warning: paypalError.message,
        settings: {
          starterMonthlyPrice: settings.starterMonthlyPrice,
          starterYearlyPrice: settings.starterYearlyPrice,
          proMonthlyPrice: settings.proMonthlyPrice,
          proYearlyPrice: settings.proYearlyPrice,
          lifetimePrice: settings.lifetimePrice,
          starterCredits: settings.starterCredits,
          proCredits: settings.proCredits,
        },
      });
    }
  } catch (error) {
    console.error("Error updating pricing settings:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
