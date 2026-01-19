import { redirect } from "next/navigation";
import Link from "next/link";
import { getSession } from "@/lib/session";

export default async function Dashboard() {
  const session = await getSession();

  // Double-check authentication
  if (!session.isLoggedIn) {
    redirect("/");
  }

  const tokenExpired = session.tokenExpiresAt
    ? Date.now() > session.tokenExpiresAt
    : false;

  return (
    <main className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900">
            Marketing Cloud Dashboard
          </h1>
          <a
            href="/api/auth/logout"
            className="bg-gray-600 text-white px-4 py-2 rounded-md text-sm hover:bg-gray-700 transition-colors"
          >
            Logout
          </a>
        </div>

        <div className="bg-green-50 border border-green-200 rounded-md p-4 mb-6">
          <p className="text-green-800 font-semibold">
            SSO Authentication Successful (OAuth 2.0)
          </p>
          <p className="text-green-700 text-sm">
            You have been authenticated via Marketing Cloud OAuth 2.0 flow.
          </p>
        </div>

        {tokenExpired && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4 mb-6">
            <p className="text-yellow-800 font-semibold">
              Token Expired
            </p>
            <p className="text-yellow-700 text-sm">
              Your access token has expired. Please refresh the page to re-authenticate.
            </p>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* User Information */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <span className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                <svg
                  className="w-4 h-4 text-blue-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                  />
                </svg>
              </span>
              User Information
            </h2>
            <dl className="space-y-3">
              <div>
                <dt className="text-sm text-gray-500">Name</dt>
                <dd className="text-gray-900 font-medium">
                  {session.user?.name || "N/A"}
                </dd>
              </div>
              <div>
                <dt className="text-sm text-gray-500">User ID</dt>
                <dd className="text-gray-900 font-medium">
                  {session.user?.id}
                </dd>
              </div>
              <div>
                <dt className="text-sm text-gray-500">Email</dt>
                <dd className="text-gray-900 font-medium">
                  {session.user?.email}
                </dd>
              </div>
              <div>
                <dt className="text-sm text-gray-500">Culture</dt>
                <dd className="text-gray-900 font-medium">
                  {session.user?.culture}
                </dd>
              </div>
            </dl>
          </div>

          {/* Organization Information */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <span className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center mr-3">
                <svg
                  className="w-4 h-4 text-purple-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                  />
                </svg>
              </span>
              Organization
            </h2>
            <dl className="space-y-3">
              <div>
                <dt className="text-sm text-gray-500">MID (Business Unit ID)</dt>
                <dd className="text-gray-900 font-medium">
                  {session.organization?.id}
                </dd>
              </div>
              <div>
                <dt className="text-sm text-gray-500">EID (Enterprise ID)</dt>
                <dd className="text-gray-900 font-medium">
                  {session.organization?.enterpriseId}
                </dd>
              </div>
              {session.organization?.stackKey && (
                <div>
                  <dt className="text-sm text-gray-500">Stack</dt>
                  <dd className="text-gray-900 font-medium">
                    {session.organization.stackKey}
                  </dd>
                </div>
              )}
              {session.organization?.region && (
                <div>
                  <dt className="text-sm text-gray-500">Region</dt>
                  <dd className="text-gray-900 font-medium">
                    {session.organization.region}
                  </dd>
                </div>
              )}
            </dl>
          </div>

          {/* API Information */}
          <div className="bg-white rounded-lg shadow-md p-6 md:col-span-2">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <span className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center mr-3">
                <svg
                  className="w-4 h-4 text-green-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
              </span>
              API Access
            </h2>
            <dl className="space-y-3">
              <div>
                <dt className="text-sm text-gray-500">REST Instance URL</dt>
                <dd className="text-gray-900 font-mono text-sm bg-gray-50 p-2 rounded break-all">
                  {session.restInstanceUrl || "N/A"}
                </dd>
              </div>
              <div>
                <dt className="text-sm text-gray-500">Access Token</dt>
                <dd className="text-gray-900 font-mono text-sm bg-gray-50 p-2 rounded">
                  <span className="text-gray-400">
                    {session.accessToken
                      ? `${session.accessToken.substring(0, 20)}...`
                      : "N/A"}
                  </span>
                </dd>
              </div>
              <div>
                <dt className="text-sm text-gray-500">Token Expires</dt>
                <dd className="text-gray-900 font-mono text-sm bg-gray-50 p-2 rounded">
                  {session.tokenExpiresAt
                    ? new Date(session.tokenExpiresAt).toLocaleString()
                    : "N/A"}
                </dd>
              </div>
            </dl>
          </div>
        </div>

        {/* Quick Links */}
        <div className="mt-6 bg-white rounded-lg shadow-md p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <span className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center mr-3">
              <svg
                className="w-4 h-4 text-orange-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 10V3L4 14h7v7l9-11h-7z"
                />
              </svg>
            </span>
            Quick Links
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link
              href="/data-extensions"
              className="flex items-center p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors group"
            >
              <span className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mr-3 group-hover:bg-blue-200 transition-colors">
                <svg
                  className="w-5 h-5 text-blue-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4"
                  />
                </svg>
              </span>
              <div>
                <p className="font-medium text-gray-900">Data Extensions</p>
                <p className="text-sm text-gray-500">Browse all data extensions</p>
              </div>
            </Link>
          </div>
        </div>

        {/* Session Debug */}
        <div className="mt-6 bg-white rounded-lg shadow-md p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Session Data (Debug)
          </h2>
          <pre className="bg-gray-900 text-green-400 p-4 rounded-md overflow-x-auto text-sm">
            {JSON.stringify(
              {
                isLoggedIn: session.isLoggedIn,
                user: session.user,
                organization: session.organization,
                restInstanceUrl: session.restInstanceUrl,
                tokenExpiresAt: session.tokenExpiresAt
                  ? new Date(session.tokenExpiresAt).toISOString()
                  : null,
                accessToken: session.accessToken ? "***hidden***" : null,
                refreshToken: session.refreshToken ? "***hidden***" : null,
              },
              null,
              2
            )}
          </pre>
        </div>
      </div>
    </main>
  );
}
