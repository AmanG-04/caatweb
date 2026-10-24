import { z } from "zod";

export const locationSchema = z.object({ latitude: z.number().finite().min(-85).max(85), longitude: z.number().finite().min(-180).max(180) });
const positive = z.number().finite().positive();
export const settingsSchema = z.object({
  selectedPanelCount: z.number().int().min(0).max(20000).default(0),
  versionName: z.string().trim().min(1).max(100).default("Automatic layout"),
  requestedBy: z.string().trim().max(160).default(""),
  requestConfirmed: z.boolean().default(false),
  notes: z.string().max(2000).default(""),
});
export const projectInputSchema = z.object({
  schemaVersion: z.literal(1),
  name: z.string().trim().min(1).max(120),
  address: z.string().trim().max(400),
  location: locationSchema.nullable(),
  settings: settingsSchema,
});
const dateSchema = z.object({ year: z.number().int(), month: z.number().int().min(1).max(12), day: z.number().int().min(1).max(31) });
const boundsSchema = z.object({ sw: locationSchema, ne: locationSchema });
const statsSchema = z.object({ areaMeters2: z.number().nonnegative(), groundAreaMeters2: z.number().nonnegative() });
export const insightsSchema = z.object({
  name: z.string(), center: locationSchema, boundingBox: boundsSchema,
  imageryDate: dateSchema.optional(), imageryProcessedDate: dateSchema.optional(),
  imageryQuality: z.enum(["HIGH", "MEDIUM", "BASE"]),
  solarPotential: z.object({
    maxArrayPanelsCount: z.number().int().nonnegative().max(20000),
    panelCapacityWatts: positive.max(5000), panelHeightMeters: positive.max(20), panelWidthMeters: positive.max(20),
    wholeRoofStats: statsSchema,
    roofSegmentStats: z.array(z.object({
      pitchDegrees: z.number().finite().min(0).max(85), azimuthDegrees: z.number().finite().min(0).max(360),
      stats: statsSchema, center: locationSchema, boundingBox: boundsSchema, planeHeightAtCenterMeters: z.number().finite(),
    })).max(5000),
    solarPanels: z.array(z.object({ center: locationSchema, orientation: z.enum(["LANDSCAPE", "PORTRAIT"]), segmentIndex: z.number().int().nonnegative() })).max(20000).default([]),
    solarPanelConfigs: z.array(z.object({ panelsCount: z.number().int().nonnegative().max(20000) })).max(20000).default([]),
  }),
}).superRefine((value, context) => {
  if (value.solarPotential.solarPanels.some(panel => panel.segmentIndex >= value.solarPotential.roofSegmentStats.length)) {
    context.addIssue({ code: "custom", message: "Panel references a missing roof segment." });
  }
});

// Original binary mask pixels, run-length encoded; NOT a traced boundary.
export const maskSchema = z.object({
  width: z.number().int().positive().max(4096), height: z.number().int().positive().max(4096),
  crs: z.string().max(100), origin: z.tuple([z.number().finite(), z.number().finite()]),
  resolution: z.tuple([z.number().finite(), z.number().finite()]),
  runs: z.array(z.tuple([z.number().int().nonnegative(), z.number().int().nonnegative(), z.number().int().positive()])).max(300000),
}).superRefine((mask, ctx) => {
  if (!mask.resolution[0] || !mask.resolution[1] || mask.runs.some(([y, x, n]) => y >= mask.height || x + n > mask.width)) {
    ctx.addIssue({ code: "custom", message: "Invalid mask pixels or transform." });
  }
});
export const solarResultSchema = z.object({
  provider: z.literal("google-solar"), fetchedAt: z.iso.datetime(), expiresAt: z.iso.datetime(),
  requestedLocation: locationSchema,
  requestedAddress: z.string().max(400),
  insights: insightsSchema, mask: maskSchema.nullable(), maskWarning: z.string().max(500).nullable(),
});
export type Location = z.infer<typeof locationSchema>;
export type Insights = z.infer<typeof insightsSchema>;
export type RoofMask = z.infer<typeof maskSchema>;
export type SolarResult = z.infer<typeof solarResultSchema>;
export type ProjectInput = z.infer<typeof projectInputSchema>;
export type Project = ProjectInput & { id: string; revision: number; createdAt: string; updatedAt: string; solar: SolarResult | null; solarExpired: boolean };
export type DesignExport = { id: string; name: string; design_revision: number; panel_count: number; capacity_kwp: number; created_at: string };
export const emptyProject = (name: string): ProjectInput => ({ schemaVersion: 1, name, address: "", location: null, settings: settingsSchema.parse({}) });
export function selectedPanels(project: Pick<Project, "solar" | "settings">) {
  return project.solar?.insights.solarPotential.solarPanels.slice(0, project.settings.selectedPanelCount) ?? [];
}
export function capacityKwp(count: number, watts: number) { return count * watts / 1000; }
export function imageryDate(date?: { year: number; month: number; day: number }) {
  return date ? `${date.year}-${String(date.month).padStart(2, "0")}-${String(date.day).padStart(2, "0")}` : "Not supplied";
}
