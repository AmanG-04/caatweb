import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight, Bot, CalendarDays } from "lucide-react";
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
    <PublicPage eyebrow="CAAT BlogBot" title="Solar notes, ready when there is something useful to share." description="A home for practical solar guides, project learnings and updates from CAAT PowerBot.">
      <section className="bg-paper py-16 sm:py-24">
        <div className="container-wide">
          {posts.length === 0 ? (
            <div className="mx-auto max-w-3xl rounded-[2rem] border border-dashed border-ink/25 bg-white px-7 py-14 text-center sm:px-12 sm:py-18">
              <span className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-lime text-teal"><Bot size={27} /></span>
              <p className="mt-6 font-mono text-[11px] font-bold uppercase tracking-[.2em] text-teal">BlogBot is being prepared</p>
              <h2 className="mt-4 text-3xl font-black tracking-tight sm:text-4xl">The first post is on its way.</h2>
              <p className="mx-auto mt-4 max-w-xl leading-7 text-ink/65">There are no published posts yet. This space will grow with clear, useful solar information when it is ready to share.</p>
            </div>
          ) : (
            <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
              {posts.map((post) => (
                <article key={post.id} className="flex flex-col rounded-3xl border border-ink/10 bg-white p-7 shadow-soft">
                  <p className="flex items-center gap-2 font-mono text-[11px] font-bold uppercase tracking-[.15em] text-teal"><CalendarDays size={14} />{formatDate(post.published_at ?? post.created_at)}</p>
                  <h2 className="mt-5 text-2xl font-black tracking-tight">{post.title}</h2>
                  <p className="mt-4 flex-1 leading-7 text-ink/70">{post.excerpt}</p>
                  <Link href={`/blogbot/${post.slug}`} className="mt-7 inline-flex items-center gap-2 text-sm font-black text-teal">Read article <ArrowUpRight size={16} /></Link>
                </article>
              ))}
            </div>
          )}
        </div>
      </section>
    </PublicPage>
  );
}
