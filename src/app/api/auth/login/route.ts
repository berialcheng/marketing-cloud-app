import { NextRequest, NextResponse } from "next/server";
import { verifyMarketingCloudJWT } from "@/lib/jwt";
import { createSession } from "@/lib/session";

/**
 * Marketing Cloud SSO Login Endpoint
 * Receives JWT via POST with application/x-www-form-urlencoded body
 */
export async function POST(request: NextRequest) {
  try {
    // Parse form data (Marketing Cloud sends JWT as form-urlencoded)
    const formData = await request.formData();
    const token = formData.get("jwt") as string;

    if (!token) {
      console.error("SSO Login: Missing JWT token");
      return NextResponse.json(
        { error: "Missing JWT token" },
        { status: 400 }
      );
    }

    // Get the JWT signing secret from environment
    const secret = process.env.MC_JWT_SIGNING_SECRET;
    if (!secret) {
      console.error("SSO Login: MC_JWT_SIGNING_SECRET not configured");
      return NextResponse.json(
        { error: "Server configuration error" },
        { status: 500 }
      );
    }

    // Verify and decode the JWT
    const payload = verifyMarketingCloudJWT(token, secret);

    // Create session with user data
    await createSession({
      user: {
        id: payload.request.user.id,
        email: payload.request.user.email,
        culture: payload.request.user.culture,
      },
      organization: {
        id: payload.request.organization.id,
        enterpriseId: payload.request.organization.enterpriseId,
        stackKey: payload.request.organization.stackKey,
        region: payload.request.organization.region,
      },
      api: {
        authEndpoint: payload.request.rest.authEndpoint,
        apiEndpoint: payload.request.rest.apiEndpointBase,
        refreshToken: payload.request.rest.refreshToken,
      },
    });

    console.log(
      `SSO Login successful: User ${payload.request.user.email} (MID: ${payload.request.organization.id})`
    );

    // Redirect to dashboard
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || request.nextUrl.origin;
    return NextResponse.redirect(new URL("/dashboard", baseUrl));
  } catch (error) {
    console.error("SSO Login error:", error);

    const message =
      error instanceof Error ? error.message : "Authentication failed";

    // Redirect to home with error
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || request.nextUrl.origin;
    const errorUrl = new URL("/", baseUrl);
    errorUrl.searchParams.set("error", message);

    return NextResponse.redirect(errorUrl);
  }
}

// Also handle GET for testing purposes (redirect to home)
export async function GET(request: NextRequest) {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || request.nextUrl.origin;
  return NextResponse.redirect(new URL("/", baseUrl));
}
