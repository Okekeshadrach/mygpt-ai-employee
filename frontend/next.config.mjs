/**
 * The browser only ever talks to this Next.js server. `/api/*` and `/socket.io/*` are proxied to
 * the backend, so a deployment needs ONE public URL (Coolify: expose only the frontend).
 * BACKEND_INTERNAL_URL is baked in at `next build` (rewrites go into the routes manifest):
 * http://localhost:4000 by default, http://backend:4000 in the Docker image (see frontend/Dockerfile).
 */
const backend = process.env.BACKEND_INTERNAL_URL ?? 'http://localhost:4000';

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Socket.IO's engine requires the trailing slash in /socket.io/ — don't let Next strip it.
  skipTrailingSlashRedirect: true,
  async rewrites() {
    return [
      { source: '/api/:path*', destination: `${backend}/api/:path*` },
      { source: '/socket.io/', destination: `${backend}/socket.io/` },
      { source: '/socket.io/:path*', destination: `${backend}/socket.io/:path*` },
    ];
  },
};

export default nextConfig;
