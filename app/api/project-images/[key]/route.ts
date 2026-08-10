import { getEnv } from "@/lib/cloudflare";

export const runtime = "edge";

const IMAGE_FILE_NAME = /^[a-z0-9][a-z0-9-]*\.png$/;

export async function GET(_: Request, context: { params: Promise<{ key: string }> }) {
  const { key } = await context.params;

  if (!IMAGE_FILE_NAME.test(key)) {
    return new Response("Not found", { status: 404 });
  }

  const bucket = getEnv().PROJECT_IMAGES_BUCKET;
  if (!bucket?.get) {
    return new Response("Not found", { status: 404 });
  }

  const image = await bucket.get(`testimonials/${key}`);
  if (!image) {
    return new Response("Not found", { status: 404 });
  }

  return new Response(image.body, {
    headers: {
      "Cache-Control": "public, max-age=31536000, immutable",
      "Content-Type": image.httpMetadata?.contentType ?? "image/png",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
