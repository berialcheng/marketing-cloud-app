import { NextRequest, NextResponse } from "next/server";
import { createSession } from "@/lib/session";
import type { MCTokenResponse, MCUserInfo } from "@/lib/types";

/**
 * OAuth Callback Endpoint
 *
 * Receives authorization code from MC, exchanges for tokens,
 * fetches user info, and creates session.
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const code = searchParams.get("code");
    const state = searchParams.get("state");
    const error = searchParams.get("error");
    const errorDescription = searchParams.get("error_description");

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || request.nextUrl.origin;

    // Handle OAuth errors
    if (error) {
      console.error(`OAuth error: ${error} - ${errorDescription}`);
      const errorUrl = new URL("/", baseUrl);
      errorUrl.searchParams.set("error", errorDescription || error);
      return NextResponse.redirect(errorUrl);
    }

    // Validate code
    if (!code) {
      console.error("OAuth callback: Missing authorization code");
      const errorUrl = new URL("/", baseUrl);
      errorUrl.searchParams.set("error", "Missing authorization code");
      return NextResponse.redirect(errorUrl);
    }

    // Validate state (CSRF protection)
    const storedState = request.cookies.get("oauth_state")?.value;
    if (state && storedState && state !== storedState) {
      console.error("OAuth callback: State mismatch");
      const errorUrl = new URL("/", baseUrl);
      errorUrl.searchParams.set("error", "Invalid state parameter");
      return NextResponse.redirect(errorUrl);
    }

    // Get OAuth configuration
    const authBaseUri = process.env.MC_AUTH_BASE_URI;
    const clientId = process.env.MC_CLIENT_ID;
    const clientSecret = process.env.MC_CLIENT_SECRET;
    const redirectUri = process.env.MC_REDIRECT_URI ||
      `${baseUrl}/api/auth/callback`;

    if (!authBaseUri || !clientId || !clientSecret) {
      console.error("OAuth callback: Missing configuration");
      const errorUrl = new URL("/", baseUrl);
      errorUrl.searchParams.set("error", "Server configuration error");
      return NextResponse.redirect(errorUrl);
    }

    // Exchange code for tokens
    console.log("OAuth callback: Exchanging code for tokens...");
    const tokenResponse = await fetch(`${authBaseUri}/v2/token`, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        grant_type: "authorization_code",
        code: code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: redirectUri,
      }),
    });

    if (!tokenResponse.ok) {
      const errorText = await tokenResponse.text();
      console.error(`OAuth token exchange failed: ${tokenResponse.status} - ${errorText}`);
      const errorUrl = new URL("/", baseUrl);
      errorUrl.searchParams.set("error", "Token exchange failed");
      return NextResponse.redirect(errorUrl);
    }

    const tokenData: MCTokenResponse = await tokenResponse.json();
    console.log("OAuth callback: Token exchange successful");

    // Fetch user info
    console.log("OAuth callback: Fetching user info...");
    const userInfoResponse = await fetch(`${authBaseUri}/v2/userinfo`, {
      headers: {
        Authorization: `Bearer ${tokenData.access_token}`,
      },
    });

    if (!userInfoResponse.ok) {
      const errorText = await userInfoResponse.text();
      console.error(`OAuth userinfo failed: ${userInfoResponse.status} - ${errorText}`);
      const errorUrl = new URL("/", baseUrl);
      errorUrl.searchParams.set("error", "Failed to fetch user info");
      return NextResponse.redirect(errorUrl);
    }

    const userInfo: MCUserInfo = await userInfoResponse.json();
    console.log(`OAuth callback: User info fetched for ${userInfo.user.email}`);

    // Create session
    await createSession({
      accessToken: tokenData.access_token,
      refreshToken: tokenData.refresh_token,
      tokenExpiresAt: Date.now() + tokenData.expires_in * 1000,
      restInstanceUrl: tokenData.rest_instance_url,
      user: {
        id: userInfo.user.id,
        email: userInfo.user.email,
        name: userInfo.user.name,
        culture: userInfo.user.culture,
      },
      organization: {
        id: userInfo.organization.id,
        enterpriseId: userInfo.organization.enterprise_id,
        stackKey: userInfo.organization.stack_key,
        region: userInfo.organization.region,
      },
    });

    console.log(`SSO Login successful: ${userInfo.user.email} (MID: ${userInfo.organization.id})`);

    // Clear state cookie and redirect to dashboard
    const response = NextResponse.redirect(new URL("/dashboard", baseUrl));
    response.cookies.delete("oauth_state");
    return response;
  } catch (error) {
    console.error("OAuth callback error:", error);
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || request.nextUrl.origin;
    const errorUrl = new URL("/", baseUrl);
    errorUrl.searchParams.set("error", "Authentication failed");
    return NextResponse.redirect(errorUrl);
  }
}
