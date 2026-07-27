import { NextResponse } from "next/server";
import { quoteFormSchema } from "@/lib/validation";
import { calculateQuote } from "@/lib/quote-engine";
import { loadQuoteSettings } from "@/lib/quote-settings";
import { getEnv } from "@/lib/cloudflare";

export const runtime = "nodejs";

type ExistingQuote = { id: string; lead_id: string; name: string; email: string; phone: string; created_at: string; result_json: string };

export async function POST(request: Request) {
  const raw = await request.json() as Record<string, unknown>;
  const allowDuplicate = raw.allowDuplicate === true;
  const parsed = quoteFormSchema.safeParse(raw);
  if (!parsed.success) return NextResponse.json({ success: false, error: { code: "VALIDATION_ERROR", message: "Please check the highlighted fields.", fields: parsed.error.flatten().fieldErrors } }, { status: 400 });
  const d = parsed.data;
  const db = getEnv().DB;

  if (db && !allowDuplicate) {
    const existing = await db.prepare("SELECT q.id,q.lead_id,q.result_json,q.created_at,c.name,c.email,c.phone FROM quotes q JOIN leads l ON l.id=q.lead_id JOIN customers c ON c.id=l.customer_id WHERE lower(c.email)=lower(?) OR c.phone=? ORDER BY q.created_at DESC LIMIT 1")
      .bind(d.email, d.phone).first<ExistingQuote>();
    if (existing) return NextResponse.json({ success: false, error: { code: "DUPLICATE_QUOTE", message: "An estimate already exists for this phone number or email address.", existingQuote: { id: existing.id, name: existing.name, createdAt: existing.created_at, result: JSON.parse(existing.result_json) } } }, { status: 409 });
  }

  const settings = await loadQuoteSettings();
  const quote = calculateQuote({ ...settings, monthlyBill: d.monthlyBill, monthlyUnits: d.monthlyUnits, propertyType: d.propertyType, roofType: d.roofType });
  const leadId = crypto.randomUUID(); const quoteId = crypto.randomUUID();
  if (db) {
    const customerId = crypto.randomUUID();
    await db.prepare("INSERT INTO customers (id,name,phone,email,city,state,pincode) VALUES (?,?,?,?,?,?,?)").bind(customerId, d.name, d.phone, d.email, d.city, d.state, d.pincode).run();
    await db.prepare("INSERT INTO leads (id,customer_id,property_type,roof_type,ownership,monthly_bill,monthly_units,provider,bill_object_key) VALUES (?,?,?,?,?,?,?,?,?)").bind(leadId, customerId, d.propertyType, d.roofType, d.ownership, d.monthlyBill, d.monthlyUnits ?? null, d.provider, d.billObjectKey ?? null).run();
    await db.prepare("INSERT INTO quotes (id,lead_id,engine_version,settings_snapshot,result_json) VALUES (?,?,?,?,?)").bind(quoteId, leadId, "template-v1", JSON.stringify(settings), JSON.stringify(quote)).run();
  }
  return NextResponse.json({ success: true, data: { leadId, quote: { id: quoteId, ...quote } } });
}
