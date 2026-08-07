import type { MetadataRoute } from "next";
import { listPublishedBlogPosts } from "@/lib/blog";

export const dynamic = "force-dynamic";

const routes = ["", "/quote", "/about-us", "/solutions", "/testimonials", "/blogbot", "/contact"];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://caatpowerbot.com";
  const lastModified = new Date();
  const posts = await listPublishedBlogPosts();
  return [
    ...routes.map((route) => ({ url: `${siteUrl}${route}`, lastModified, changeFrequency: route === "" ? "weekly" as const : "monthly" as const, priority: route === "" ? 1 : 0.8 })),
    ...posts.map((post) => ({ url: `${siteUrl}/blogbot/${post.slug}`, lastModified: new Date(post.updated_at), changeFrequency: "monthly" as const, priority: 0.7 })),
  ];
}
