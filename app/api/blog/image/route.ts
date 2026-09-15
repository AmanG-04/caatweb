import { getEnv } from "@/lib/cloudflare";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const key = new URL(request.url).searchParams.get("key") ?? "";
  if (!/^blog-images\/[a-z0-9-]+\.(png|jpg)$/.test(key)) return new Response("Not found", { status: 404 });

  const db = getEnv().DB;
  const bucket = getEnv().BILLS_BUCKET;
  if (!db || !bucket?.get) return new Response("Image storage is unavailable", { status: 503 });

  const post = await db.prepare("SELECT id FROM blog_posts WHERE status = 'published' AND image_object_key = ? LIMIT 1").bind(key).first<{ id: string }>();
  if (!post) return new Response("Not found", { status: 404 });

  const image = await bucket.get(key);
  if (!image) return new Response("Not found", { status: 404 });
  return new Response(image.body, {
    headers: {
      "Content-Type": image.httpMetadata?.contentType ?? "image/jpeg",
      "Cache-Control": "public, max-age=300, stale-while-revalidate=3600",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
