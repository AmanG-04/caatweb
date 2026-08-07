import { NextResponse } from "next/server";
import { createBlogPost, listAdminBlogPosts } from "@/lib/blog";
import { requireAdmin } from "@/lib/auth";
import { getEnv } from "@/lib/cloudflare";
import { blogPostSchema } from "@/lib/validation";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function unauthorized() {
  return NextResponse.json({ success: false, error: { code: "UNAUTHORIZED", message: "Admin login required." } }, { status: 401 });
}

function databaseUnavailable() {
  return NextResponse.json({ success: false, error: { code: "DATABASE_UNAVAILABLE", message: "Blog storage is not available in this environment." } }, { status: 503 });
}

async function readBody(request: Request): Promise<unknown> {
  const text = await request.text();
  if (text.length > 60000) throw new Error("BODY_TOO_LARGE");
  return JSON.parse(text);
}

function saveError(error: unknown) {
  if (error instanceof Error && /unique constraint/i.test(error.message)) {
    return NextResponse.json({ success: false, error: { code: "DUPLICATE_SLUG", message: "That URL slug is already in use." } }, { status: 409 });
  }
  return NextResponse.json({ success: false, error: { code: "BLOG_SAVE_FAILED", message: "The blog post could not be saved." } }, { status: 500 });
}

export async function GET(request: Request) {
  if (!await requireAdmin(request)) return unauthorized();
  if (!getEnv().DB) return NextResponse.json({ success: true, data: { items: [], message: "D1 is not bound in this environment." } }, { headers: { "Cache-Control": "no-store" } });

  try {
    return NextResponse.json({ success: true, data: { items: await listAdminBlogPosts() } }, { headers: { "Cache-Control": "no-store" } });
  } catch {
    return NextResponse.json({ success: false, error: { code: "BLOG_READ_FAILED", message: "Blog posts could not be loaded." } }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const admin = await requireAdmin(request);
  if (!admin) return unauthorized();
  if (admin.role !== "admin") return NextResponse.json({ success: false, error: { code: "FORBIDDEN", message: "Only administrators can publish BlogBot posts." } }, { status: 403 });
  if (!getEnv().DB) return databaseUnavailable();

  let raw: unknown;
  try {
    raw = await readBody(request);
  } catch (error) {
    const message = error instanceof Error && error.message === "BODY_TOO_LARGE" ? "Blog posts must be 60 KB or smaller." : "Request body must be valid JSON.";
    return NextResponse.json({ success: false, error: { code: "INVALID_JSON", message } }, { status: 400 });
  }

  const parsed = blogPostSchema.safeParse(raw);
  if (!parsed.success) return NextResponse.json({ success: false, error: { code: "VALIDATION_ERROR", message: "Check the blog post fields.", fields: parsed.error.flatten().fieldErrors } }, { status: 400 });

  try {
    const post = await createBlogPost(parsed.data, admin.adminId);
    return NextResponse.json({ success: true, data: post }, { status: 201 });
  } catch (error) {
    return saveError(error);
  }
}
