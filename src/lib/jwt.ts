import jwt from "jsonwebtoken";
import type { MCJWTPayload } from "./types";

/**
 * Verify and decode a Marketing Cloud JWT token
 * @param token - The JWT token from Marketing Cloud
 * @param secret - The JWT signing secret from the Installed Package
 * @returns The decoded JWT payload
 * @throws Error if verification fails
 */
export function verifyMarketingCloudJWT(
  token: string,
  secret: string
): MCJWTPayload {
  try {
    const decoded = jwt.verify(token, secret, {
      algorithms: ["HS256"],
    }) as MCJWTPayload;

    // Validate required fields
    if (!decoded.request) {
      throw new Error("Invalid JWT: missing request payload");
    }

    if (!decoded.request.user) {
      throw new Error("Invalid JWT: missing user information");
    }

    if (!decoded.request.organization) {
      throw new Error("Invalid JWT: missing organization information");
    }

    if (!decoded.request.rest) {
      throw new Error("Invalid JWT: missing REST API information");
    }

    return decoded;
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      throw new Error("JWT token has expired");
    }
    if (error instanceof jwt.JsonWebTokenError) {
      throw new Error(`JWT verification failed: ${error.message}`);
    }
    throw error;
  }
}

/**
 * Create a test JWT token for development purposes
 * This should only be used in development/testing environments
 */
export function createTestJWT(
  secret: string,
  options?: {
    userId?: number;
    email?: string;
    mid?: number;
    eid?: number;
    expiresIn?: number;
  }
): string {
  const {
    userId = 12345,
    email = "test@example.com",
    mid = 100000001,
    eid = 100000000,
    expiresIn = 3600, // 1 hour
  } = options || {};

  const payload: MCJWTPayload = {
    exp: Math.floor(Date.now() / 1000) + expiresIn,
    jti: `test-${Date.now()}`,
    request: {
      claimsVersion: 2,
      rest: {
        authEndpoint: "https://YOUR_SUBDOMAIN.auth.marketingcloudapis.com/",
        apiEndpointBase: "https://YOUR_SUBDOMAIN.rest.marketingcloudapis.com/",
        refreshToken: "test-refresh-token-for-development",
      },
      user: {
        id: userId,
        email: email,
        culture: "en-US",
        timezone: {
          shortName: "EST",
          longName: "Eastern Standard Time",
          offset: -5,
          dst: true,
        },
      },
      organization: {
        id: mid,
        enterpriseId: eid,
        dataContext: "core",
        stackKey: "S1",
        region: "NA1",
      },
      application: {
        id: "test-app-id",
        package: "test-package",
      },
    },
  };

  return jwt.sign(payload, secret, { algorithm: "HS256" });
}
