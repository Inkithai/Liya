import type { NextConfig } from"next";

const nextConfig: NextConfig = {
 reactStrictMode: true,
 images: {
 remotePatterns: [
 { protocol:"https", hostname:"www.kapruka.com" },
 { protocol:"https", hostname:"kapruka.com" },
 { protocol:"https", hostname:"mcp.kapruka.com" },
 { protocol:"https", hostname:"static1.kapruka.com" },
 { protocol:"https", hostname:"static2.kapruka.com" },
 { protocol:"https", hostname:"images.unsplash.com" }
 ]
 }
};

export default nextConfig;
