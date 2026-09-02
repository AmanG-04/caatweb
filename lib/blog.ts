import { getEnv } from "@/lib/cloudflare";
import type { BlogPostInput } from "@/lib/validation";

export type BlogPost = {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  status: "draft" | "published";
  published_at: string | null;
  created_at: string;
  updated_at: string;
};

const selectFields = "id, title, slug, excerpt, content, status, published_at, created_at, updated_at";
const publicCacheTtlMs = 5 * 60 * 1000;

let publishedPostsCache: { value: BlogPost[]; expiresAt: number } | null = null;
const publishedPostCache = new Map<string, { value: BlogPost | null; expiresAt: number }>();

function clearPublishedPostCache() {
  publishedPostsCache = null;
  publishedPostCache.clear();
}

export async function listPublishedBlogPosts(): Promise<BlogPost[]> {
  if (publishedPostsCache && publishedPostsCache.expiresAt > Date.now()) {
    return publishedPostsCache.value;
  }

  const db = getEnv().DB;
  if (!db) return [];

  try {
    const result = await db.prepare(`SELECT ${selectFields} FROM blog_posts WHERE status = 'published' ORDER BY published_at DESC, created_at DESC`).bind().all<BlogPost>();
    publishedPostsCache = { value: result.results, expiresAt: Date.now() + publicCacheTtlMs };
    return result.results;
  } catch {
    return [];
  }
}

export async function findPublishedBlogPost(slug: string): Promise<BlogPost | null> {
  const cachedPost = publishedPostCache.get(slug);
  if (cachedPost && cachedPost.expiresAt > Date.now()) {
    return cachedPost.value;
  }

  const db = getEnv().DB;
  if (!db) return null;

  try {
    const post = await db.prepare(`SELECT ${selectFields} FROM blog_posts WHERE slug = ? AND status = 'published' LIMIT 1`).bind(slug).first<BlogPost>();
    publishedPostCache.set(slug, { value: post, expiresAt: Date.now() + publicCacheTtlMs });
    return post;
  } catch {
    return null;
  }
}

export async function listAdminBlogPosts(): Promise<BlogPost[]> {
  const db = getEnv().DB;
  if (!db) return [];

  const result = await db.prepare(`SELECT ${selectFields} FROM blog_posts ORDER BY updated_at DESC, created_at DESC`).bind().all<BlogPost>();
  return result.results;
}

export async function createBlogPost(input: BlogPostInput, adminId: string): Promise<BlogPost | null> {
  const db = getEnv().DB;
  if (!db) return null;

  const id = crypto.randomUUID();
  await db.prepare("INSERT INTO blog_posts (id, title, slug, excerpt, content, status, published_at, author_id) VALUES (?, ?, ?, ?, ?, ?, CASE WHEN ? = 'published' THEN CURRENT_TIMESTAMP ELSE NULL END, ?)")
    .bind(id, input.title, input.slug, input.excerpt, input.content, input.status, input.status, adminId).run();
  clearPublishedPostCache();
  return db.prepare(`SELECT ${selectFields} FROM blog_posts WHERE id = ?`).bind(id).first<BlogPost>();
}

export async function updateBlogPost(id: string, input: BlogPostInput): Promise<BlogPost | null> {
  const db = getEnv().DB;
  if (!db) return null;

  const existing = await db.prepare("SELECT id FROM blog_posts WHERE id = ? LIMIT 1").bind(id).first<{ id: string }>();
  if (!existing) return null;

  await db.prepare("UPDATE blog_posts SET title = ?, slug = ?, excerpt = ?, content = ?, status = ?, published_at = CASE WHEN ? = 'published' AND published_at IS NULL THEN CURRENT_TIMESTAMP WHEN ? = 'draft' THEN NULL ELSE published_at END, updated_at = CURRENT_TIMESTAMP WHERE id = ?")
    .bind(input.title, input.slug, input.excerpt, input.content, input.status, input.status, input.status, id).run();
  clearPublishedPostCache();
  return db.prepare(`SELECT ${selectFields} FROM blog_posts WHERE id = ?`).bind(id).first<BlogPost>();
}

export async function deleteBlogPost(id: string): Promise<boolean> {
  const db = getEnv().DB;
  if (!db) return false;

  const existing = await db.prepare("SELECT id FROM blog_posts WHERE id = ? LIMIT 1").bind(id).first<{ id: string }>();
  if (!existing) return false;
  await db.prepare("DELETE FROM blog_posts WHERE id = ?").bind(id).run();
  clearPublishedPostCache();
  return true;
}
