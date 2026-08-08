import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: { unoptimized: true },
  experimental: {
    // Keep the stylesheet on the initial document so the above-the-fold hero
    // can paint without waiting for a separate render-blocking CSS request.
    inlineCss: true,
  },
  async redirects() {
    return [
      { source: "/residential-solar", destination: "/solutions", permanent: true },
      { source: "/commercial-solar", destination: "/solutions", permanent: true },
      { source: "/solar-subsidy-delhi-ncr", destination: "/solutions", permanent: true },
      { source: "/solar-panel-cost", destination: "/solutions", permanent: true },
      { source: "/projects", destination: "/testimonials", permanent: true },
    ];
  },
  async headers() {
    return [{ source: "/(.*)", headers: [
      { key: "X-Content-Type-Options", value: "nosniff" },
      { key: "X-Frame-Options", value: "DENY" },
      { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
      { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
    ] }];
  },
};
export default nextConfig;
