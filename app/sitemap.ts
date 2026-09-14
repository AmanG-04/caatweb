import type { MetadataRoute } from "next";
import { listPublishedBlogPosts } from "@/lib/blog";
import { serviceAreas } from "@/lib/service-areas";

export const dynamic = "force-dynamic";

const routes = [
  { path: "", lastModified: "2026-09-14", changeFrequency: "weekly" as const, priority: 1 },
  { path: "/quote", lastModified: "2026-09-14", changeFrequency: "monthly" as const, priority: 0.8 },
  { path: "/about-us", lastModified: "2026-09-14", changeFrequency: "monthly" as const, priority: 0.8 },
  { path: "/solutions", lastModified: "2026-09-14", changeFrequency: "monthly" as const, priority: 0.8 },
  { path: "/solutions/solar", lastModified: "2026-09-14", changeFrequency: "monthly" as const, priority: 0.8 },
  { path: "/solutions/water-heating", lastModified: "2026-09-14", changeFrequency: "monthly" as const, priority: 0.8 },
  { path: "/solutions/bess", lastModified: "2026-09-14", changeFrequency: "monthly" as const, priority: 0.8 },
  { path: "/solutions/ev-charging", lastModified: "2026-09-14", changeFrequency: "monthly" as const, priority: 0.8 },
  { path: "/solutions/generators", lastModified: "2026-09-14", changeFrequency: "monthly" as const, priority: 0.8 },
  { path: "/solutions/maintenance", lastModified: "2026-09-14", changeFrequency: "monthly" as const, priority: 0.8 },
  { path: "/testimonials", lastModified: "2026-09-14", changeFrequency: "monthly" as const, priority: 0.8 },
  { path: "/blogbot", lastModified: "2026-09-14", changeFrequency: "weekly" as const, priority: 0.8 },
  { path: "/contact", lastModified: "2026-09-14", changeFrequency: "monthly" as const, priority: 0.8 },
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://caatpowerbot.com";
  const posts = await listPublishedBlogPosts();
  return [
    ...routes.map((route) => ({ url: `${siteUrl}${route.path}`, lastModified: new Date(route.lastModified), changeFrequency: route.changeFrequency, priority: route.priority })),
    ...serviceAreas.map((area) => ({ url: `${siteUrl}/solar-installation/${area.slug}`, lastModified: new Date("2026-09-14"), changeFrequency: "monthly" as const, priority: 0.8 })),
    ...posts.map((post) => ({ url: `${siteUrl}/blogbot/${post.slug}`, lastModified: new Date(post.updated_at), changeFrequency: "monthly" as const, priority: 0.7 })),
  ];
}
