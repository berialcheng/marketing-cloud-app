import { getIronSession, IronSession } from "iron-session";
import { cookies } from "next/headers";
import type { SessionData } from "./types";
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
  session.user = data.user;
  session.organization = data.organization;
  session.api = data.api;

  await session.save();
}

/**
 * Destroy the current session
 */
export async function destroySession(): Promise<void> {
  const session = await getSession();
  session.destroy();
}
