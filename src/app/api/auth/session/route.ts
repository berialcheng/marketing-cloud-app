import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";

/**
 * Session Endpoint
 * Returns the current session data
 */
export async function GET() {
  try {
    const session = await getSession();

    if (!session.isLoggedIn) {
      return NextResponse.json({
        isLoggedIn: false,
      });
    }

    return NextResponse.json({
      isLoggedIn: true,
      user: session.user,
      organization: session.organization,
      // Don't expose sensitive API data to client
      hasApiAccess: !!session.api?.refreshToken,
    });
  } catch (error) {
    console.error("Session fetch error:", error);
    return NextResponse.json(
      { error: "Failed to fetch session" },
      { status: 500 }
    );
  }
}
