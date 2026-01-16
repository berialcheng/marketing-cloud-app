import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/session";

/**
 * Marketing Cloud SSO Login Endpoint (Enhanced Package - OAuth 2.0)
 *
 * When MC iframes this URL, we check for existing session.
 * If no session, redirect to MC OAuth authorize endpoint.
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getSession();

    // If already logged in, redirect to dashboard
    if (session.isLoggedIn && session.accessToken) {
      const baseUrl = process.env.NEXT_PUBLIC_APP_URL || request.nextUrl.origin;
      return NextResponse.redirect(new URL("/dashboard", baseUrl));
    }

    // Get OAuth configuration from environment
    const authBaseUri = process.env.MC_AUTH_BASE_URI;
    const clientId = process.env.MC_CLIENT_ID;
    const redirectUri = process.env.MC_REDIRECT_URI ||
      `${process.env.NEXT_PUBLIC_APP_URL || request.nextUrl.origin}/api/auth/callback`;

    if (!authBaseUri || !clientId) {
      console.error("SSO Login: Missing OAuth configuration");
      return NextResponse.json(
        { error: "Server configuration error: Missing MC_AUTH_BASE_URI or MC_CLIENT_ID" },
        { status: 500 }
      );
    }

    // Build OAuth authorize URL
    const authorizeUrl = new URL(`${authBaseUri}/v2/authorize`);
    authorizeUrl.searchParams.set("response_type", "code");
    authorizeUrl.searchParams.set("client_id", clientId);
    authorizeUrl.searchParams.set("redirect_uri", redirectUri);
    // Optional: add state parameter for CSRF protection
    const state = crypto.randomUUID();
    authorizeUrl.searchParams.set("state", state);

    console.log(`SSO Login: Redirecting to OAuth authorize: ${authorizeUrl.toString()}`);

    // Store state in cookie for verification in callback
    const response = NextResponse.redirect(authorizeUrl.toString());
    response.cookies.set("oauth_state", state, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "none",
      maxAge: 600, // 10 minutes
    });

    return response;
  } catch (error) {
    console.error("SSO Login error:", error);
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || request.nextUrl.origin;
    const errorUrl = new URL("/", baseUrl);
    errorUrl.searchParams.set("error", "Login failed");
    return NextResponse.redirect(errorUrl);
  }
}

// Also handle POST for backwards compatibility
export async function POST(request: NextRequest) {
  return GET(request);
}
