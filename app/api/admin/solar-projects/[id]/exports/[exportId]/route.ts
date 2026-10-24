import { getEnv } from "@/lib/cloudflare";
import { authorize, failure } from "@/lib/solar/http";
import { database } from "@/lib/solar/store";
import { SolarError } from "@/lib/solar/provider";

export const dynamic = "force-dynamic";
export async function GET(request: Request, { params }: { params: Promise<{ id: string; exportId: string }> }) {
  try {
    await authorize(request); const { id, exportId } = await params;
    const row = await database().prepare("SELECT object_key FROM solar_exports WHERE id=? AND project_id=?").bind(exportId, id).first<{ object_key: string }>();
    if (!row) throw new SolarError("NOT_FOUND", "PDF version not found.", 404);
    const object = await getEnv().BILLS_BUCKET?.get?.(row.object_key);
    if (!object) throw new SolarError("STORAGE_UNAVAILABLE", "The saved PDF could not be retrieved.", 503);
    return new Response(object.body, { headers: { "Content-Type": "application/pdf", "Content-Disposition": `attachment; filename="solar-layout-${exportId}.pdf"`, "Cache-Control": "private, no-store", "X-Content-Type-Options": "nosniff" } });
  } catch (error) { return failure(error); }
}
