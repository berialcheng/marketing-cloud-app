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
    const authBaseUri = process.env.MC_AUTH_BASE_URI?.replace(/\/+$/, "");
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
  <title>Continue to Marketing Cloud...</title>
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <style>
    body { font-family: system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif; padding: 24px; }
    .card { max-width: 520px; margin: 0 auto; border: 1px solid #e5e7eb; border-radius: 12px; padding: 20px; }
    h1 { font-size: 18px; margin: 0 0 12px; }
    p { margin: 0 0 12px; color: #374151; font-size: 14px; line-height: 1.4; }
    .btn { display: inline-block; background: #2563eb; color: #fff; padding: 10px 14px; border-radius: 8px; text-decoration: none; font-size: 14px; }
    .muted { color: #6b7280; font-size: 12px; }
  </style>
</head>
<body>
  <div class="card">
    <h1>Continue to sign in</h1>
    <p>Browser security requires a click to continue the Marketing Cloud authentication flow.</p>
    <p><a class="btn" href="${authorizeUrl.toString()}" target="_top" rel="noopener">Continue to Marketing Cloud</a></p>
    <p class="muted">If the button doesn’t work, open this link in a new tab: ${authorizeUrl.toString()}</p>
  </div>
</body>
</html>
`;

    const response = new NextResponse(html, {
      headers: {
        "Content-Type": "text/html",
      },
    });

    response.cookies.set({
      name: "oauth_state",
      value: state,
      path: "/",
      maxAge: 600,
      httpOnly: true,
      sameSite: "none",
      secure: true,
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
