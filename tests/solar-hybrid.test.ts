import { describe, expect, it } from "vitest";
import { emptyHybrid, hybridFingerprint, hybridSchema } from "../lib/solar/hybrid-model";
import { footprintContained, generateHybridLayout, hybridPanelCorners, layoutIssues, maskFootprintTester, measuredRectangle, panelDimensions, polygonIssue, usableSections } from "../lib/solar/hybrid-engine";
import { distance, polygonArea } from "../lib/solar/geometry";
import { maskFixture } from "./solar-fixture";

function design() {
  return hybridSchema.parse({ ...emptyHybrid(), mode: "survey", origin: { latitude: 28.6139, longitude: 77.209 }, sections: [{ id: "roof", name: "Roof", points: [{ x: 0, y: 0 }, { x: 10, y: 0 }, { x: 10, y: 8 }, { x: 0, y: 8 }], verified: true }] });
}
describe("Hybrid surveyed flat-site placement", () => {
  it("uses measured rectangle dimensions at any roof bearing without requiring invented geographic coordinates", async () => {
    for (const bearing of [0, 37, 90, 180]) {
      const points = measuredRectangle(10, 8, bearing);
      expect(polygonArea(points)).toBeCloseTo(80);
      expect(distance(points[0], points[1])).toBeCloseTo(8);
      expect(distance(points[1], points[2])).toBeCloseTo(10);
      const d = design(); d.origin = null; d.sections[0].points = points;
      d.layout = await generateHybridLayout(d);
      expect(d.layout.panels.length).toBeGreaterThan(0); expect(layoutIssues(d)).toEqual([]);
    }
    expect(() => measuredRectangle(0, 8, 0)).toThrow("length/width");
  });
  it("defaults to true south independently of roof orientation and retains actual tilted surface dimensions", () => {
    const d = design(); expect(d.array.azimuth).toBe(180); d.array.tilt = 60;
    const dims = panelDimensions(d.array); expect(dims.depth).toBeCloseTo(1);
    const corners = hybridPanelCorners({ id: "p", sectionId: "roof", center: { x: 0, y: 0 } }, d.array, 10);
    expect(distance(corners[0], corners[1])).toBeCloseTo(1);
    expect(Math.hypot(distance(corners[1], corners[2]), corners[1].z - corners[2].z)).toBeCloseTo(2);
    expect(corners[2].y).toBeLessThan(corners[1].y); expect(corners[2].z).toBeLessThan(corners[1].z);
  });
  it("rejects self intersections and handles concave boundaries and setbacks", () => {
    expect(polygonIssue([{ x: 0, y: 0 }, { x: 3, y: 3 }, { x: 0, y: 3 }, { x: 3, y: 0 }])).toContain("itself");
    const d = design(); d.sections[0].setback = 1;
    expect(usableSections(d)[0].area).toBeCloseTo(48);
  });
  it("subtracts obstacle clearance and user access paths and checks full footprints", async () => {
    const d = design(); d.exclusions = [{ id: "tank", name: "Tank", kind: "obstacle", height: 2, clearance: 0.5, points: [{ x: 3, y: 3 }, { x: 5, y: 3 }, { x: 5, y: 5 }, { x: 3, y: 5 }] }];
    const usable = usableSections(d); expect(usable[0].area).toBeCloseTo(71);
    const result = await generateHybridLayout(d); expect(result.panels.length).toBeGreaterThan(0);
    expect(result.panels.every(panel => footprintContained(hybridPanelCorners(panel, d.array, 0), usable[0].polygons))).toBe(true);
    d.layout = result; expect(layoutIssues(d)).toEqual([]);
    d.array.azimuth = 150; expect(layoutIssues(d)[0]).toContain("changed");
  });
  it("fits rotated arrays into a concave site without overlaps across multiple sections", async () => {
    const d = design(); d.array.azimuth = 143; d.array.orientation = "landscape"; d.array.tilt = 25;
    d.sections[0].points = [{ x: 0, y: 0 }, { x: 10, y: 0 }, { x: 10, y: 3 }, { x: 5, y: 3 }, { x: 5, y: 8 }, { x: 0, y: 8 }];
    d.sections.push({ ...d.sections[0], id: "overlap", name: "Overlapping section" });
    const result = await generateHybridLayout(d); d.layout = result;
    expect(result.panels.length).toBeGreaterThan(0); expect(result.panels.every(panel => panel.sectionId === "roof")).toBe(true);
    expect(layoutIssues(d)).toEqual([]);
  });
  it("tests entire mask footprint, including excluded raster cells", () => {
    const mask = maskFixture(), d = design();
    const test = maskFootprintTester(mask, d.origin!);
    expect(test([{ x: -0.2, y: -0.2 }, { x: 0.2, y: -0.2 }, { x: 0.2, y: 0.2 }, { x: -0.2, y: 0.2 }])).toBe(true);
    expect(test([{ x: -2, y: -2 }, { x: 2, y: -2 }, { x: 2, y: 2 }, { x: -2, y: 2 }])).toBe(false);
    mask.runs = mask.runs.filter(([y]) => y !== 5);
    expect(maskFootprintTester(mask, d.origin!)([{ x: -0.2, y: -0.2 }, { x: 0.2, y: -0.2 }, { x: 0.2, y: 0.2 }, { x: -0.2, y: 0.2 }])).toBe(false);
  });
  it("preserves current layouts until explicit application and supports cancellation and schema round trips", async () => {
    const d = design(), before = JSON.stringify(d); await generateHybridLayout(d); expect(JSON.stringify(d)).toBe(before);
    await expect(generateHybridLayout(d, { cancelled: () => true })).rejects.toThrow("cancelled");
    d.layout = await generateHybridLayout(d); expect(hybridSchema.parse(JSON.parse(JSON.stringify(d)))).toEqual(d);
    expect(d.layout.inputFingerprint).toBe(hybridFingerprint(d));
  });
});
