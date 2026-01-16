import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const session = await getSession();
  const params = await searchParams;

  // If already logged in, redirect to dashboard
  if (session.isLoggedIn) {
    redirect("/dashboard");
  }

  return (
    <main className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-8">
      <div className="max-w-md w-full bg-white rounded-lg shadow-md p-8">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Marketing Cloud App
          </h1>
          <p className="text-gray-600">
            SSO Demo Application (OAuth 2.0)
          </p>
        </div>

        {params.error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md">
            <p className="text-red-700 text-sm">
              <strong>Error:</strong> {params.error}
            </p>
          </div>
        )}

        <div className="space-y-4">
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-md">
            <h2 className="font-semibold text-blue-900 mb-2">
              How to Access
            </h2>
            <p className="text-blue-800 text-sm">
              This application is designed to be accessed from within
              Salesforce Marketing Cloud. Click on the app in your Marketing
              Cloud instance to initiate the OAuth 2.0 SSO flow.
            </p>
          </div>

          <div className="p-4 bg-gray-50 border border-gray-200 rounded-md">
            <h2 className="font-semibold text-gray-700 mb-2">
              Authentication Flow
            </h2>
            <ol className="text-gray-600 text-sm list-decimal list-inside space-y-1">
              <li>MC opens Login Endpoint in iframe</li>
              <li>Redirect to MC OAuth authorize</li>
              <li>User authorizes (if needed)</li>
              <li>Callback receives auth code</li>
              <li>Exchange code for tokens</li>
              <li>Fetch user info & create session</li>
            </ol>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-gray-200">
          <h3 className="font-semibold text-gray-700 mb-3">
            Endpoints
          </h3>
          <div className="space-y-2">
            <div className="bg-gray-100 p-3 rounded-md">
              <p className="text-xs text-gray-500 mb-1">Login Endpoint</p>
              <code className="text-sm text-gray-800 break-all">
                /api/auth/login
              </code>
            </div>
            <div className="bg-gray-100 p-3 rounded-md">
              <p className="text-xs text-gray-500 mb-1">Callback Endpoint</p>
              <code className="text-sm text-gray-800 break-all">
                /api/auth/callback
              </code>
            </div>
            <div className="bg-gray-100 p-3 rounded-md">
              <p className="text-xs text-gray-500 mb-1">Logout Endpoint</p>
              <code className="text-sm text-gray-800 break-all">
                /api/auth/logout
              </code>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
