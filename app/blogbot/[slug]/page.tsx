import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CalendarDays } from "lucide-react";
import { findPublishedBlogPost } from "@/lib/blog";
import { PublicPage } from "@/components/public-page";

export const dynamic = "force-dynamic";

type PageProps = { params: Promise<{ slug: string }> };

function formatDate(value: string) {
  const date = new Date(value.includes("T") ? value : `${value.replace(" ", "T")}Z`);
  return Number.isNaN(date.getTime()) ? value : new Intl.DateTimeFormat("en-IN", { dateStyle: "long" }).format(date);
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const post = await findPublishedBlogPost((await params).slug);
  if (!post) return { title: "BlogBot | CAAT PowerBot" };
  return { title: `${post.title} | CAAT BlogBot`, description: post.content.slice(0, 160), alternates: { canonical: `/blogbot/${post.slug}` } };
}

export default async function BlogArticlePage({ params }: PageProps) {
  const post = await findPublishedBlogPost((await params).slug);
  if (!post) notFound();

  return (
    <PublicPage>
      <article className="bg-white py-16 sm:py-24">
        <div className="container-wide max-w-3xl">
          <p className="flex items-center gap-2 font-mono text-[11px] font-bold uppercase tracking-[.15em] text-teal"><CalendarDays size={14} />{formatDate(post.published_at ?? post.created_at)}</p>
          <h1 className="page-title mt-6">{post.title}</h1>
          <div className="mt-8 space-y-6 text-base leading-8 text-ink/75">
            {post.content.split(/\n{2,}/).map((paragraph, index) => <p key={`${index}-${paragraph.slice(0, 24)}`} className="whitespace-pre-line">{paragraph}</p>)}
          </div>
        </div>
      </article>
    </PublicPage>
  );
}
