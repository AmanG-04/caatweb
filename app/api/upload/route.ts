import { NextResponse } from "next/server";
import { getEnv } from "@/lib/cloudflare";
import { consumeRateLimit } from "@/lib/rate-limit";

export const runtime = "edge";
const MAX = 10 * 1024 * 1024;

async function detectMime(file: File) {
  const bytes = new Uint8Array(await file.slice(0, 8).arrayBuffer());
  if (bytes.length >= 5 && String.fromCharCode(...bytes.slice(0, 5)) === "%PDF-") return "application/pdf";
  if (bytes.length >= 8 && bytes.every((value, index) => value === [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a][index])) return "image/png";
  if (bytes.length >= 3 && bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) return "image/jpeg";
  return null;
}

export async function POST(request: Request) {
  const contentLength = Number(request.headers.get("content-length") ?? 0);
  if (contentLength > MAX + 100000) return NextResponse.json({ success: false, error: { code: "PAYLOAD_TOO_LARGE", message: "Upload must be smaller than 10MB." } }, { status: 413 });
  const rate = await consumeRateLimit(request, "bill-upload", 5, 600);
  if (!rate.allowed) return NextResponse.json({ success: false, error: { code: "RATE_LIMITED", message: "Too many upload attempts. Please try again later." } }, { status: 429, headers: { "Retry-After": String(Math.max(1, rate.reset - Math.floor(Date.now() / 1000))) } });
  const form = await request.formData();
  const file = form.get("file");
  if (!(file instanceof File)) return NextResponse.json({ success: false, error: { code: "FILE_REQUIRED", message: "A bill file is required." } }, { status: 400 });
  const detectedMime = await detectMime(file);
  const allowed = ["application/pdf", "image/png", "image/jpeg"];
  if (!detectedMime || !allowed.includes(file.type) || detectedMime !== file.type || file.size > MAX) return NextResponse.json({ success: false, error: { code: "INVALID_FILE", message: "Only valid PDF, PNG and JPEG files up to 10MB are accepted." } }, { status: 400 });
  const extension = detectedMime === "application/pdf" ? "pdf" : detectedMime === "image/png" ? "png" : "jpg";
  const objectKey = `bills/${crypto.randomUUID()}.${extension}`;
  const bucket = getEnv().BILLS_BUCKET;
  if (!bucket) return NextResponse.json({ success: false, error: { code: "STORAGE_UNAVAILABLE", message: "File storage is not configured." } }, { status: 503 });
  await bucket.put(objectKey, await file.arrayBuffer(), { httpMetadata: { contentType: detectedMime } });
  return NextResponse.json({ success: true, data: { objectKey, message: "Stored securely in R2." } });
}
