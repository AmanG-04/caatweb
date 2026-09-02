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
    return [
      {
        source: "/",
        headers: [{ key: "Cache-Control", value: "public, max-age=600, stale-while-revalidate=86400" }],
      },
      {
        source: "/:path(about-us|solutions|testimonials|contact|brochures)",
        headers: [{ key: "Cache-Control", value: "public, max-age=3600, stale-while-revalidate=86400" }],
      },
      {
        source: "/solutions/:path*",
        headers: [{ key: "Cache-Control", value: "public, max-age=86400, stale-while-revalidate=604800" }],
      },
      {
        source: "/solar-installation/:path*",
        headers: [{ key: "Cache-Control", value: "public, max-age=86400, stale-while-revalidate=604800" }],
      },
      {
        source: "/blogbot/:path*",
        headers: [{ key: "Cache-Control", value: "public, max-age=300, stale-while-revalidate=3600" }],
      },
      {
        source: "/sitemap.xml",
        headers: [{ key: "Cache-Control", value: "public, max-age=300, stale-while-revalidate=3600" }],
      },
      {
        source: "/:path(admin|api|quote)/:path*",
        headers: [{ key: "Cache-Control", value: "private, no-store, max-age=0" }],
      },
      {
        source: "/(.*)",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
        ],
      },
    ];
  },
};
export default nextConfig;
