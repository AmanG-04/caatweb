import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { getEnv } from "@/lib/cloudflare";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type LeadFiles = { bill_object_key: string | null; site_photo_object_key: string | null };

export async function GET(request: Request, context: { params: Promise<{ id: string }> }) {
  if (!await requireAdmin(request)) return NextResponse.json({ success: false, error: { code: "UNAUTHORIZED", message: "Admin login required." } }, { status: 401 });
  const kind = new URL(request.url).searchParams.get("kind");
  if (kind !== "bill" && kind !== "site-photo") return NextResponse.json({ success: false, error: { code: "INVALID_FILE_KIND", message: "A valid file type is required." } }, { status: 400 });

  const { id } = await context.params;
  const db = getEnv().DB;
  const bucket = getEnv().BILLS_BUCKET;
  if (!db || !bucket?.get) return NextResponse.json({ success: false, error: { code: "STORAGE_UNAVAILABLE", message: "File storage is unavailable." } }, { status: 503 });

  const lead = await db.prepare("SELECT bill_object_key,site_photo_object_key FROM leads WHERE id=?").bind(id).first<LeadFiles>();
  const key = kind === "bill" ? lead?.bill_object_key : lead?.site_photo_object_key;
  if (!key) return NextResponse.json({ success: false, error: { code: "FILE_NOT_FOUND", message: "This lead has no uploaded file of that type." } }, { status: 404 });

  const file = await bucket.get(key);
  if (!file) return NextResponse.json({ success: false, error: { code: "FILE_NOT_FOUND", message: "The uploaded file is no longer available." } }, { status: 404 });
  return new Response(file.body, { headers: { "Content-Type": file.httpMetadata?.contentType ?? "application/octet-stream", "Content-Disposition": "inline", "Cache-Control": "private, no-store" } });
}
