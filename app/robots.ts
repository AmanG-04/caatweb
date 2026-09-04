import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://caatpowerbot.com";
  return {
    rules: [
      { userAgent: "Googlebot", allow: "/", disallow: ["/admin", "/api/"] },
      { userAgent: "GPTBot", allow: "/", disallow: ["/admin", "/api/"] },
      { userAgent: "PerplexityBot", allow: "/", disallow: ["/admin", "/api/"] },
      { userAgent: "ClaudeBot", allow: "/", disallow: ["/admin", "/api/"] },
      { userAgent: "*", allow: "/", disallow: ["/admin", "/api/"] },
    ],
    sitemap: `${siteUrl}/sitemap.xml`,
  };
}
