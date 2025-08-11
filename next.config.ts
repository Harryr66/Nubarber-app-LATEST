/** @type {import('next').NextConfig} */
const nextConfig = {
  // Add subdomain support
  async rewrites() {
    return [
      // Handle subdomain routes (e.g., /harrysbarbers)
      {
        source: '/:subdomain',
        destination: '/[subdomain]',
      },
      // Handle subdomain with additional paths (e.g., /harrysbarbers/services)
      {
        source: '/:subdomain/:path*',
        destination: '/[subdomain]/:path*',
      },
      // Handle legacy /barbers/ routes
      {
        source: '/barbers/:username',
        destination: '/[subdomain]',
      },
      {
        source: '/barbers/:username/:path*',
        destination: '/[subdomain]/:path*',
      },
    ];
  },
};

export default nextConfig;
