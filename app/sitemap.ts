import type { MetadataRoute } from "next";

const routes = ["", "/quote", "/residential-solar", "/commercial-solar", "/solar-subsidy-delhi-ncr", "/solar-panel-cost", "/projects", "/contact"];

export default function sitemap(): MetadataRoute.Sitemap {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://caatpowerbot.com";
  const lastModified = new Date();
  return routes.map((route) => ({ url: `${siteUrl}${route}`, lastModified, changeFrequency: route === "" ? "weekly" : "monthly", priority: route === "" ? 1 : 0.8 }));
}
