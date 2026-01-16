import { NextRequest, NextResponse } from "next/server";
import { destroySession } from "@/lib/session";

/**
 * Logout Endpoint
 * Clears the session and redirects to home
 */
export async function GET(request: NextRequest) {
  try {
    await destroySession();

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || request.nextUrl.origin;
    return NextResponse.redirect(new URL("/", baseUrl));
  } catch (error) {
    console.error("Logout error:", error);

    // Still redirect to home even on error
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || request.nextUrl.origin;
    return NextResponse.redirect(new URL("/", baseUrl));
  }
}

export async function POST(request: NextRequest) {
  return GET(request);
}
