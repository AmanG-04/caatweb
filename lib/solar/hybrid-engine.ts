import ClipperLib from "clipper-lib";
import polygonClipping, { type MultiPolygon, type Polygon } from "polygon-clipping";
import { distance, localFrame, maskGeo, polygonArea, radians, type Point } from "./geometry";
import { hybridFingerprint, type ArraySettings, type HybridDesign, type HybridLayout, type PlacedPanel } from "./hybrid-model";
import type { RoofMask } from "./model";

// Integer offsets use 1 mm coordinates; area comparisons allow 0.1 mm².
export const AREA_TOLERANCE = 1e-7;
const SCALE = 1000;
export type UsableSection = { id: string; polygons: MultiPolygon; height: number; area: number };
export function asPolygon(points: Point[]): Polygon { return [points.map(p => [p.x, p.y] as [number, number])]; }
export function multipolygonArea(polygons: MultiPolygon) {
  return polygons.reduce((total, polygon) => total + polygon.reduce((sum, ring, index) => sum + (index === 0 ? 1 : -1) * polygonArea(ring.map(([x, y]) => ({ x, y }))), 0), 0);
}
export function polygonIssue(points: Point[]): string | null {
  if (points.length < 3 || points.some(p => !Number.isFinite(p.x) || !Number.isFinite(p.y))) return "A polygon needs at least three finite coordinate pairs.";
  if (points.some((p, i) => distance(p, points[(i + 1) % points.length]) < 0.001)) return "Adjacent vertices must be at least 1 mm apart. Do not repeat the first vertex at the end.";
  const cross = (a: Point, b: Point, c: Point) => (b.x - a.x) * (c.y - a.y) - (b.y - a.y) * (c.x - a.x);
  const on = (a: Point, b: Point, c: Point) => Math.abs(cross(a, b, c)) < 1e-8 && c.x >= Math.min(a.x, b.x) - 1e-8 && c.x <= Math.max(a.x, b.x) + 1e-8 && c.y >= Math.min(a.y, b.y) - 1e-8 && c.y <= Math.max(a.y, b.y) + 1e-8;
  for (let i = 0; i < points.length; i++) for (let j = i + 1; j < points.length; j++) {
    if (j === i + 1 || i === 0 && j === points.length - 1) continue;
    const a = points[i], b = points[(i + 1) % points.length], c = points[j], d = points[(j + 1) % points.length];
    if (cross(a, b, c) * cross(a, b, d) < 0 && cross(c, d, a) * cross(c, d, b) < 0 || on(a, b, c) || on(a, b, d) || on(c, d, a) || on(c, d, b)) return "Polygon intersects or touches itself. Correct the vertex order.";
  }
  if (polygonArea(points) < 0.01) return "Polygon area must be at least 0.01 m².";
  return null;
}
export function offsetPolygon(points: Point[], metres: number): MultiPolygon {
  if (!metres) return [asPolygon(points)];
  let path = points.map(p => ({ X: Math.round(p.x * SCALE), Y: Math.round(p.y * SCALE) }));
  if (!ClipperLib.Clipper.Orientation(path)) path = path.reverse();
  const offset = new ClipperLib.ClipperOffset(2, 0.25 * SCALE);
  offset.AddPath(path, ClipperLib.JoinType.jtMiter, ClipperLib.EndType.etClosedPolygon);
  const result: ClipperLib.Paths = []; offset.Execute(result, metres * SCALE);
  return result.map(ring => [ring.map(p => [p.X / SCALE, p.Y / SCALE] as [number, number])]);
}
export function usableSections(design: HybridDesign): UsableSection[] {
  for (const item of [...design.sections, ...design.exclusions]) {
    const issue = polygonIssue(item.points); if (issue) throw new Error(`${item.name}: ${issue}`);
  }
  const exclusions = design.exclusions.flatMap(item => offsetPolygon(item.points, item.clearance));
  let previous: MultiPolygon = [];
  return design.sections.map(section => {
    let polygons = offsetPolygon(section.points, -section.setback);
    if (exclusions.length && polygons.length) polygons = polygonClipping.difference(polygons, ...exclusions);
    // Earlier sections own overlap, so duplicate boundaries cannot double-place.
    if (previous.length && polygons.length) polygons = polygonClipping.difference(polygons, previous);
    if (polygons.length) previous = previous.length ? polygonClipping.union(previous, polygons) : polygons;
    return { id: section.id, polygons, height: section.height, area: multipolygonArea(polygons) };
  });
}
export function panelDimensions(settings: ArraySettings) {
  const across = (settings.orientation === "portrait" ? settings.widthMm : settings.lengthMm) / 1000;
  const surfaceDepth = (settings.orientation === "portrait" ? settings.lengthMm : settings.widthMm) / 1000;
  return { across, surfaceDepth, depth: surfaceDepth * Math.cos(radians(settings.tilt)) };
}
export function arrayAxes(azimuth: number) {
  const az = radians(azimuth);
  return { across: { x: Math.cos(az), y: -Math.sin(az) }, facing: { x: Math.sin(az), y: Math.cos(az) } };
}
export function hybridPanelCorners(panel: PlacedPanel, settings: ArraySettings, height: number) {
  const dims = panelDimensions(settings), axes = arrayAxes(settings.azimuth), rise = dims.surfaceDepth * Math.sin(radians(settings.tilt));
  // Facing/downhill edge is low; tilt is independent of flat-roof orientation.
  return [[-1, -1], [1, -1], [1, 1], [-1, 1]].map(([u, v]) => ({
    x: panel.center.x + u * dims.across / 2 * axes.across.x + v * dims.depth / 2 * axes.facing.x,
    y: panel.center.y + u * dims.across / 2 * axes.across.y + v * dims.depth / 2 * axes.facing.y,
    z: height + (1 - v) * rise / 2,
  }));
}
export function footprintContained(points: Point[], usable: MultiPolygon) {
  return multipolygonArea(polygonClipping.difference(asPolygon(points), usable)) <= AREA_TOLERANCE;
}
export function maskFootprintTester(mask: RoofMask, origin: NonNullable<HybridDesign["origin"]>) {
  const frame = localFrame(origin), rectangles = mask.runs.map(([y, x, n]) => {
    const points = [maskGeo(mask, x, y), maskGeo(mask, x + n, y), maskGeo(mask, x + n, y + 1), maskGeo(mask, x, y + 1)].map(frame.toLocal);
    return { polygon: asPolygon(points), minX: Math.min(...points.map(p => p.x)), maxX: Math.max(...points.map(p => p.x)), minY: Math.min(...points.map(p => p.y)), maxY: Math.max(...points.map(p => p.y)) };
  });
  const bins = new Map<number, typeof rectangles>();
  for (const rectangle of rectangles) for (let y = Math.floor(rectangle.minY / 5); y <= Math.floor(rectangle.maxY / 5); y++) { const bin = bins.get(y) ?? []; bin.push(rectangle); bins.set(y, bin); }
  return (points: Point[]) => {
    const minX = Math.min(...points.map(p => p.x)), maxX = Math.max(...points.map(p => p.x)), minY = Math.min(...points.map(p => p.y)), maxY = Math.max(...points.map(p => p.y));
    const candidates = new Set<(typeof rectangles)[number]>();
    for (let y = Math.floor(minY / 5); y <= Math.floor(maxY / 5); y++) for (const rect of bins.get(y) ?? []) if (rect.maxX > minX && rect.minX < maxX) candidates.add(rect);
    let covered = 0;
    for (const rect of candidates) covered += multipolygonArea(polygonClipping.intersection(asPolygon(points), rect.polygon));
    return polygonArea(points) - covered <= AREA_TOLERANCE;
  };
}
export function layoutIssues(design: HybridDesign, mask?: RoofMask | null, maskIdentity?: string | null) {
  if (!design.layout) return [];
  const issues: string[] = [];
  if (design.layout.inputFingerprint !== hybridFingerprint(design, maskIdentity)) issues.push("Layout settings or boundaries changed. Preview and apply a new layout before export.");
  const sections = usableSections(design), byId = new Map(sections.map(section => [section.id, section]));
  const maskTest = design.layout.settings.maskConstraint && mask && design.origin ? maskFootprintTester(mask, design.origin) : null;
  if (design.layout.settings.maskConstraint && !maskTest) issues.push("The required roof mask is unavailable or expired.");
  // Spatial hash prevents O(n²) conflict checks for large saved layouts.
  const bins = new Map<string, Point[][]>();
  for (const panel of design.layout.panels) {
    const section = byId.get(panel.sectionId);
    if (!section) { issues.push(`Panel ${panel.id} references a missing section.`); continue; }
    const points = hybridPanelCorners(panel, design.layout.settings, section.height);
    if (!footprintContained(points, section.polygons) || maskTest && !maskTest(points)) issues.push(`Panel ${panel.id} is outside the usable footprint.`);
    const keys: string[] = [];
    const minX = Math.floor(Math.min(...points.map(p => p.x)) / 10), maxX = Math.floor(Math.max(...points.map(p => p.x)) / 10), minY = Math.floor(Math.min(...points.map(p => p.y)) / 10), maxY = Math.floor(Math.max(...points.map(p => p.y)) / 10);
    for (let x = minX; x <= maxX; x++) for (let y = minY; y <= maxY; y++) keys.push(`${x},${y}`);
    const seen = new Set<Point[]>();
    for (const key of keys) for (const other of bins.get(key) ?? []) if (!seen.has(other)) { seen.add(other); if (multipolygonArea(polygonClipping.intersection(asPolygon(points), asPolygon(other))) > AREA_TOLERANCE) issues.push(`Panel ${panel.id} overlaps another panel.`); }
    for (const key of keys) { const bin = bins.get(key) ?? []; bin.push(points); bins.set(key, bin); }
    if (issues.length >= 20) break;
  }
  return [...new Set(issues)];
}
export async function generateHybridLayout(design: HybridDesign, options: { mask?: RoofMask | null; maskIdentity?: string | null; cancelled?: () => boolean; yieldControl?: () => Promise<void> } = {}): Promise<HybridLayout> {
  if (!design.origin || !design.sections.length) throw new Error("Set a geographic survey origin and at least one surveyed boundary first.");
  const sections = usableSections(design), axes = arrayAxes(design.array.azimuth), dims = panelDimensions(design.array);
  const maskTest = design.array.maskConstraint && options.mask ? maskFootprintTester(options.mask, design.origin) : null;
  if (design.array.maskConstraint && !maskTest) throw new Error("A current decoded Google roof mask is required for mask-constrained placement.");
  const toArray = (p: Point) => ({ x: p.x * axes.across.x + p.y * axes.across.y, y: p.x * axes.facing.x + p.y * axes.facing.y });
  const fromArray = (x: number, y: number) => ({ x: x * axes.across.x + y * axes.facing.x, y: x * axes.across.y + y * axes.facing.y });
  const stepX = dims.across + design.array.panelGap, stepY = dims.depth + design.array.rowGap;
  const offsets = [[0, 0], [0.5, 0], [0, 0.5], [0.5, 0.5]];
  let best: PlacedPanel[] = [], tested = 0;
  for (const [offsetX, offsetY] of offsets) {
    const panels: PlacedPanel[] = [];
    for (const section of sections) {
      const points = section.polygons.flatMap(polygon => polygon.flatMap(ring => ring.map(([x, y]) => toArray({ x, y }))));
      if (!points.length) continue;
      const minX = Math.min(...points.map(p => p.x)), maxX = Math.max(...points.map(p => p.x)), minY = Math.min(...points.map(p => p.y)), maxY = Math.max(...points.map(p => p.y));
      for (let y = minY + dims.depth / 2 + offsetY * stepY; y <= maxY - dims.depth / 2 + 1e-8; y += stepY) for (let x = minX + dims.across / 2 + offsetX * stepX; x <= maxX - dims.across / 2 + 1e-8; x += stepX) {
        if (options.cancelled?.()) throw new Error("Layout preview cancelled.");
        if (++tested > 150000) throw new Error("Layout exceeds the supported candidate limit. Split the site into smaller projects or use larger modules.");
        if (tested % 250 === 0) await options.yieldControl?.();
        const panel = { id: `${section.id}-${panels.length + 1}`, sectionId: section.id, center: fromArray(x, y) }, footprint = hybridPanelCorners(panel, design.array, section.height);
        if (footprintContained(footprint, section.polygons) && (!maskTest || maskTest(footprint))) panels.push(panel);
        if (panels.length > 10000) throw new Error("Layouts support at most 10,000 panels. Split this site into projects.");
      }
    }
    if (panels.length > best.length) best = panels;
  }
  return { id: crypto.randomUUID(), name: "Automatic flat-site layout", createdAt: new Date().toISOString(), inputFingerprint: hybridFingerprint(design, options.maskIdentity), settings: { ...design.array }, panels: best };
}
