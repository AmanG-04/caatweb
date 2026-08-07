import { NextResponse } from "next/server";
import { deleteBlogPost, updateBlogPost } from "@/lib/blog";
import { requireAdmin } from "@/lib/auth";
import { getEnv } from "@/lib/cloudflare";
import { blogPostSchema } from "@/lib/validation";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type RouteContext = { params: Promise<{ id: string }> };

function forbidden(status: 401 | 403) {
  return NextResponse.json({ success: false, error: { code: status === 401 ? "UNAUTHORIZED" : "FORBIDDEN", message: status === 401 ? "Admin login required." : "Only administrators can change BlogBot posts." } }, { status });
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

export async function PATCH(request: Request, { params }: RouteContext) {
  const admin = await requireAdmin(request);
  if (!admin) return forbidden(401);
  if (admin.role !== "admin") return forbidden(403);
  if (!getEnv().DB) return NextResponse.json({ success: false, error: { code: "DATABASE_UNAVAILABLE", message: "Blog storage is not available in this environment." } }, { status: 503 });

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
    const post = await updateBlogPost((await params).id, parsed.data);
    if (!post) return NextResponse.json({ success: false, error: { code: "NOT_FOUND", message: "Blog post not found." } }, { status: 404 });
    return NextResponse.json({ success: true, data: post });
  } catch (error) {
    return saveError(error);
  }
}

export async function DELETE(request: Request, { params }: RouteContext) {
  const admin = await requireAdmin(request);
  if (!admin) return forbidden(401);
  if (admin.role !== "admin") return forbidden(403);
  if (!getEnv().DB) return NextResponse.json({ success: false, error: { code: "DATABASE_UNAVAILABLE", message: "Blog storage is not available in this environment." } }, { status: 503 });

  try {
    const deleted = await deleteBlogPost((await params).id);
    if (!deleted) return NextResponse.json({ success: false, error: { code: "NOT_FOUND", message: "Blog post not found." } }, { status: 404 });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ success: false, error: { code: "BLOG_DELETE_FAILED", message: "The blog post could not be deleted." } }, { status: 500 });
  }
}
