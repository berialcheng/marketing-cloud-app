/**
 * Marketing Cloud JWT Payload Types
 * Based on Salesforce Marketing Cloud Web App API Integration
 */

export interface MCUserTimezone {
  shortName: string;
  longName: string;
  offset: number;
  dst: boolean;
}

export interface MCUser {
  id: number;
  email: string;
  culture: string;
  timezone?: MCUserTimezone;
}

export interface MCOrganization {
  id: number;           // MID (Business Unit ID)
  enterpriseId: number; // EID (Enterprise ID)
  dataContext?: string;
  stackKey?: string;
  region?: string;
}

export interface MCRestInfo {
  authEndpoint: string;
  apiEndpointBase: string;
  refreshToken: string;
}

export interface MCApplication {
  id: string;
  package: string;
  redirectUrl?: string;
  features?: Record<string, unknown>;
  userPermissions?: string[];
}

export interface MCRequestPayload {
  claimsVersion?: number;
  rest: MCRestInfo;
  user: MCUser;
  organization: MCOrganization;
  application?: MCApplication;
}

export interface MCJWTPayload {
  exp: number;
  jti?: string;
  request: MCRequestPayload;
}

export interface SessionData {
  isLoggedIn: boolean;
  user?: {
    id: number;
    email: string;
    culture: string;
  };
  organization?: {
    id: number;
    enterpriseId: number;
    stackKey?: string;
    region?: string;
  };
  api?: {
    authEndpoint: string;
    apiEndpoint: string;
    refreshToken: string;
  };
}

export const defaultSession: SessionData = {
  isLoggedIn: false,
};
