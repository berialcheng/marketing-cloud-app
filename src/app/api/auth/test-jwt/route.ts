import { NextRequest, NextResponse } from "next/server";
import { createTestJWT } from "@/lib/jwt";

/**
 * Test JWT Generation Endpoint
 * Only available in development mode
 */
export async function POST(request: NextRequest) {
  // Block in production
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json(
      { error: "Not available in production" },
      { status: 403 }
    );
  }

  try {
    const body = await request.json();

    const secret = process.env.MC_JWT_SIGNING_SECRET;
    if (!secret) {
      return NextResponse.json(
        { error: "MC_JWT_SIGNING_SECRET not configured" },
        { status: 500 }
      );
    }

    const token = createTestJWT(secret, {
      userId: parseInt(body.userId) || 12345,
      email: body.email || "test@example.com",
      mid: parseInt(body.mid) || 100000001,
      eid: parseInt(body.eid) || 100000000,
      expiresIn: 3600, // 1 hour
    });

    return NextResponse.json({ token });
  } catch (error) {
    console.error("Test JWT generation error:", error);
    return NextResponse.json(
      { error: "Failed to generate JWT" },
      { status: 500 }
    );
  }
}
