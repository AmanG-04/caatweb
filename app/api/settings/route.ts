import { NextResponse } from "next/server";
import { TEMPLATE_QUOTE_SETTINGS } from "@/lib/settings";
import { getEnv } from "@/lib/cloudflare";
import { requireAdmin } from "@/lib/auth";
export const runtime = "edge";
export async function GET() { const db=getEnv().DB; if(db){const rows=await db.prepare("SELECT key,value,value_type FROM settings").bind().all<{key:string;value:string;value_type:string}>(); const settings={...TEMPLATE_QUOTE_SETTINGS}; for(const row of rows.results){(settings as Record<string,unknown>)[row.key]=row.value_type==="number"?Number(row.value):row.value;} return NextResponse.json({success:true,data:settings});} return NextResponse.json({success:true,data:TEMPLATE_QUOTE_SETTINGS}); }
export async function PATCH(request: Request) {
  if(!await requireAdmin(request)) return NextResponse.json({success:false,error:{code:"UNAUTHORIZED",message:"Admin login required."}},{status:401});
  const body = await request.json() as Record<string, unknown>;
  const allowed = Object.keys(TEMPLATE_QUOTE_SETTINGS);
  const invalid = Object.keys(body).filter((key) => !allowed.includes(key));
  if (invalid.length) return NextResponse.json({ success: false, error: { code: "INVALID_SETTING", message: `Unknown setting: ${invalid[0]}` } }, { status: 400 });
  const db=getEnv().DB; if(db){for(const [key,value] of Object.entries(body)) await db.prepare("INSERT INTO settings (key,value,value_type,updated_at) VALUES (?,?,?,CURRENT_TIMESTAMP) ON CONFLICT(key) DO UPDATE SET value=excluded.value,updated_at=CURRENT_TIMESTAMP").bind(key,String(value),typeof value==="number"?"number":"text").run();}
  return NextResponse.json({ success: true, data: { ...TEMPLATE_QUOTE_SETTINGS, ...body } });
}
