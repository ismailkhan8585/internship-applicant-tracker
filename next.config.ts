import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  // Allow googleapis to work in server components/routes
  serverExternalPackages: ['googleapis', 'google-auth-library'],
  // Next.js 16 uses Turbopack by default
  turbopack: {},
}

export default nextConfig
