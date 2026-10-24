import { z } from "zod";
import { projectInputSchema } from "@/lib/solar/model";
import { database, duplicateProject, findProject, saveProject } from "@/lib/solar/store";
import { authorize, body, failure, json } from "@/lib/solar/http";
import { SolarError } from "@/lib/solar/provider";
import { getEnv } from "@/lib/cloudflare";

type Context = { params: Promise<{ id: string }> };
export const dynamic = "force-dynamic";
export async function GET(request: Request, context: Context) {
  try { await authorize(request); return json(await findProject((await context.params).id)); } catch (error) { return failure(error); }
}
export async function PATCH(request: Request, context: Context) {
  try {
    await authorize(request, true);
    const parsed = z.object({ project: projectInputSchema, revision: z.number().int().positive() }).safeParse(await body(request));
    if (!parsed.success) throw new SolarError("VALIDATION_ERROR", "Invalid project settings or revision.", 400);
    return json(await saveProject((await context.params).id, parsed.data.project, parsed.data.revision));
  } catch (error) { return failure(error); }
}
export async function POST(request: Request, context: Context) {
  try { const admin = await authorize(request, true); return json(await duplicateProject((await context.params).id, admin.adminId), 201); } catch (error) { return failure(error); }
}
export async function DELETE(request: Request, context: Context) {
  try {
    await authorize(request, true); const id = (await context.params).id; await findProject(id);
    const lease = await database().prepare("SELECT token FROM solar_jobs WHERE project_id=? AND expires_at>? ").bind(id, new Date().toISOString()).first();
    if (lease) throw new SolarError("GENERATION_BUSY", "Wait for generation to finish before deleting this project.", 409);
    const exports = await database().prepare("SELECT object_key FROM solar_exports WHERE project_id=?").bind(id).all<{ object_key: string }>();
    if (exports.results.length && !getEnv().BILLS_BUCKET?.delete) throw new SolarError("STORAGE_UNAVAILABLE", "R2 is required to delete this project's PDFs.", 503);
    for (const item of exports.results) await getEnv().BILLS_BUCKET!.delete!(item.object_key);
    await database().prepare("DELETE FROM solar_projects WHERE id=?").bind(id).run(); return json({ deleted: true });
  } catch (error) { return failure(error); }
}
