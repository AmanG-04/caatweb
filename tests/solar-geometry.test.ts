import { describe, expect, it } from "vitest";
import { distance, footprintsOverlap, localFrame, maskGeo, panelCorners, pointOnMask, polygonArea, projectedLength, surfaceArea } from "../lib/solar/geometry";
import { capacityKwp, projectInputSchema, selectedPanels, solarResultSchema } from "../lib/solar/model";
import { fixture, maskFixture } from "./solar-fixture";

describe("Solar metric geometry and versioned data", () => {
  it("round-trips NCR coordinates and resolves metre distances independent of screen dimensions", () => {
    const project = fixture(), frame = localFrame(project.location!);
    const p = { x: 123.456, y: -87.65 };
    const back = frame.toLocal(frame.toGeo(p));
    expect(back.x).toBeCloseTo(p.x, 5); expect(back.y).toBeCloseTo(p.y, 5);
    expect(distance({ x: 0, y: 0 }, { x: 3, y: 4 })).toBe(5);
    const north = frame.toLocal({ latitude: project.location!.latitude + 0.0001, longitude: project.location!.longitude });
    expect(north.x).toBeCloseTo(0, 6); expect(north.y).toBeGreaterThan(11);
  });
  it("measures concave horizontal area and distinguishes sloped surface and projection", () => {
    const concave = [{ x: 0, y: 0 }, { x: 4, y: 0 }, { x: 4, y: 1 }, { x: 1, y: 1 }, { x: 1, y: 4 }, { x: 0, y: 4 }];
    expect(polygonArea(concave)).toBe(7);
    expect(surfaceArea(100, 60)).toBeCloseTo(200);
    expect(projectedLength(2, 60)).toBeCloseTo(1);
  });
  it("uses real portrait/landscape panel dimensions and downslope heights at arbitrary azimuth", () => {
    const insights = fixture().solar!.insights;
    for (const azimuth of [0, 37, 90, 180, 275]) {
      insights.solarPotential.roofSegmentStats[0].azimuthDegrees = azimuth;
      const portrait = panelCorners(insights, insights.solarPotential.solarPanels[0]);
      expect(distance(portrait[0], portrait[1])).toBeCloseTo(1);
      expect(distance(portrait[1], portrait[2])).toBeCloseTo(Math.sqrt(3));
      expect(Math.hypot(distance(portrait[1], portrait[2]), portrait[1].z - portrait[2].z)).toBeCloseTo(2);
      const landscape = panelCorners(insights, insights.solarPotential.solarPanels[1]);
      expect(distance(landscape[0], landscape[1])).toBeCloseTo(2);
      expect(distance(landscape[1], landscape[2])).toBeCloseTo(Math.sqrt(3) / 2);
    }
  });
  it("detects footprint overlaps rather than checking centres and permits touching edges", () => {
    const a = [{ x: 0, y: 0 }, { x: 2, y: 0 }, { x: 2, y: 2 }, { x: 0, y: 2 }];
    expect(footprintsOverlap(a, a.map(p => ({ x: p.x + 1.9, y: p.y })))).toBe(true);
    expect(footprintsOverlap(a, a.map(p => ({ x: p.x + 2, y: p.y })))).toBe(false);
    expect(footprintsOverlap(a, a.map(p => ({ x: p.x + 4, y: p.y })))).toBe(false);
  });
  it("respects raster georeferencing, north/south pixels and mask exclusions", () => {
    const mask = maskFixture();
    expect(pointOnMask(mask, maskGeo(mask, 0.5, 0.5))).toBe(true);
    expect(pointOnMask(mask, maskGeo(mask, 10.5, 0.5))).toBe(false);
    expect(maskGeo(mask, 0, 0).latitude).toBeGreaterThan(maskGeo(mask, 0, 10).latitude);
    mask.runs = mask.runs.filter(([y]) => y !== 5);
    expect(pointOnMask(mask, maskGeo(mask, 4.5, 5.5))).toBe(false);
  });
  it("round-trips the versioned project and rejects invalid schema and broken panel references", () => {
    const project = fixture();
    expect(projectInputSchema.parse(JSON.parse(JSON.stringify(project))).name).toBe(project.name);
    expect(solarResultSchema.parse(JSON.parse(JSON.stringify(project.solar)))).toEqual(project.solar);
    expect(projectInputSchema.safeParse({ ...project, schemaVersion: 2 }).success).toBe(false);
    expect(projectInputSchema.safeParse({ ...project, location: { latitude: NaN, longitude: 77 } }).success).toBe(false);
    const invalid = structuredClone(project.solar!); invalid.insights.solarPotential.solarPanels[0].segmentIndex = 999;
    expect(solarResultSchema.safeParse(invalid).success).toBe(false);
    const mask = maskFixture(); mask.runs.push([99, 0, 4]);
    expect(solarResultSchema.safeParse({ ...project.solar, mask }).success).toBe(false);
  });
  it("selects the provider-ranked alternative and calculates DC capacity without energy estimates", () => {
    const project = fixture(); project.settings.selectedPanelCount = 1;
    expect(selectedPanels(project)).toHaveLength(1);
    expect(capacityKwp(25, 540)).toBe(13.5);
    expect(capacityKwp(0, 400)).toBe(0);
  });
});
