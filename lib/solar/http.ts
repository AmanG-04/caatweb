import { requireAdmin } from "@/lib/auth";
import { SolarError } from "./provider";

export function json(data: unknown, status = 200) {
  return Response.json({ success: true, data }, { status, headers: { "Cache-Control": "private, no-store" } });
}
export function failure(error: unknown) {
  const known = error instanceof SolarError;
  return Response.json({ success: false, error: { code: known ? error.code : "DESIGNER_ERROR", message: known ? error.message : "The designer operation failed. Check database migrations and storage, then retry." } }, { status: known ? error.status : 500, headers: { "Cache-Control": "private, no-store" } });
}
export async function authorize(request: Request, mutation = false) {
  const admin = await requireAdmin(request);
  if (!admin) throw new SolarError("UNAUTHORIZED", "Sign in through the existing admin dashboard.", 401);
  if (admin.role !== "admin") throw new SolarError("FORBIDDEN", "Administrator access is required.", 403);
  if (mutation && request.headers.get("origin") && request.headers.get("origin") !== new URL(request.url).origin) throw new SolarError("FORBIDDEN", "Cross-origin designer requests are not permitted.", 403);
  return admin;
}
export async function body(request: Request) {
  const reader = request.body?.getReader();
  if (!reader) throw new SolarError("INVALID_BODY", "A JSON request body is required.", 400);
  const chunks: Uint8Array[] = []; let size = 0;
  while (true) {
    const part = await reader.read(); if (part.done) break;
    size += part.value.byteLength;
    if (size > 16000) { await reader.cancel(); throw new SolarError("BODY_TOO_LARGE", "Project settings must be smaller than 16 KB.", 413); }
    chunks.push(part.value);
  }
  const bytes = new Uint8Array(size); let offset = 0;
  for (const chunk of chunks) { bytes.set(chunk, offset); offset += chunk.byteLength; }
  try { return JSON.parse(new TextDecoder().decode(bytes)) as unknown; }
  catch { throw new SolarError("INVALID_JSON", "Request body must be valid JSON.", 400); }
}
