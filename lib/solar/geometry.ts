import proj4 from "proj4";
import type { Insights, Location, RoofMask } from "./model";

// WGS84 -> site-centred UTM. x=east, y=north, z=up, metres.
// True-north azimuth: clockwise; 0=N, 90=E. UTM convergence is
// corrected by projecting a true-north geodesic at each site.
export const TOLERANCE_METRES = 0.001;
export const radians = (degrees: number) => degrees * Math.PI / 180;
export type Point = { x: number; y: number };
export function projection(location: Location) {
  const zone = Math.min(60, Math.max(1, Math.floor((location.longitude + 180) / 6) + 1));
  return `+proj=utm +zone=${zone} ${location.latitude < 0 ? "+south" : ""} +datum=WGS84 +units=m +no_defs`;
}
export function localFrame(origin: Location) {
  const crs = projection(origin);
  const base = proj4("EPSG:4326", crs, [origin.longitude, origin.latitude]);
  const north = proj4("EPSG:4326", crs, [origin.longitude, origin.latitude + 0.0001]);
  const convergence = Math.atan2(north[0] - base[0], north[1] - base[1]);
  return {
    crs, convergence,
    toLocal(location: Location): Point {
      const xy = proj4("EPSG:4326", crs, [location.longitude, location.latitude]);
      // Rotate grid coordinates into true north/east site axes.
      const x = xy[0] - base[0], y = xy[1] - base[1];
      return { x: x * Math.cos(convergence) - y * Math.sin(convergence), y: x * Math.sin(convergence) + y * Math.cos(convergence) };
    },
    toGeo(point: Point): Location {
      const x = point.x * Math.cos(convergence) + point.y * Math.sin(convergence);
      const y = -point.x * Math.sin(convergence) + point.y * Math.cos(convergence);
      const ll = proj4(crs, "EPSG:4326", [base[0] + x, base[1] + y]);
      return { longitude: ll[0], latitude: ll[1] };
    },
  };
}
export function distance(a: Point, b: Point) { return Math.hypot(a.x - b.x, a.y - b.y); }
export function polygonArea(points: Point[]) {
  return Math.abs(points.reduce((sum, p, i) => { const q = points[(i + 1) % points.length]; return sum + p.x * q.y - q.x * p.y; }, 0)) / 2;
}
export function projectedLength(surfaceLength: number, pitch: number) { return surfaceLength * Math.cos(radians(pitch)); }
export function surfaceArea(horizontal: number, pitch: number) { return horizontal / Math.cos(radians(pitch)); }
export function panelCorners(insights: Insights, panel: Insights["solarPotential"]["solarPanels"][number], frame = localFrame(insights.center)) {
  const segment = insights.solarPotential.roofSegmentStats[panel.segmentIndex];
  const center = frame.toLocal(panel.center);
  const az = radians(segment.azimuthDegrees), pitch = radians(segment.pitchDegrees);
  const { panelWidthMeters: w, panelHeightMeters: h } = insights.solarPotential;
  const across = panel.orientation === "PORTRAIT" ? w : h;
  const along = panel.orientation === "PORTRAIT" ? h : w;
  const segmentCenter = frame.toLocal(segment.center);
  // azimuth points downslope; entered API height is at segment centre.
  const height = segment.planeHeightAtCenterMeters - ((center.x - segmentCenter.x) * Math.sin(az) + (center.y - segmentCenter.y) * Math.cos(az)) * Math.tan(pitch);
  return [[-1, -1], [1, -1], [1, 1], [-1, 1]].map(([u, v]) => ({
    x: center.x + u * across / 2 * Math.cos(az) + v * along / 2 * Math.cos(pitch) * Math.sin(az),
    y: center.y - u * across / 2 * Math.sin(az) + v * along / 2 * Math.cos(pitch) * Math.cos(az),
    z: height - v * along / 2 * Math.sin(pitch),
  }));
}
export function maskGeo(mask: RoofMask, x: number, y: number): Location {
  const ll = proj4(mask.crs, "EPSG:4326", [mask.origin[0] + x * mask.resolution[0], mask.origin[1] + y * mask.resolution[1]]);
  return { longitude: ll[0], latitude: ll[1] };
}
export function pointOnMask(mask: RoofMask, location: Location) {
  const xy = proj4("EPSG:4326", mask.crs, [location.longitude, location.latitude]);
  const x = Math.floor((xy[0] - mask.origin[0]) / mask.resolution[0]);
  const y = Math.floor((xy[1] - mask.origin[1]) / mask.resolution[1]);
  return mask.runs.some(([row, start, count]) => row === y && x >= start && x < start + count);
}
// SAT checks full projected footprints; touching edges are not overlap.
export function footprintsOverlap(a: Point[], b: Point[]) {
  for (const polygon of [a, b]) for (let i = 0; i < polygon.length; i++) {
    const p = polygon[i], q = polygon[(i + 1) % polygon.length];
    const length = distance(p, q), axis = { x: -(q.y - p.y) / length, y: (q.x - p.x) / length };
    const range = (points: Point[]) => { const values = points.map(v => v.x * axis.x + v.y * axis.y); return [Math.min(...values), Math.max(...values)]; };
    const ar = range(a), br = range(b);
    if (ar[1] <= br[0] + TOLERANCE_METRES || br[1] <= ar[0] + TOLERANCE_METRES) return false;
  }
  return true;
}
