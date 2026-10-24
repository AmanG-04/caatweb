import { z } from "zod";

const metric = z.number().finite().min(-2000).max(2000);
export const metricPointSchema = z.object({ x: metric, y: metric });
const polygon = z.array(metricPointSchema).min(3).max(200);
export const surveySectionSchema = z.object({
  id: z.string().min(1).max(80), name: z.string().trim().min(1).max(120),
  type: z.enum(["flat-roof", "ground"]).default("flat-roof"),
  points: polygon, height: z.number().finite().min(0).max(200).default(0),
  setback: z.number().finite().min(0).max(30).default(0),
  verified: z.boolean().default(false),
});
export const exclusionSchema = z.object({
  id: z.string().min(1).max(80), name: z.string().trim().min(1).max(120),
  kind: z.enum(["obstacle", "access-path"]), points: polygon,
  clearance: z.number().finite().min(0).max(30).default(0),
  height: z.number().finite().min(0).max(100).default(0),
});
export const arraySettingsSchema = z.object({
  label: z.string().trim().min(1).max(120).default("Example module — edit to your specification"),
  lengthMm: z.number().finite().min(100).max(6000).default(2000),
  widthMm: z.number().finite().min(100).max(4000).default(1000),
  watts: z.number().finite().min(1).max(3000).default(400),
  orientation: z.enum(["portrait", "landscape"]).default("portrait"),
  azimuth: z.number().finite().min(0).max(360).default(180),
  tilt: z.number().finite().min(0).max(75).default(0),
  panelGap: z.number().finite().min(0).max(10).default(0.02),
  rowGap: z.number().finite().min(0).max(30).default(0.5),
  maskConstraint: z.boolean().default(false),
});
export const placedPanelSchema = z.object({ id: z.string().max(80), sectionId: z.string().max(80), center: metricPointSchema });
const layoutSchema = z.object({
  id: z.string().max(80), name: z.string().trim().min(1).max(100), createdAt: z.iso.datetime(),
  inputFingerprint: z.string().max(100000), settings: arraySettingsSchema,
  panels: z.array(placedPanelSchema).max(10000),
});
export const hybridSchema = z.object({
  version: z.literal(1).default(1),
  mode: z.enum(["google", "survey"]).default("google"),
  origin: z.object({ latitude: z.number().finite().min(-80).max(80), longitude: z.number().finite().min(-180).max(180) }).nullable().default(null),
  sections: z.array(surveySectionSchema).max(30).default([]),
  exclusions: z.array(exclusionSchema).max(100).default([]),
  array: arraySettingsSchema.default(() => arraySettingsSchema.parse({})),
  layout: layoutSchema.nullable().default(null),
});
export type HybridDesign = z.infer<typeof hybridSchema>;
export type SurveySection = z.infer<typeof surveySectionSchema>;
export type Exclusion = z.infer<typeof exclusionSchema>;
export type ArraySettings = z.infer<typeof arraySettingsSchema>;
export type PlacedPanel = z.infer<typeof placedPanelSchema>;
export type HybridLayout = NonNullable<HybridDesign["layout"]>;
export const emptyHybrid = () => hybridSchema.parse({});
export function hybridFingerprint(design: HybridDesign, maskIdentity?: string | null) {
  return JSON.stringify({ origin: design.origin, sections: design.sections, exclusions: design.exclusions, array: design.array, maskIdentity: design.array.maskConstraint ? maskIdentity ?? null : null });
}
