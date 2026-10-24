import { emptyProject, insightsSchema, type Project, type RoofMask } from "../lib/solar/model";
import { localFrame, projection } from "../lib/solar/geometry";
import proj4 from "proj4";

export function fixture(): Project {
  const center = { latitude: 28.6139, longitude: 77.209 }, frame = localFrame(center);
  const box = { sw: frame.toGeo({ x: -20, y: -20 }), ne: frame.toGeo({ x: 20, y: 20 }) };
  const insights = insightsSchema.parse({
    name: "buildings/test", center, boundingBox: box, imageryQuality: "BASE", imageryDate: { year: 2025, month: 2, day: 1 },
    solarPotential: {
      maxArrayPanelsCount: 2, panelCapacityWatts: 400, panelHeightMeters: 2, panelWidthMeters: 1,
      wholeRoofStats: { areaMeters2: 1847.52, groundAreaMeters2: 1600 },
      roofSegmentStats: [{ pitchDegrees: 30, azimuthDegrees: 180, center, boundingBox: box, planeHeightAtCenterMeters: 10, stats: { areaMeters2: 1847.52, groundAreaMeters2: 1600 } }],
      solarPanels: [{ center, orientation: "PORTRAIT", segmentIndex: 0 }, { center: frame.toGeo({ x: 3, y: 0 }), orientation: "LANDSCAPE", segmentIndex: 0 }],
      solarPanelConfigs: [{ panelsCount: 1 }, { panelsCount: 2 }],
    },
  });
  return { ...emptyProject("NCR fixture"), address: "Delhi test site", location: center,
    settings: { ...emptyProject("test").settings, selectedPanelCount: 2, requestConfirmed: true, requestedBy: "Test requester", confirmedBuildingName: "buildings/test" },
    id: "project-test", revision: 1, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), solarExpired: false,
    solar: { provider: "google-solar", requestedLocation: center, requestedAddress: "Delhi test site", insights, fetchedAt: new Date().toISOString(), expiresAt: new Date(Date.now() + 29 * 86400000).toISOString(), mask: null, maskWarning: null } };
}
export function maskFixture(): RoofMask {
  const location = fixture().solar!.insights.center;
  const xy = proj4("EPSG:4326", projection(location), [location.longitude, location.latitude]);
  return { width: 10, height: 10, origin: [xy[0] - 1.25, xy[1] + 1.25], resolution: [0.25, -0.25], crs: projection(location), runs: Array.from({ length: 10 }, (_, y) => [y, 0, 10] as [number, number, number]) };
}
