import { projectInputSchema } from "@/lib/solar/model";
import { createProject, listProjects } from "@/lib/solar/store";
import { authorize, body, failure, json } from "@/lib/solar/http";
import { SolarError } from "@/lib/solar/provider";

export const dynamic = "force-dynamic";
export async function GET(request: Request) {
  try { await authorize(request); return json({ items: await listProjects() }); } catch (error) { return failure(error); }
}
export async function POST(request: Request) {
  try {
    const admin = await authorize(request, true), parsed = projectInputSchema.safeParse(await body(request));
    if (!parsed.success) throw new SolarError("VALIDATION_ERROR", "Check project name, address, coordinates and settings.", 400);
    return json(await createProject(parsed.data, admin.adminId), 201);
  } catch (error) { return failure(error); }
}
