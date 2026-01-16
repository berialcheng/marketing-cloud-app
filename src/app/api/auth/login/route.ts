import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/session";

/**
 * Marketing Cloud SSO Login Endpoint (Enhanced Package - OAuth 2.0)
 *
 * When MC iframes this URL, we check for existing session.
 * If no session, redirect the TOP LEVEL window to MC OAuth authorize endpoint.
 * (MC OAuth page cannot be displayed in iframe due to X-Frame-Options: deny)
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

    // Return HTML page that redirects the TOP LEVEL window
    // This is necessary because MC OAuth page has X-Frame-Options: deny
    const html = `
<!DOCTYPE html>
<html>
<head>
  <title>Redirecting to Marketing Cloud...</title>
  <script>
    // Set state cookie before redirect
    document.cookie = "oauth_state=${state}; path=/; max-age=600; SameSite=None; Secure";
    // Redirect top-level window (breaks out of iframe)
    window.top.location.href = "${authorizeUrl.toString()}";
  </script>
</head>
<body>
  <p>Redirecting to Marketing Cloud for authentication...</p>
  <p>If you are not redirected, <a href="${authorizeUrl.toString()}" target="_top">click here</a>.</p>
</body>
</html>
`;

    return new NextResponse(html, {
      headers: {
        "Content-Type": "text/html",
      },
    });
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
