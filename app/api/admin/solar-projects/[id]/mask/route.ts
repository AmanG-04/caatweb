import { z } from "zod";
import { authorize, body, failure, json } from "@/lib/solar/http";
import { acquireJob, database, findProject, releaseJob } from "@/lib/solar/store";
import { fetchRoofMask, SolarError } from "@/lib/solar/provider";

export const dynamic = "force-dynamic";
export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  let token: string | undefined, id: string | undefined;
  try {
    await authorize(request, true); id = (await params).id;
    const parsed = z.object({ revision: z.number().int().positive() }).safeParse(await body(request));
    if (!parsed.success) throw new SolarError("VALIDATION_ERROR", "A current revision is required.", 400);
    const project = await findProject(id);
    if (project.revision !== parsed.data.revision) throw new SolarError("REVISION_CONFLICT", "Reload the latest project before retrying its mask.", 409);
    if (!project.solar) throw new SolarError("NO_DESIGN", "Generate current building data first.", 422);
    token = await acquireJob(id);
    const mask = await fetchRoofMask(project.solar.insights.center);
    const serialized = JSON.stringify({ ...project.solar, mask, maskWarning: null });
    if (new TextEncoder().encode(serialized).byteLength > 1800000) throw new SolarError("DESIGN_TOO_LARGE", "Roof mask exceeds the project's supported storage size.", 422);
    const row = await database().prepare("UPDATE solar_projects SET solar_json=?,revision=revision+1,updated_at=? WHERE id=? AND revision=? AND solar_expires_at>? RETURNING id")
      .bind(serialized, new Date().toISOString(), id, project.revision, new Date().toISOString()).first();
    if (!row) throw new SolarError("REVISION_CONFLICT", "The project changed or expired while downloading its mask. Reload before retrying.", 409);
    return json({ project: await findProject(id) });
  } catch (error) { return failure(error); }
  finally { if (id && token) await releaseJob(id, token).catch(() => undefined); }
}
