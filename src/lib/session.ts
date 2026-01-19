import { getIronSession, IronSession } from "iron-session";
import { cookies } from "next/headers";
import type { SessionData, MCTokenResponse } from "./types";
import { defaultSession } from "./types";

const sessionOptions = {
  password:
    process.env.SESSION_PASSWORD ||
    "complex_password_at_least_32_characters_long_for_dev",
  cookieName: process.env.SESSION_COOKIE_NAME || "mc_app_session",
  cookieOptions: {
    secure: process.env.NODE_ENV === "production",
    httpOnly: true,
    sameSite: "none" as const, // Required for cross-origin iframe embedding
  },
};

/**
 * Get the current session from cookies
 */
export async function getSession(): Promise<IronSession<SessionData>> {
  const cookieStore = await cookies();
  const session = await getIronSession<SessionData>(cookieStore, sessionOptions);

  if (!session.isLoggedIn) {
    session.isLoggedIn = defaultSession.isLoggedIn;
  }

  return session;
}

/**
 * Create a session for the authenticated user
 */
export async function createSession(data: Omit<SessionData, "isLoggedIn">): Promise<void> {
  const session = await getSession();

  session.isLoggedIn = true;
  session.accessToken = data.accessToken;
  session.refreshToken = data.refreshToken;
  session.tokenExpiresAt = data.tokenExpiresAt;
  session.restInstanceUrl = data.restInstanceUrl;
  session.user = data.user;
  session.organization = data.organization;

  await session.save();
}

/**
 * Destroy the current session
 */
export async function destroySession(): Promise<void> {
  const session = await getSession();
  session.destroy();
}

/**
 * Refresh the access token using refresh_token
 * Returns true if refresh was successful, false otherwise
 */
export async function refreshAccessToken(): Promise<boolean> {
  const session = await getSession();

  if (!session.refreshToken) {
    console.log("No refresh token available");
    return false;
  }

  const authBaseUri = process.env.MC_AUTH_BASE_URI;
  const clientId = process.env.MC_CLIENT_ID;
  const clientSecret = process.env.MC_CLIENT_SECRET;

  if (!authBaseUri || !clientId || !clientSecret) {
    console.error("Missing OAuth configuration for token refresh");
    return false;
  }

  try {
    console.log("Refreshing access token...");
    const response = await fetch(`${authBaseUri}/v2/token`, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        grant_type: "refresh_token",
        refresh_token: session.refreshToken,
        client_id: clientId,
        client_secret: clientSecret,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Token refresh failed:", response.status, errorText);
      return false;
    }

    const tokenData: MCTokenResponse = await response.json();
    console.log("Token refresh successful");

    // Update session with new tokens
    session.accessToken = tokenData.access_token;
    session.tokenExpiresAt = Date.now() + tokenData.expires_in * 1000;
    if (tokenData.refresh_token) {
      session.refreshToken = tokenData.refresh_token;
    }
    if (tokenData.rest_instance_url) {
      session.restInstanceUrl = tokenData.rest_instance_url;
    }

    await session.save();
    return true;
  } catch (error) {
    console.error("Token refresh error:", error);
    return false;
  }
}

/**
 * Get a valid access token, refreshing if necessary
 * Returns the access token or null if unable to get one
 */
export async function getValidAccessToken(): Promise<string | null> {
  const session = await getSession();

  if (!session.isLoggedIn || !session.accessToken) {
    return null;
  }

  // Check if token is expired or about to expire (within 60 seconds)
  const bufferMs = 60 * 1000;
  if (session.tokenExpiresAt && Date.now() > session.tokenExpiresAt - bufferMs) {
    console.log("Token expired or expiring soon, attempting refresh...");
    const refreshed = await refreshAccessToken();
    if (!refreshed) {
      return null;
    }
    // Get updated session after refresh
    const updatedSession = await getSession();
    return updatedSession.accessToken || null;
  }

  return session.accessToken;
}
