/** @type {import('next').NextConfig} */
const nextConfig = {
  // Add subdomain support
  async rewrites() {
    return [
      // Handle direct subdomain routes (e.g., harrysbarbers.nubarber.com)
      {
        source: '/:subdomain',
        destination: '/[subdomain]',
        has: [
          {
            type: 'host',
            value: '(?<subdomain>[^.]+)\.nubarber\.com',
          },
        ],
      },
      // Handle subdomain with additional paths (e.g., harrysbarbers.nubarber.com/services)
      {
        source: '/:path*',
        destination: '/[subdomain]/:path*',
        has: [
          {
            type: 'host',
            value: '(?<subdomain>[^.]+)\.nubarber\.com',
          },
        ],
      },
      // Handle path-based routes (e.g., nubarber.com/harrysbarbers)
      {
        source: '/:username',
        destination: '/[subdomain]',
      },
      // Handle path-based routes with additional paths (e.g., nubarber.com/harrysbarbers/services)
      {
        source: '/:username/:path*',
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
