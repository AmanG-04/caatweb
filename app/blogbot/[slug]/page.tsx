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
  const title = `${post.title.slice(0, 38).trimEnd()} | CAAT BlogBot`;
  return { title, description: post.content.slice(0, 155), alternates: { canonical: `/blogbot/${post.slug}` } };
}

function BlogImage({ post }: { post: Awaited<ReturnType<typeof findPublishedBlogPost>> }) {
  if (!post?.image_object_key) return null;
  return <img src={`/api/blog/image?key=${encodeURIComponent(post.image_object_key)}`} alt={post.image_alt || post.title} className="w-full rounded-3xl border border-ink/10 object-cover shadow-soft" />;
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
           {post.image_placement === "top" && <div className="mt-8"><BlogImage post={post} /></div>}
           <div className="mt-8 space-y-6 text-base leading-8 text-ink/75">
             {post.content.split(/\n{2,}/).map((paragraph, index, paragraphs) => <span key={`${index}-${paragraph.slice(0, 24)}`} className="block">{index === Math.ceil(paragraphs.length / 2) - 1 && post.image_placement === "middle" && <span className="mb-6 block"><BlogImage post={post} /></span>}<p className="whitespace-pre-line">{paragraph}</p></span>)}
           </div>
           {post.image_placement === "end" && <div className="mt-8"><BlogImage post={post} /></div>}
        </div>
      </article>
    </PublicPage>
  );
}
