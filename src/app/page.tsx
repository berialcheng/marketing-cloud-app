import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; redirect?: string }>;
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
            SSO Demo Application
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
              Salesforce Marketing Cloud. The SSO login will be initiated
              automatically when you open this app from your Marketing Cloud
              instance.
            </p>
          </div>

          {process.env.NODE_ENV !== "production" && (
            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-md">
              <h2 className="font-semibold text-yellow-900 mb-2">
                Development Mode
              </h2>
              <p className="text-yellow-800 text-sm mb-3">
                You can test the SSO flow using the test page.
              </p>
              <a
                href="/test-sso"
                className="inline-block bg-yellow-600 text-white px-4 py-2 rounded-md text-sm hover:bg-yellow-700 transition-colors"
              >
                Open SSO Test Page
              </a>
            </div>
          )}
        </div>

        <div className="mt-8 pt-6 border-t border-gray-200">
          <h3 className="font-semibold text-gray-700 mb-3">
            SSO Endpoint
          </h3>
          <div className="bg-gray-100 p-3 rounded-md">
            <code className="text-sm text-gray-800 break-all">
              POST /api/auth/login
            </code>
          </div>
          <p className="text-gray-500 text-xs mt-2">
            Configure this endpoint as the Login Endpoint in your Marketing
            Cloud Installed Package.
          </p>
        </div>
      </div>
    </main>
  );
}
