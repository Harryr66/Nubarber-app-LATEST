export default function TestRoutePage() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="max-w-md w-full bg-white rounded-lg shadow-md p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">✅ Route Test Successful</h1>
        <p className="text-gray-600 mb-4">
          This page confirms that basic Next.js routing is working on your deployment.
        </p>
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <p className="text-sm text-green-800">
            <strong>Current URL:</strong> /test-route<br/>
            <strong>Status:</strong> Route is accessible
          </p>
        </div>
        <div className="mt-4 text-xs text-gray-500">
          If you can see this page, the issue is with subdomain routing, not basic Next.js functionality.
        </div>
      </div>
    </div>
  );
} 