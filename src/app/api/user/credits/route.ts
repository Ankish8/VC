import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getUserCreditStatus } from "@/lib/credits";

// GET /api/user/credits - Get user's current credit status
export async function GET(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const creditStatus = await getUserCreditStatus(session.user.id);

    return NextResponse.json(creditStatus);
  } catch (error) {
    console.error("Error fetching user credits:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
