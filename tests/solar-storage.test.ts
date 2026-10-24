import { DatabaseSync } from "node:sqlite";
import { readFileSync } from "node:fs";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { D1DatabaseLike } from "../lib/cloudflare";
import { fixture } from "./solar-fixture";
import { emptyProject } from "../lib/solar/model";

const environment = vi.hoisted(() => ({ DB: undefined as D1DatabaseLike | undefined, BILLS_BUCKET: undefined as unknown }));
vi.mock("@/lib/cloudflare", () => ({ getEnv: () => environment }));
import { createProject, duplicateProject, findProject, saveProject, storeGeneration, acquireJob, releaseJob, purgeExpiredSolarData } from "../lib/solar/store";
import { googleSolarProvider } from "../lib/solar/provider";
import { authorize } from "../lib/solar/http";
import { createAdminToken } from "../lib/auth";

let sqlite: DatabaseSync;
beforeEach(() => {
  sqlite = new DatabaseSync(":memory:"); sqlite.exec(readFileSync(new URL("../db/migrations/0010_solar_designer.sql", import.meta.url), "utf8"));
  environment.DB = { prepare(query) { return { bind(...values: unknown[]) { const statement = sqlite.prepare(query); const args = values as (string | number | null)[]; return {
    async run() { return statement.run(...args); }, async first<T>() { return statement.get(...args) as T ?? null; }, async all<T>() { return { results: statement.all(...args) as T[] }; },
  }; } }; } };
});
afterEach(() => { sqlite.close(); environment.DB = undefined; vi.unstubAllEnvs(); vi.restoreAllMocks(); });

describe("Solar persistence, retention, concurrency and authorization", () => {
  it("saves and reloads authored project settings and rejects stale concurrent edits", async () => {
    const created = await createProject(emptyProject("Delhi roof"), "admin-1");
    const saved = await saveProject(created.id, { ...created, address: "Noida NCR" }, created.revision);
    expect(saved.revision).toBe(2); expect((await findProject(created.id)).address).toBe("Noida NCR");
    await expect(saveProject(created.id, { ...created, name: "Stale edit" }, 1)).rejects.toMatchObject({ code: "REVISION_CONFLICT" });
    expect((await findProject(created.id)).name).toBe("Delhi roof");
  });
  it("preserves authored location, never stores geocoded/API location in permanent columns", async () => {
    const project = await createProject(emptyProject("Address project"), "admin");
    const generated = await storeGeneration(project.id, fixture().solar!, 1, 2);
    expect(generated.location).toBeNull(); expect(generated.solar?.insights.center.latitude).toBeCloseTo(28.6139);
    const raw = sqlite.prepare("SELECT latitude,longitude FROM solar_projects WHERE id=?").get(project.id);
    expect(raw).toMatchObject({ latitude: null, longitude: null });
  });
  it("purges expired editable Solar data while preserving fixed-media PDF records", async () => {
    const project = await createProject(emptyProject("Retention"), "admin");
    const solar = fixture().solar!; solar.expiresAt = new Date(Date.now() - 1000).toISOString();
    await storeGeneration(project.id, solar, 1, 2);
    sqlite.prepare("INSERT INTO solar_exports VALUES(?,?,?,?,?,?,?,?)").run("pdf-1", project.id, "Version A", 2, 2, 0.8, "solar-designs/pdf-1.pdf", new Date().toISOString());
    await purgeExpiredSolarData();
    expect((await findProject(project.id)).solar).toBeNull();
    expect((await findProject(project.id)).settings.selectedPanelCount).toBe(0);
    expect(sqlite.prepare("SELECT COUNT(*) AS n FROM solar_exports").get()).toMatchObject({ n: 1 });
  });
  it("duplicates authored settings but not expiring provider data", async () => {
    const project = await createProject(emptyProject("Original"), "admin");
    await storeGeneration(project.id, fixture().solar!, 1, 2);
    const copy = await duplicateProject(project.id, "admin");
    expect(copy.id).not.toBe(project.id); expect(copy.name).toBe("Original copy"); expect(copy.solar).toBeNull();
    expect(copy.settings.selectedPanelCount).toBe(0);
  });
  it("leases generation atomically and permits retry after release", async () => {
    const project = await createProject(emptyProject("Lease"), "admin");
    const token = await acquireJob(project.id);
    await expect(acquireJob(project.id)).rejects.toMatchObject({ code: "GENERATION_BUSY" });
    await releaseJob(project.id, "wrong-token");
    await expect(acquireJob(project.id)).rejects.toMatchObject({ code: "GENERATION_BUSY" });
    await releaseJob(project.id, token); expect(await acquireJob(project.id)).toBeTruthy();
  });
  it("enforces a fail-closed global request budget and does not fabricate unavailable coverage", async () => {
    vi.stubEnv("SOLAR_GOOGLE_ENABLED", "true"); vi.stubEnv("GOOGLE_SOLAR_API_KEY", "test-server-key"); vi.stubEnv("SOLAR_DAILY_REQUEST_LIMIT", "1");
    const mocked = vi.spyOn(globalThis, "fetch").mockResolvedValue(new Response("{}", { status: 404 }));
    await expect(googleSolarProvider.generate(fixture().location!)).rejects.toMatchObject({ code: "NO_COVERAGE" });
    await expect(googleSolarProvider.generate(fixture().location!)).rejects.toMatchObject({ code: "DAILY_LIMIT" });
    expect(mocked).toHaveBeenCalledTimes(1);
  });
  it("requires server-side admin authorization and rejects cross-origin mutations", async () => {
    await expect(authorize(new Request("https://site.test/api/admin/solar-projects"))).rejects.toMatchObject({ status: 401 });
    const viewer = await createAdminToken("viewer", "viewer"), admin = await createAdminToken("admin", "admin");
    await expect(authorize(new Request("https://site.test/api/admin/solar-projects", { headers: { cookie: `admin_token=${viewer}` } }))).rejects.toMatchObject({ status: 403 });
    await expect(authorize(new Request("https://site.test/api/admin/solar-projects", { headers: { cookie: `admin_token=${admin}`, origin: "https://other.test" } }), true)).rejects.toMatchObject({ status: 403 });
    expect(await authorize(new Request("https://site.test/api/admin/solar-projects", { headers: { cookie: `admin_token=${admin}`, origin: "https://site.test" } }), true)).toMatchObject({ role: "admin" });
  });
});
