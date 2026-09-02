import type { Metadata } from "next";
import { ArrowUpRight, CalendarDays } from "lucide-react";
import { listPublishedBlogPosts } from "@/lib/blog";
import { PublicPage } from "@/components/public-page";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "BlogBot | CAAT PowerBot",
  description: "Solar notes, practical guides and updates from CAAT PowerBot.",
  alternates: { canonical: "/blogbot" },
};

function formatDate(value: string) {
  const date = new Date(value.includes("T") ? value : `${value.replace(" ", "T")}Z`);
  return Number.isNaN(date.getTime()) ? value : new Intl.DateTimeFormat("en-IN", { dateStyle: "medium" }).format(date);
}

export default async function BlogBotPage() {
  const posts = await listPublishedBlogPosts();
  return (
    <PublicPage>
      <section className="bg-paper py-16 sm:py-24">
        <div className="container-wide">
          <div className="mb-10 text-center">
            <h1 className="page-title hero-title-highlight inline-block px-2 pb-1">CAAT BlogBot</h1>
          </div>
          {posts.length === 0 ? (
            <div className="py-16 text-center">
              <p className="text-sm text-ink/55">No published posts yet.</p>
            </div>
          ) : (
            <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
              {posts.map((post) => (
                <article key={post.id} className="flex flex-col rounded-3xl border border-ink/10 bg-white p-7 shadow-soft">
                  <p className="flex items-center gap-2 font-mono text-[11px] font-bold uppercase tracking-[.15em] text-teal"><CalendarDays size={14} />{formatDate(post.published_at ?? post.created_at)}</p>
                  <h2 className="mt-5 text-2xl font-black tracking-tight">{post.title}</h2>
                  <a href={`/blogbot/${post.slug}`} className="mt-7 inline-flex items-center gap-2 text-sm font-black text-teal">Read article <ArrowUpRight size={16} /></a>
                </article>
              ))}
            </div>
          )}
        </div>
      </section>
    </PublicPage>
  );
}
