import { z } from "zod";
import { authorize, body, failure, json } from "@/lib/solar/http";
import { findProject, listExports } from "@/lib/solar/store";
import { persistLayoutPdf } from "@/lib/solar/pdf";
import { SolarError } from "@/lib/solar/provider";

export const dynamic = "force-dynamic";
type Context = { params: Promise<{ id: string }> };
export async function GET(request: Request, { params }: Context) {
  try { await authorize(request); return json({ items: await listExports((await params).id) }); } catch (error) { return failure(error); }
}
export async function POST(request: Request, { params }: Context) {
  try {
    await authorize(request, true); const project = await findProject((await params).id);
    const parsed = z.object({ revision: z.number().int().positive() }).safeParse(await body(request));
    if (!parsed.success) throw new SolarError("VALIDATION_ERROR", "A current design revision is required.", 400);
    if (parsed.data.revision !== project.revision) throw new SolarError("REVISION_CONFLICT", "Save and reload the current revision before exporting.", 409);
    if (project.settings.hybrid.mode !== "survey") {
      if (project.solar && project.location && (Math.abs(project.location.latitude - project.solar.requestedLocation.latitude) > 0.00001 || Math.abs(project.location.longitude - project.solar.requestedLocation.longitude) > 0.00001)) throw new SolarError("LOCATION_CHANGED", "Generate again for the new coordinates before exporting.", 422);
      if (project.solar && project.address !== project.solar.requestedAddress) throw new SolarError("LOCATION_CHANGED", "Generate again for the changed address before exporting.", 422);
    }
    return json({ exportId: await persistLayoutPdf(project) }, 201);
  } catch (error) { return failure(error); }
}
