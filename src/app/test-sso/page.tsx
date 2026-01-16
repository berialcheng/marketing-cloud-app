"use client";

import { useState, useEffect, useRef } from "react";

export default function TestSSOPage() {
  const [formData, setFormData] = useState({
    userId: "12345",
    email: "test@example.com",
    mid: "100000001",
    eid: "100000000",
    culture: "en-US",
    stackKey: "S1",
    region: "NA1",
  });
  const [generatedJWT, setGeneratedJWT] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

  // Check if we're in production (this page should be blocked)
  useEffect(() => {
    if (process.env.NODE_ENV === "production") {
      window.location.href = "/";
    }
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const generateTestJWT = async () => {
    setIsLoading(true);
    setError("");

    try {
      // Call API to generate test JWT
      const response = await fetch("/api/auth/test-jwt", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to generate JWT");
      }

      const data = await response.json();
      setGeneratedJWT(data.token);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  const submitLogin = () => {
    if (generatedJWT && formRef.current) {
      formRef.current.submit();
    }
  };

  const generateAndSubmit = async () => {
    await generateTestJWT();
  };

  // Auto-submit when JWT is generated
  useEffect(() => {
    if (generatedJWT && formRef.current) {
      // Small delay to ensure state is updated
      const timer = setTimeout(() => {
        formRef.current?.submit();
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [generatedJWT]);

  return (
    <main className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-2xl mx-auto">
        <div className="mb-8">
          <a
            href="/"
            className="text-blue-600 hover:text-blue-800 text-sm"
          >
            &larr; Back to Home
          </a>
        </div>

        <div className="bg-white rounded-lg shadow-md p-8">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              SSO Test Page
            </h1>
            <p className="text-gray-600">
              Generate a test JWT and simulate Marketing Cloud SSO login.
            </p>
          </div>

          <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4 mb-6">
            <p className="text-yellow-800 text-sm">
              <strong>Development Only:</strong> This page is only available in
              development mode and will be blocked in production.
            </p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md">
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          )}

          <div className="space-y-4 mb-6">
            <h2 className="font-semibold text-gray-700">Test User Data</h2>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-gray-600 mb-1">
                  User ID
                </label>
                <input
                  type="text"
                  name="userId"
                  value={formData.userId}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm text-gray-600 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm text-gray-600 mb-1">
                  MID (Business Unit)
                </label>
                <input
                  type="text"
                  name="mid"
                  value={formData.mid}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm text-gray-600 mb-1">
                  EID (Enterprise)
                </label>
                <input
                  type="text"
                  name="eid"
                  value={formData.eid}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm text-gray-600 mb-1">
                  Culture
                </label>
                <input
                  type="text"
                  name="culture"
                  value={formData.culture}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm text-gray-600 mb-1">
                  Stack Key
                </label>
                <input
                  type="text"
                  name="stackKey"
                  value={formData.stackKey}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm text-gray-600 mb-1">
                  Region
                </label>
                <input
                  type="text"
                  name="region"
                  value={formData.region}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          <button
            onClick={generateAndSubmit}
            disabled={isLoading}
            className="w-full bg-blue-600 text-white py-3 rounded-md hover:bg-blue-700 transition-colors disabled:bg-blue-300"
          >
            {isLoading ? "Generating..." : "Generate JWT & Login"}
          </button>

          {/* Hidden form for POST submission */}
          <form
            ref={formRef}
            action="/api/auth/login"
            method="POST"
            className="hidden"
          >
            <input type="hidden" name="jwt" value={generatedJWT} />
          </form>

          {generatedJWT && (
            <div className="mt-6">
              <h3 className="font-semibold text-gray-700 mb-2">
                Generated JWT
              </h3>
              <div className="bg-gray-900 text-green-400 p-4 rounded-md overflow-x-auto">
                <code className="text-xs break-all">{generatedJWT}</code>
              </div>
              <button
                onClick={submitLogin}
                className="mt-2 text-blue-600 hover:text-blue-800 text-sm"
              >
                Click here if not redirected automatically
              </button>
            </div>
          )}
        </div>

        <div className="mt-6 bg-white rounded-lg shadow-md p-6">
          <h2 className="font-semibold text-gray-700 mb-3">
            Manual Testing with cURL
          </h2>
          <p className="text-gray-600 text-sm mb-3">
            You can also test the SSO endpoint manually using cURL:
          </p>
          <pre className="bg-gray-900 text-green-400 p-4 rounded-md overflow-x-auto text-xs">
{`curl -X POST http://localhost:3000/api/auth/login \\
  -H "Content-Type: application/x-www-form-urlencoded" \\
  -d "jwt=YOUR_JWT_TOKEN" \\
  -v`}
          </pre>
        </div>
      </div>
    </main>
  );
}
