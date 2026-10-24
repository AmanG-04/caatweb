import { getEnv } from "@/lib/cloudflare";
import { projectInputSchema, solarResultSchema, type DesignExport, type Project, type ProjectInput, type SolarResult } from "./model";
import { SolarError } from "./provider";
import { layoutIssues, usableSections } from "./hybrid-engine";

type Row = { id: string; name: string; address: string; latitude: number | null; longitude: number | null; revision: number; schema_version: number; settings_json: string; solar_json: string | null; solar_expires_at: string | null; created_at: string; updated_at: string };
export function database() {
  const db = getEnv().DB;
  if (!db) throw new SolarError("DATABASE_UNAVAILABLE", "D1 storage is not configured. Projects cannot be saved in this environment.", 503);
  return db;
}
export async function purgeExpiredSolarData() {
  await database().prepare("UPDATE solar_projects SET solar_json=NULL, settings_json=CASE WHEN json_extract(settings_json,'$.hybrid.layout.settings.maskConstraint')=1 THEN json_set(settings_json,'$.hybrid.layout',NULL) ELSE settings_json END WHERE solar_expires_at <= ? AND solar_json IS NOT NULL").bind(new Date().toISOString()).run();
}
function decode(row: Row): Project {
  const expired = Boolean(row.solar_expires_at && row.solar_expires_at <= new Date().toISOString());
  return {
    ...projectInputSchema.parse({ schemaVersion: row.schema_version, name: row.name, address: row.address,
      location: row.latitude !== null && row.longitude !== null ? { latitude: row.latitude, longitude: row.longitude } : null,
      settings: { ...JSON.parse(row.settings_json), ...(expired ? { selectedPanelCount: 0 } : {}) } }),
    id: row.id, revision: row.revision, createdAt: row.created_at, updatedAt: row.updated_at,
    solar: row.solar_json && !expired ? solarResultSchema.parse(JSON.parse(row.solar_json)) : null, solarExpired: expired,
  };
}
export async function listProjects() {
  await purgeExpiredSolarData();
  const rows = await database().prepare("SELECT id,name,address,revision,created_at,updated_at,solar_expires_at FROM solar_projects ORDER BY updated_at DESC LIMIT 500").bind().all<Omit<Row, "solar_json" | "settings_json">>();
  return rows.results;
}
export async function findProject(id: string) {
  await purgeExpiredSolarData();
  const row = await database().prepare("SELECT * FROM solar_projects WHERE id=?").bind(id).first<Row>();
  if (!row) throw new SolarError("NOT_FOUND", "Project not found.", 404);
  return decode(row);
}
export async function createProject(input: ProjectInput, adminId: string) {
  usableSections(input.settings.hybrid);
  const id = crypto.randomUUID(), now = new Date().toISOString();
  await database().prepare("INSERT INTO solar_projects(id,name,address,latitude,longitude,settings_json,created_by,created_at,updated_at) VALUES(?,?,?,?,?,?,?,?,?)")
    .bind(id, input.name, input.address, input.location?.latitude ?? null, input.location?.longitude ?? null, JSON.stringify(input.settings), adminId, now, now).run();
  return findProject(id);
}
export async function saveProject(id: string, input: ProjectInput, revision: number) {
  if (new TextEncoder().encode(JSON.stringify(input.settings)).byteLength > 1000000) throw new SolarError("DESIGN_TOO_LARGE", "Survey layout settings exceed 1 MB. Split the site into smaller projects.", 422);
  const existing = await findProject(id);
  if (existing.revision !== revision) throw new SolarError("REVISION_CONFLICT", "This project changed in another session. Reload before saving.", 409);
  if (input.settings.selectedPanelCount > (existing.solar?.insights.solarPotential.solarPanels.length ?? 0)) throw new SolarError("VALIDATION_ERROR", "Selected panel count exceeds the current provider result.", 400);
  if (input.settings.excludedSegments.some(index => index >= (existing.solar?.insights.solarPotential.roofSegmentStats.length ?? 0))) throw new SolarError("VALIDATION_ERROR", "An excluded roof section does not exist in the current building result.", 400);
  try {
    usableSections(input.settings.hybrid);
    // Allow stale layouts while editing, but reject newly submitted invalid
    // footprints. Export separately enforces that the applied layout is current.
    if (input.settings.hybrid.layout && input.settings.hybrid.layout.id !== existing.settings.hybrid.layout?.id) {
      const issues = layoutIssues(input.settings.hybrid, existing.solar?.mask, existing.solar?.fetchedAt);
      if (issues.length) throw new Error(issues[0]);
    }
  } catch (error) { throw new SolarError("GEOMETRY_INVALID", error instanceof Error ? error.message : "Invalid survey geometry.", 400); }
  const row = await database().prepare("UPDATE solar_projects SET name=?,address=?,latitude=?,longitude=?,settings_json=?,revision=revision+1,updated_at=? WHERE id=? AND revision=? RETURNING id")
    .bind(input.name, input.address, input.location?.latitude ?? null, input.location?.longitude ?? null, JSON.stringify(input.settings), new Date().toISOString(), id, revision).first();
  if (!row) throw new SolarError("REVISION_CONFLICT", "This project changed in another session. Reload the latest project before editing; your edits have not overwritten it.", 409);
  return findProject(id);
}
export async function storeGeneration(id: string, solar: SolarResult, revision: number, count: number) {
  const serialized = JSON.stringify(solar);
  if (new TextEncoder().encode(serialized).byteLength > 1800000) throw new SolarError("DESIGN_TOO_LARGE", "This building result exceeds D1's supported row size. Choose a smaller site.", 422);
  const project = await findProject(id);
  const settings = { ...project.settings, selectedPanelCount: count, confirmedBuildingName: "", excludedSegments: [] };
  // Keep authored coordinates separate. API/geocoder coordinates only live in
  // the expiring provider result, never permanent project location columns.
  const row = await database().prepare("UPDATE solar_projects SET solar_json=?,solar_expires_at=?,settings_json=?,revision=revision+1,updated_at=? WHERE id=? AND revision=? RETURNING id")
    .bind(serialized, solar.expiresAt, JSON.stringify(settings), new Date().toISOString(), id, revision).first();
  if (!row) throw new SolarError("REVISION_CONFLICT", "Project changed during generation. The new layout was not applied; reload and try again.", 409);
  return findProject(id);
}
export async function duplicateProject(id: string, adminId: string) {
  const project = await findProject(id);
  // Duplicate authored project settings, not Google's expiring content or fixed exports.
  return createProject({ ...project, name: `${project.name.slice(0, 110)} copy`, settings: { ...project.settings, selectedPanelCount: 0, confirmedBuildingName: "", excludedSegments: [] } }, adminId);
}
export async function listExports(id: string) {
  await findProject(id);
  const rows = await database().prepare("SELECT id,name,design_revision,panel_count,capacity_kwp,created_at FROM solar_exports WHERE project_id=? ORDER BY created_at DESC").bind(id).all<DesignExport>();
  return rows.results;
}
export async function acquireJob(id: string) {
  const token = crypto.randomUUID(), now = new Date().toISOString();
  const row = await database().prepare("INSERT INTO solar_jobs(project_id,token,expires_at) VALUES(?,?,?) ON CONFLICT(project_id) DO UPDATE SET token=excluded.token,expires_at=excluded.expires_at WHERE expires_at < ? RETURNING token")
    .bind(id, token, new Date(Date.now() + 10 * 60000).toISOString(), now).first<{ token: string }>();
  if (!row) throw new SolarError("GENERATION_BUSY", "This project is already generating in another session. Wait before trying again.", 409);
  return token;
}
export async function releaseJob(id: string, token: string) {
  await database().prepare("DELETE FROM solar_jobs WHERE project_id=? AND token=?").bind(id, token).run();
}
