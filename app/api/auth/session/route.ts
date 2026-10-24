import { requireAdmin } from "@/lib/auth";
export async function GET(request: Request) {
  const admin = await requireAdmin(request);
  return Response.json({ success: Boolean(admin), data: admin ? { role: admin.role } : null }, { status: admin ? 200 : 401, headers: { "Cache-Control": "no-store" } });
}
