/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  // Serve the static glute-training module (public/glute-training/) at its folder URL.
  async rewrites() {
    return [
      { source: "/glute-training", destination: "/glute-training/index.html" },
      { source: "/glute-training/", destination: "/glute-training/index.html" },
    ];
  },
};

export default nextConfig;
