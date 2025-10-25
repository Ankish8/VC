import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET() {
  try {
    // Test database connection
    const userCount = await prisma.user.count();

    // Test if the specific user exists
    const user = await prisma.user.findUnique({
      where: { email: "ankish@vectorcraft.com" },
      select: { id: true, email: true, name: true, isAdmin: true },
    });

    return NextResponse.json({
      success: true,
      message: "Database connection successful",
      userCount,
      testUser: user,
      env: {
        hasNextAuthSecret: !!process.env.NEXTAUTH_SECRET,
        hasNextAuthUrl: !!process.env.NEXTAUTH_URL,
        hasDatabaseUrl: !!process.env.DATABASE_URL,
        nodeEnv: process.env.NODE_ENV,
      },
    });
  } catch (error) {
    console.error("[Test Auth] Error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
        stack: error instanceof Error ? error.stack : undefined,
      },
      { status: 500 }
    );
  }
}
