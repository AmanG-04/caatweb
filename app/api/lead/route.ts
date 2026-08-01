import { NextResponse } from "next/server";
import { quoteFormSchema } from "@/lib/validation";
import { calculateQuote } from "@/lib/quote-engine";
import { loadQuoteSettings } from "@/lib/quote-settings";
import { getEnv } from "@/lib/cloudflare";

export const runtime = "nodejs";

type ExistingQuote = { id: string; lead_id: string; name: string; email: string; phone: string; created_at: string; result_json: string };

export async function POST(request: Request) {
  try {
    let raw: Record<string, unknown>;
    try {
      raw = JSON.parse(await request.text()) as Record<string, unknown>;
    } catch {
      return NextResponse.json({ success: false, error: { code: "INVALID_JSON", message: "Request body must be valid JSON." } }, { status: 400 });
    }
    const allowDuplicate = raw.allowDuplicate === true;
    const parsed = quoteFormSchema.safeParse(raw);
    if (!parsed.success) return NextResponse.json({ success: false, error: { code: "VALIDATION_ERROR", message: "Please check the highlighted fields.", fields: parsed.error.flatten().fieldErrors } }, { status: 400 });
    const d = parsed.data;
    if (!d.billObjectKey) return NextResponse.json({ success: false, error: { code: "BILL_REQUIRED", message: "Please upload your electricity bill." } }, { status: 400 });
    const db = getEnv().DB;

    if (db && !allowDuplicate) {
      const existing = await db.prepare("SELECT q.id,q.lead_id,q.result_json,q.created_at,c.name,c.email,c.phone FROM quotes q JOIN leads l ON l.id=q.lead_id JOIN customers c ON c.id=l.customer_id WHERE lower(c.email)=lower(?) OR c.phone=? ORDER BY q.created_at DESC LIMIT 1")
        .bind(d.email, d.phone).first<ExistingQuote>();
      if (existing) return NextResponse.json({ success: false, error: { code: "DUPLICATE_QUOTE", message: "An estimate already exists for this phone number or email address.", existingQuote: { id: existing.id, name: existing.name, createdAt: existing.created_at, result: JSON.parse(existing.result_json) } } }, { status: 409 });
    }

    const settings = await loadQuoteSettings();
    const quote = calculateQuote({ ...settings, tariff: d.pricePerUnit, monthlyUnits: d.monthlyUnits, propertyType: d.propertyType, roofType: d.roofType });
    const leadId = crypto.randomUUID(); const quoteId = crypto.randomUUID();
    if (db) {
      const customerId = crypto.randomUUID();
      await db.prepare("INSERT INTO customers (id,name,phone,email,address,city,state,pincode) VALUES (?,?,?,?,?,?,?,?)").bind(customerId, d.name, d.phone, d.email, d.address, d.city, d.state, d.pincode).run();
      await db.prepare("INSERT INTO leads (id,customer_id,property_type,roof_type,ownership,system_type,battery_required,monthly_bill,monthly_units,price_per_unit,provider,bill_object_key,site_photo_object_key) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)").bind(leadId, customerId, d.propertyType, d.roofType, d.ownership, d.systemType, d.batteryRequired === "yes" ? 1 : 0, 0, d.monthlyUnits, d.pricePerUnit, d.provider ?? null, d.billObjectKey, d.sitePhotoObjectKey ?? null).run();
      await db.prepare("INSERT INTO quotes (id,lead_id,engine_version,settings_snapshot,result_json) VALUES (?,?,?,?,?)").bind(quoteId, leadId, "template-v1", JSON.stringify(settings), JSON.stringify(quote)).run();
    }
    return NextResponse.json({ success: true, data: { leadId, quote: { id: quoteId, ...quote } } });
  } catch (error) {
    console.error("lead_creation_failed", { error: error instanceof Error ? error.message : String(error) });
    return NextResponse.json({ success: false, error: { code: "LEAD_CREATION_FAILED", message: "The estimate could not be created. Please try again." } }, { status: 500 });
  }
}
