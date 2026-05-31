/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // ESLint isn't configured for Next in this project; don't fail builds on it.
  eslint: { ignoreDuringBuilds: true },
};

export default nextConfig;
