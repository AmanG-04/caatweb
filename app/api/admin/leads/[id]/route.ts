import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { getEnv } from "@/lib/cloudflare";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type RouteContext = { params: Promise<{ id: string }> };
type LeadForDeletion = {
  customer_id: string;
  bill_object_key: string | null;
  site_photo_object_key: string | null;
};

function errorResponse(code: string, message: string, status: number) {
  return NextResponse.json({ success: false, error: { code, message } }, { status });
}

export async function DELETE(request: Request, { params }: RouteContext) {
  if (!await requireAdmin(request)) return errorResponse("UNAUTHORIZED", "Admin login required.", 401);

  const { id } = await params;
  const { DB: db, BILLS_BUCKET: bucket } = getEnv();
  if (!db) return errorResponse("DATABASE_UNAVAILABLE", "Lead storage is not available.", 503);

  try {
    const lead = await db
      .prepare("SELECT customer_id, bill_object_key, site_photo_object_key FROM leads WHERE id = ?")
      .bind(id)
      .first<LeadForDeletion>();

    if (!lead) return errorResponse("NOT_FOUND", "Lead not found.", 404);

    await db.prepare("DELETE FROM quotes WHERE lead_id = ?").bind(id).run();
    await db.prepare("DELETE FROM lead_notes WHERE lead_id = ?").bind(id).run();
    await db.prepare("DELETE FROM lead_status_history WHERE lead_id = ?").bind(id).run();
    await db.prepare("DELETE FROM salesperson_assignments WHERE lead_id = ?").bind(id).run();
    await db.prepare("DELETE FROM leads WHERE id = ?").bind(id).run();
    await db.prepare("DELETE FROM customers WHERE id = ? AND NOT EXISTS (SELECT 1 FROM leads WHERE customer_id = ?)").bind(lead.customer_id, lead.customer_id).run();

    if (bucket?.delete) {
      for (const key of [lead.bill_object_key, lead.site_photo_object_key]) {
        if (key) {
          try {
            await bucket.delete(key);
          } catch (error) {
            console.error("lead_file_delete_failed", { leadId: id, key, error: error instanceof Error ? error.message : String(error) });
          }
        }
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("lead_delete_failed", { leadId: id, error: error instanceof Error ? error.message : String(error) });
    return errorResponse("LEAD_DELETE_FAILED", "The lead could not be deleted.", 500);
  }
}
