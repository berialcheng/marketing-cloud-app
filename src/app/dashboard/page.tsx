import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";

export default async function Dashboard() {
  const session = await getSession();

  // Double-check authentication (middleware should have already handled this)
  if (!session.isLoggedIn) {
    redirect("/");
  }

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
            SSO Authentication Successful
          </p>
          <p className="text-green-700 text-sm">
            You have been authenticated via Marketing Cloud SSO.
          </p>
        </div>

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
              API Endpoints
            </h2>
            <dl className="space-y-3">
              <div>
                <dt className="text-sm text-gray-500">Auth Endpoint</dt>
                <dd className="text-gray-900 font-mono text-sm bg-gray-50 p-2 rounded break-all">
                  {session.api?.authEndpoint}
                </dd>
              </div>
              <div>
                <dt className="text-sm text-gray-500">REST API Base URL</dt>
                <dd className="text-gray-900 font-mono text-sm bg-gray-50 p-2 rounded break-all">
                  {session.api?.apiEndpoint}
                </dd>
              </div>
              <div>
                <dt className="text-sm text-gray-500">Refresh Token</dt>
                <dd className="text-gray-900 font-mono text-sm bg-gray-50 p-2 rounded">
                  <span className="text-gray-400">
                    {session.api?.refreshToken
                      ? `${session.api.refreshToken.substring(0, 20)}...`
                      : "Not available"}
                  </span>
                </dd>
              </div>
            </dl>
          </div>
        </div>

        {/* Session Info */}
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
                api: session.api
                  ? {
                      authEndpoint: session.api.authEndpoint,
                      apiEndpoint: session.api.apiEndpoint,
                      refreshToken: "***hidden***",
                    }
                  : null,
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
