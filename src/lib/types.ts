/**
 * Marketing Cloud OAuth 2.0 Types
 * For Enhanced Package SSO
 */

export interface MCTokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
  scope: string;
  rest_instance_url: string;
  soap_instance_url: string;
  refresh_token?: string;
}

export interface MCUserInfo {
  sub: string;
  user: {
    id: number;
    email: string;
    name: string;
    preferred_username: string;
    culture: string;
    timezone: {
      longName: string;
      shortName: string;
      offset: number;
      dst: boolean;
    };
  };
  organization: {
    id: number;
    enterprise_id: number;
    data_context: string;
    stack_key: string;
    region: string;
  };
}

export interface SessionData {
  isLoggedIn: boolean;
  accessToken?: string;
  refreshToken?: string;
  tokenExpiresAt?: number;
  restInstanceUrl?: string;
  user?: {
    id: number;
    email: string;
    name: string;
    culture: string;
  };
  organization?: {
    id: number;
    enterpriseId: number;
    stackKey?: string;
    region?: string;
  };
}

export const defaultSession: SessionData = {
  isLoggedIn: false,
};
