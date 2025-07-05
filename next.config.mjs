/** @type {import('next').NextConfig} */
const nextConfig = {
  // Enable static exports for better Cloudflare Pages compatibility
  output: 'export',
  trailingSlash: true,
  skipTrailingSlashRedirect: true,
  
  // Image optimization settings for Cloudflare
  images: {
    unoptimized: true, // Disable Next.js image optimization for static export
    domains: [
      'bpzmonsdihmvawtlurhl.supabase.co', // Your Supabase domain
      'localhost'
    ],
  },

  // Disable server-side features that don't work with static export
  experimental: {
    esmExternals: 'loose',
  },

  // Environment variables
  env: {
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  },

  // Webpack configuration for better compatibility
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
      };
    }
    return config;
  },

  // Disable x-powered-by header
  poweredByHeader: false,

  // Compress responses
  compress: true,

  // Generate ETags for better caching
  generateEtags: true,

  // ESLint configuration
  eslint: {
    ignoreDuringBuilds: true,
  },

  // TypeScript configuration
  typescript: {
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
