import { z } from "zod";
import { authorize, body, failure, json } from "@/lib/solar/http";
import { acquireJob, findProject, releaseJob, storeGeneration } from "@/lib/solar/store";
import { googleSolarProvider, SolarError } from "@/lib/solar/provider";
import { persistLayoutPdf } from "@/lib/solar/pdf";
import { getEnv } from "@/lib/cloudflare";

export const dynamic = "force-dynamic";
export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  let token: string | undefined, id: string | undefined;
  try {
    await authorize(request, true); id = (await params).id;
    const parsed = z.object({ revision: z.number().int().positive() }).safeParse(await body(request));
    if (!parsed.success) throw new SolarError("VALIDATION_ERROR", "A current design revision is required.", 400);
    const project = await findProject(id);
    if (project.revision !== parsed.data.revision) throw new SolarError("REVISION_CONFLICT", "Reload this project before generating.", 409);
    if (!project.settings.requestConfirmed || !project.settings.requestedBy.trim()) throw new SolarError("USER_REQUEST_REQUIRED", "Record the requester and confirm that this address-specific design was requested.", 422);
    if (!project.location && !project.address.trim()) throw new SolarError("LOCATION_REQUIRED", "Enter an address or site coordinates.", 422);
    if (!getEnv().BILLS_BUCKET) throw new SolarError("STORAGE_UNAVAILABLE", "Configure R2 before generation so the PDF design can be permanently stored.", 503);
    token = await acquireJob(id);
    const location = project.location ?? await googleSolarProvider.geocode(project.address);
    const solar = await googleSolarProvider.generate(location);
    solar.requestedAddress = project.address;
    const count = Math.min(solar.insights.solarPotential.maxArrayPanelsCount, solar.insights.solarPotential.solarPanels.length);
    const saved = await storeGeneration(id, solar, project.revision, count);
    try {
      const exportId = await persistLayoutPdf(saved);
      return json({ project: saved, exportId });
    } catch {
      // Never disguise an R2/PDF failure as a permanently saved design.
      return json({ project: saved, exportId: null, warning: "Layout generated, but its PDF could not be stored. Retry 'Save PDF version' before the live data expires." });
    }
  } catch (error) { return failure(error); }
  finally { if (id && token) await releaseJob(id, token).catch(() => undefined); }
}
