import { NextResponse } from "next/server";
import { TEMPLATE_QUOTE_SETTINGS } from "@/lib/settings";
import { getEnv } from "@/lib/cloudflare";
import { requireAdmin } from "@/lib/auth";
import { settingsSchema } from "@/lib/validation";

export const runtime = "edge";

async function readSettings(): Promise<Record<string, unknown>> {
  const db = getEnv().DB;
  if (!db) return TEMPLATE_QUOTE_SETTINGS;
  const rows = await db.prepare("SELECT key,value,value_type FROM settings").bind().all<{ key: string; value: string; value_type: string }>();
  const settings: Record<string, unknown> = { ...TEMPLATE_QUOTE_SETTINGS };
  for (const row of rows.results) settings[row.key] = row.value_type === "number" ? Number(row.value) : row.value;
  return settings;
}

export async function GET(request: Request) {
  if (!await requireAdmin(request)) return NextResponse.json({ success: false, error: { code: "UNAUTHORIZED", message: "Admin login required." } }, { status: 401 });
  return NextResponse.json({ success: true, data: await readSettings() }, { headers: { "Cache-Control": "no-store" } });
}

export async function PATCH(request: Request) {
  const admin = await requireAdmin(request);
  if (!admin) return NextResponse.json({ success: false, error: { code: "UNAUTHORIZED", message: "Admin login required." } }, { status: 401 });
  if (admin.role !== "admin") return NextResponse.json({ success: false, error: { code: "FORBIDDEN", message: "Only administrators can change quote settings." } }, { status: 403 });

  let raw: unknown;
  try { raw = await request.json(); } catch { return NextResponse.json({ success: false, error: { code: "INVALID_JSON", message: "Request body must be valid JSON." } }, { status: 400 }); }
  const parsed = settingsSchema.safeParse(raw);
  if (!parsed.success) return NextResponse.json({ success: false, error: { code: "INVALID_SETTING", message: "One or more settings are invalid.", fields: parsed.error.flatten().fieldErrors } }, { status: 400 });

  const body = parsed.data;
  const db = getEnv().DB;
  if (db) {
    const current = await readSettings();
    for (const [key, value] of Object.entries(body)) {
      if (value === undefined) continue;
      await db.prepare("INSERT INTO settings (key,value,value_type,updated_at) VALUES (?,?,?,CURRENT_TIMESTAMP) ON CONFLICT(key) DO UPDATE SET value=excluded.value, value_type=excluded.value_type, updated_at=CURRENT_TIMESTAMP")
        .bind(key, String(value), "number").run();
      await db.prepare("INSERT INTO settings_audit (id,admin_id,setting_key,old_value,new_value) VALUES (?,?,?,?,?)")
        .bind(crypto.randomUUID(), admin.adminId, key, current[key] === undefined ? null : String(current[key]), String(value)).run();
    }
  }
  return NextResponse.json({ success: true, data: { ...TEMPLATE_QUOTE_SETTINGS, ...body } });
}
