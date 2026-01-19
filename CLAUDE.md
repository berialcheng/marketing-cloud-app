# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Next.js 15 application that integrates with Salesforce Marketing Cloud via OAuth 2.0 SSO. It's designed to be embedded as an iframe within Marketing Cloud's Enhanced Package framework.

## Commands

```bash
npm run dev      # Start development server
npm run build    # Production build
npm run start    # Start production server
npm run lint     # Run ESLint
```

## Architecture

### Authentication Flow (OAuth 2.0 Enhanced Package SSO)

1. Marketing Cloud iframes `/api/auth/login`
2. Login endpoint returns an HTML page that redirects the **top-level window** to MC's OAuth authorize URL (required because MC OAuth pages have `X-Frame-Options: deny`)
3. User authenticates in MC
4. MC redirects to `/api/auth/callback` with authorization code
5. Callback exchanges code for tokens, fetches user info, creates iron-session
6. User redirected to `/dashboard`

### Session Management

Uses `iron-session` for encrypted cookie-based sessions. Session data includes:
- Access/refresh tokens and expiration
- REST instance URL for API calls
- User info (id, email, name, culture)
- Organization info (MID, EID, stack, region)

Session configuration is duplicated in:
- `src/lib/session.ts` - for API routes
- `src/middleware.ts` - for route protection

Cookie options use `sameSite: "none"` to support cross-origin iframe embedding.

### Route Protection

Middleware protects `/dashboard/*` and `/data-extensions/*` routes. Unauthenticated users are redirected to `/` with the original path in `redirect` query param.

### API Routes

| Endpoint | Purpose |
|----------|---------|
| `GET/POST /api/auth/login` | Initiates OAuth flow (returns HTML redirect page) |
| `GET /api/auth/callback` | OAuth callback, token exchange, session creation |
| `GET/POST /api/auth/logout` | Destroys session, redirects to home |
| `GET /api/auth/session` | Returns current session data (no tokens exposed) |
| `GET /api/data-extensions` | Lists MC Data Extensions using REST API |

### MC REST API Integration

API calls use the session's `restInstanceUrl` and `accessToken`. Example endpoint pattern:
```
{restInstanceUrl}data/v1/customobjectdefinitions
```

### Iframe Embedding

`next.config.ts` configures headers to allow embedding in MC iframes:
- `X-Frame-Options: ALLOWALL`
- `Content-Security-Policy` with `frame-ancestors` for exacttarget.com, marketingcloudapps.com, salesforce.com

## Environment Variables

Required (see `.env.local.example`):
- `MC_AUTH_BASE_URI` - MC auth endpoint (e.g., `https://xxx.auth.marketingcloudapis.com`)
- `MC_CLIENT_ID` - From MC Installed Package
- `MC_CLIENT_SECRET` - From MC Installed Package
- `MC_REDIRECT_URI` - OAuth callback URL
- `SESSION_PASSWORD` - 32+ character secret for iron-session
- `NEXT_PUBLIC_APP_URL` - App base URL for redirects

## Key Files

- `src/lib/types.ts` - TypeScript types for MC OAuth responses and session data
- `src/lib/session.ts` - Session helper functions (getSession, createSession, destroySession)
- `src/middleware.ts` - Route protection middleware
