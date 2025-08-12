export default function SetupGuidePage() {
  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">🔑 Integration Setup Guide</h1>
        
        <div className="space-y-8">
          {/* Stripe Setup */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">💳 Stripe Integration Setup</h2>
            
            <div className="space-y-4">
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <h3 className="font-semibold text-blue-800 mb-2">What You Need:</h3>
                <ul className="text-sm text-blue-700 space-y-1">
                  <li>• Stripe account (business account)</li>
                  <li>• Business verification documents</li>
                  <li>• Bank account for payouts</li>
                  <li>• Business address and contact info</li>
                </ul>
              </div>
              
              <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <h3 className="font-semibold text-yellow-800 mb-2">Server Configuration Required:</h3>
                <p className="text-sm text-yellow-700">
                  The following environment variables need to be set on the server:
                </p>
                <code className="block mt-2 p-2 bg-gray-100 rounded text-xs">
                  STRIPE_SECRET_KEY=sk_live_...<br/>
                  NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...
                </code>
              </div>
              
              <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                <h3 className="font-semibold text-green-800 mb-2">What Happens After Setup:</h3>
                <ul className="text-sm text-green-700 space-y-1">
                  <li>• Customers can pay online when booking</li>
                  <li>• Automatic payment collection</li>
                  <li>• Secure checkout experience</li>
                  <li>• Automatic payouts to your bank</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Google My Business Setup */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">🌐 Google My Business Integration Setup</h2>
            
            <div className="space-y-4">
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <h3 className="font-semibold text-blue-800 mb-2">What You Need:</h3>
                <ul className="text-sm text-blue-700 space-y-1">
                  <li>• Google Cloud Platform account</li>
                  <li>• Google My Business API enabled</li>
                  <li>• OAuth 2.0 credentials</li>
                  <li>• Business verification on Google</li>
                </ul>
              </div>
              
              <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <h3 className="font-semibold text-yellow-800 mb-2">Server Configuration Required:</h3>
                <p className="text-sm text-yellow-700">
                  The following environment variables need to be set on the server:
                </p>
                <code className="block mt-2 p-2 bg-gray-100 rounded text-xs">
                  GMB_CLIENT_ID=your_client_id.apps.googleusercontent.com<br/>
                  GMB_CLIENT_SECRET=your_client_secret<br/>
                  GMB_REDIRECT_URI=https://yourdomain.com/api/gmb/callback
                </code>
              </div>
              
              <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                <h3 className="font-semibold text-green-800 mb-2">What Happens After Setup:</h3>
                <ul className="text-sm text-green-700 space-y-1">
                  <li>• Business info automatically synced</li>
                  <li>• Review management</li>
                  <li>• Hours and location updates</li>
                  <li>• Better Google search visibility</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Contact Support */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">📞 Get Help</h2>
            
            <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
              <h3 className="font-semibold text-purple-800 mb-2">Need Help Setting Up?</h3>
              <p className="text-sm text-purple-700 mb-4">
                These integrations require server-side configuration and API credentials. 
                Contact our support team to get them enabled for your account.
              </p>
              
              <div className="space-y-2 text-sm text-purple-600">
                <p><strong>Support Email:</strong> support@nubarber.com</p>
                <p><strong>Setup Time:</strong> 24-48 hours after credentials provided</p>
                <p><strong>Cost:</strong> Included with your subscription</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 