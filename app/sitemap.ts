import type { MetadataRoute } from "next";
export default function sitemap(): MetadataRoute.Sitemap { const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://caat-powerbot.10amangupta04.workers.dev"; return [{ url: siteUrl, lastModified: new Date() }, { url: `${siteUrl}/quote`, lastModified: new Date() }]; }
