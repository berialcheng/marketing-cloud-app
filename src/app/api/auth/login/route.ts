import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/session";

/**
 * Marketing Cloud SSO Login Endpoint (Enhanced Package - OAuth 2.0)
 *
 * When MC iframes this URL, we check for existing session.
 * If no session, show a login button that opens OAuth in a POPUP window.
 * This avoids replacing the Salesforce top-level frame.
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getSession();
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || request.nextUrl.origin;

    // If already logged in, redirect to dashboard
    if (session.isLoggedIn && session.accessToken) {
      return NextResponse.redirect(new URL("/dashboard", baseUrl));
    }

    // Get OAuth configuration from environment
    const authBaseUri = process.env.MC_AUTH_BASE_URI?.replace(/\/+$/, "");
    const clientId = process.env.MC_CLIENT_ID;
    const redirectUri = process.env.MC_REDIRECT_URI ||
      `${baseUrl}/api/auth/callback`;

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
    const state = crypto.randomUUID();
    authorizeUrl.searchParams.set("state", state);

    console.log(`SSO Login: OAuth authorize URL: ${authorizeUrl.toString()}`);

    // Return HTML page with popup-based OAuth flow
    const html = `
<!DOCTYPE html>
<html>
<head>
  <title>Sign in to Marketing Cloud</title>
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <style>
    * { box-sizing: border-box; }
    body {
      font-family: system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif;
      margin: 0;
      padding: 24px;
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      background: #f9fafb;
    }
    .card {
      max-width: 400px;
      width: 100%;
      background: white;
      border: 1px solid #e5e7eb;
      border-radius: 12px;
      padding: 32px;
      text-align: center;
      box-shadow: 0 1px 3px rgba(0,0,0,0.1);
    }
    .logo {
      width: 48px;
      height: 48px;
      background: #1e40af;
      border-radius: 12px;
      margin: 0 auto 16px;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .logo svg { width: 28px; height: 28px; color: white; }
    h1 { font-size: 20px; margin: 0 0 8px; color: #111827; }
    .subtitle { margin: 0 0 24px; color: #6b7280; font-size: 14px; }
    .btn {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      width: 100%;
      background: #2563eb;
      color: #fff;
      padding: 12px 20px;
      border-radius: 8px;
      text-decoration: none;
      font-size: 14px;
      font-weight: 500;
      border: none;
      cursor: pointer;
      transition: background 0.2s;
    }
    .btn:hover { background: #1d4ed8; }
    .btn:disabled { background: #9ca3af; cursor: not-allowed; }
    .btn svg { width: 18px; height: 18px; }
    .status { margin-top: 16px; font-size: 13px; color: #6b7280; }
    .status.error { color: #dc2626; }
    .status.success { color: #16a34a; }
    .spinner {
      display: inline-block;
      width: 16px;
      height: 16px;
      border: 2px solid #fff;
      border-top-color: transparent;
      border-radius: 50%;
      animation: spin 0.8s linear infinite;
    }
    @keyframes spin { to { transform: rotate(360deg); } }
  </style>
</head>
<body>
  <div class="card">
    <div class="logo">
      <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z"/>
      </svg>
    </div>
    <h1>Marketing Cloud App</h1>
    <p class="subtitle">Sign in with your Salesforce account</p>

    <button id="loginBtn" class="btn" onclick="openAuthPopup()">
      <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"/>
      </svg>
      Sign in with Marketing Cloud
    </button>

    <p id="status" class="status"></p>
  </div>

  <script>
    const OAUTH_URL = "${authorizeUrl.toString()}";
    const DASHBOARD_URL = "${baseUrl}/dashboard";
    let authWindow = null;
    let checkInterval = null;

    function openAuthPopup() {
      const btn = document.getElementById('loginBtn');
      const status = document.getElementById('status');

      // Calculate popup position (center of screen)
      const width = 500;
      const height = 600;
      const left = (screen.width - width) / 2;
      const top = (screen.height - height) / 2;

      // Open popup
      authWindow = window.open(
        OAUTH_URL,
        'mc_oauth',
        \`width=\${width},height=\${height},left=\${left},top=\${top},toolbar=no,menubar=no,scrollbars=yes\`
      );

      if (!authWindow) {
        status.textContent = 'Popup blocked. Please allow popups and try again.';
        status.className = 'status error';
        return;
      }

      // Update UI
      btn.disabled = true;
      btn.innerHTML = '<span class="spinner"></span> Waiting for sign in...';
      status.textContent = 'Complete sign in in the popup window';
      status.className = 'status';

      // Check if popup is closed or auth is complete
      checkInterval = setInterval(() => {
        if (authWindow.closed) {
          clearInterval(checkInterval);
          checkAuthStatus();
        }
      }, 500);
    }

    async function checkAuthStatus() {
      const btn = document.getElementById('loginBtn');
      const status = document.getElementById('status');

      btn.innerHTML = '<span class="spinner"></span> Checking...';

      try {
        const response = await fetch('/api/auth/session', { credentials: 'include' });
        const data = await response.json();

        if (data.isLoggedIn) {
          status.textContent = 'Sign in successful! Redirecting...';
          status.className = 'status success';
          window.location.href = DASHBOARD_URL;
        } else {
          // Auth was not completed
          btn.disabled = false;
          btn.innerHTML = \`
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"/>
            </svg>
            Sign in with Marketing Cloud
          \`;
          status.textContent = 'Sign in was cancelled or failed. Please try again.';
          status.className = 'status error';
        }
      } catch (err) {
        btn.disabled = false;
        btn.innerHTML = \`
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"/>
          </svg>
          Sign in with Marketing Cloud
        \`;
        status.textContent = 'Error checking auth status. Please try again.';
        status.className = 'status error';
      }
    }

    // Listen for message from popup (alternative method)
    window.addEventListener('message', (event) => {
      if (event.data === 'oauth_complete') {
        if (checkInterval) clearInterval(checkInterval);
        if (authWindow && !authWindow.closed) authWindow.close();
        checkAuthStatus();
      }
    });
  </script>
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
