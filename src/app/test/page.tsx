export default function TestPage() {
  return (
    <div className="min-h-screen bg-blue-50 flex items-center justify-center">
      <div className="max-w-md w-full bg-white rounded-lg shadow-md p-6">
        <h1 className="text-2xl font-bold text-blue-900 mb-4">🧪 Basic Routing Test</h1>
        <p className="text-blue-600 mb-4">
          This page tests if basic Next.js app directory routing is working.
        </p>
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <p className="text-sm text-green-800">
            <strong>URL:</strong> /test<br/>
            <strong>Status:</strong> ✅ Route accessible<br/>
            <strong>Location:</strong> src/app/test/page.tsx
          </p>
        </div>
        <div className="mt-4 text-xs text-gray-500">
          If you can see this page, basic routing works. If not, there's a fundamental deployment issue.
        </div>
      </div>
    </div>
  );
} 