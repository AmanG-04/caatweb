import { z } from "zod";
import { getEnv } from "@/lib/cloudflare";
import { insightsSchema, locationSchema, maskSchema, type Location, type RoofMask, type SolarResult } from "./model";

export class SolarError extends Error {
  constructor(public code: string, message: string, public status = 500) { super(message); }
}
export function config() {
  const env = getEnv();
  const value = (key: string) => (env as Record<string, unknown>)[key] as string | undefined ?? process.env[key];
  return { enabled: value("SOLAR_GOOGLE_ENABLED") === "true", key: value("GOOGLE_SOLAR_API_KEY"), browserKey: value("GOOGLE_MAPS_BROWSER_KEY"),
    dailyLimit: Math.min(1000, Math.max(1, Number(value("SOLAR_DAILY_REQUEST_LIMIT")) || 20)) };
}
async function budget(service: string) {
  const db = getEnv().DB;
  if (!db) throw new SolarError("DATABASE_UNAVAILABLE", "D1 storage is required before making Google requests.", 503);
  const day = new Date().toISOString().slice(0, 10), limit = config().dailyLimit;
  const row = await db.prepare("INSERT INTO solar_api_usage(day, service, count) VALUES (?, ?, 1) ON CONFLICT(day, service) DO UPDATE SET count=count+1 WHERE count < ? RETURNING count").bind(day, service, limit).first<{ count: number }>();
  if (!row) throw new SolarError("DAILY_LIMIT", `The application daily ${service} request limit (${limit}) has been reached.`, 429);
}
async function googleJson(url: URL, service: string): Promise<unknown> {
  const settings = config();
  if (!settings.enabled || !settings.key) throw new SolarError("MISSING_CONFIGURATION", "Google Solar is disabled or its server API key is missing.", 503);
  await budget(service);
  url.searchParams.set("key", settings.key);
  let response: Response;
  try { response = await fetch(url, { signal: AbortSignal.timeout(30000), cache: "no-store" }); }
  catch { throw new SolarError("PROVIDER_UNAVAILABLE", "Google request timed out or could not be reached. Try again.", 502); }
  if (!response.ok) {
    if (response.status === 404) throw new SolarError("NO_COVERAGE", "Google Solar has no suitable building data here. Try the building centre or another site. No layout was invented.", 404);
    if (response.status === 429) throw new SolarError("PROVIDER_QUOTA", "Google request quota was exceeded. Check your Google Cloud quotas.", 429);
    throw new SolarError("PROVIDER_ERROR", "Google rejected the request. Check API enablement, key restrictions, billing and coverage.", 502);
  }
  return response.json();
}
export interface SolarProvider {
  geocode(address: string): Promise<Location>;
  search(address: string): Promise<{ location: Location; label: string; approximate: boolean }[]>;
  generate(location: Location): Promise<SolarResult>;
}
const layersSchema = z.object({ maskUrl: z.url() });
export const googleSolarProvider: SolarProvider = {
  async search(address) {
    const url = new URL("https://maps.googleapis.com/maps/api/geocode/json");
    url.searchParams.set("address", address); url.searchParams.set("region", "in");
    const parsed = z.object({ status: z.string(), results: z.array(z.object({ formatted_address: z.string(), partial_match: z.boolean().optional(), geometry: z.object({ location_type: z.string(), location: z.object({ lat: z.number(), lng: z.number() }) }) })) }).safeParse(await googleJson(url, "geocoding"));
    if (!parsed.success) throw new SolarError("INVALID_GEOCODING_DATA", "Google returned an unreadable address-search response.", 502);
    if (parsed.data.status === "ZERO_RESULTS") throw new SolarError("ADDRESS_NOT_FOUND", "No address found. Include house number, street, locality, city and PIN code, or use a rooftop pin.", 422);
    if (parsed.data.status !== "OK") throw new SolarError("GEOCODING_REJECTED", "Address search was rejected. Check that Geocoding API is enabled for the server key and its quota is available.", 502);
    return parsed.data.results.slice(0, 5).map(result => ({ location: locationSchema.parse({ latitude: result.geometry.location.lat, longitude: result.geometry.location.lng }), label: result.formatted_address, approximate: Boolean(result.partial_match) || result.geometry.location_type !== "ROOFTOP" }));
  },
  async geocode(address) {
    const results = await googleSolarProvider.search(address);
    if (results.length !== 1 || results[0].approximate) throw new SolarError("ADDRESS_NEEDS_PIN", "This address is ambiguous or approximate. Search it, then click the exact rooftop centre on the satellite map before generating.", 422);
    return results[0].location;
  },
  async generate(location) {
    const url = new URL("https://solar.googleapis.com/v1/buildingInsights:findClosest");
    url.searchParams.set("location.latitude", String(location.latitude)); url.searchParams.set("location.longitude", String(location.longitude)); url.searchParams.set("requiredQuality", "BASE");
    const parsed = insightsSchema.safeParse(await googleJson(url, "building-insights"));
    if (!parsed.success) throw new SolarError("INVALID_PROVIDER_DATA", "Google returned incomplete or unsupported building geometry.", 502);
    const insights = parsed.data;
    let mask: RoofMask | null = null, maskWarning: string | null = null;
    try {
      mask = await fetchRoofMask(insights.center);
    } catch (error) { maskWarning = maskFailure(error); }
    const fetchedAt = new Date().toISOString();
    // 29 days allows a safety margin before Google's 30-day ceiling.
    return { provider: "google-solar", requestedLocation: location, requestedAddress: "", fetchedAt, expiresAt: new Date(Date.now() + 29 * 86400000).toISOString(), insights, mask, maskWarning };
  },
};
export function maskFailure(error: unknown) {
  if (error instanceof SolarError) return `${error.code}: ${error.message}`;
  return "MASK_DECODE_FAILED: The roof-mask decoder failed. Retry the mask; server diagnostics identify the failing stage.";
}
export async function fetchRoofMask(location: Location) {
  const layers = new URL("https://solar.googleapis.com/v1/dataLayers:get");
  layers.searchParams.set("location.latitude", String(location.latitude)); layers.searchParams.set("location.longitude", String(location.longitude));
  layers.searchParams.set("radiusMeters", "100"); layers.searchParams.set("view", "FULL_LAYERS"); layers.searchParams.set("requiredQuality", "BASE"); layers.searchParams.set("pixelSizeMeters", "0.25");
  const result = layersSchema.safeParse(await googleJson(layers, "data-layers"));
  if (!result.success) throw new SolarError("MASK_METADATA_INVALID", "Google Data Layers did not return a valid roof-mask URL.", 502);
  return readRoofMask(result.data.maskUrl);
}
export async function readRoofMask(source: string): Promise<RoofMask> {
  const url = new URL(source);
  // Never follow user-controlled URLs, redirects, or log signed URLs/keys.
  if (url.protocol !== "https:" || url.hostname !== "solar.googleapis.com" || !url.pathname.startsWith("/v1/geoTiff")) throw new SolarError("INVALID_MASK_URL", "Google returned an unsupported mask URL.", 502);
  url.searchParams.set("key", config().key ?? "");
  let response: Response;
  try { response = await fetch(url, { redirect: "error", signal: AbortSignal.timeout(30000), cache: "no-store" }); }
  catch { throw new SolarError("MASK_DOWNLOAD_FAILED", "Roof-mask download timed out or returned an unsupported redirect.", 502); }
  if (!response.ok) throw new SolarError("MASK_UNAVAILABLE", "Google roof mask request failed.", 502);
  const reader = response.body?.getReader();
  if (!reader) throw new SolarError("MASK_UNAVAILABLE", "Google roof mask is empty.", 502);
  const chunks: Uint8Array[] = []; let size = 0;
  while (true) {
    const part = await reader.read(); if (part.done) break;
    size += part.value.byteLength;
    if (size > 16 * 1024 * 1024) { await reader.cancel(); throw new SolarError("MASK_TOO_LARGE", "Roof mask exceeds the supported size.", 422); }
    chunks.push(part.value);
  }
  const bytes = new Uint8Array(size); let offset = 0;
  for (const chunk of chunks) { bytes.set(chunk, offset); offset += chunk.byteLength; }
  return decodeRoofMask(bytes.buffer);
}
export async function decodeRoofMask(bytes: ArrayBuffer): Promise<RoofMask> {
  let stage = "load-decoder";
  try {
  const { fromArrayBuffer, Pool } = await import("geotiff");
  stage = "read-image";
  const tiff = await fromArrayBuffer(bytes); const image = await tiff.getImage();
  const width = image.getWidth(), height = image.getHeight(), keys = image.getGeoKeys();
  const epsg = Number(keys?.ProjectedCSTypeGeoKey);
  if (width > 4096 || height > 4096 || !(epsg >= 32601 && epsg <= 32660 || epsg >= 32701 && epsg <= 32760)) throw new SolarError("UNSUPPORTED_MASK", "Roof mask has an unsupported size or coordinate system.", 422);
  const zone = epsg % 100;
  stage = "decode-pixels";
  // Cloudflare has no decoder worker threads. Force main-thread decoding,
  // including compressed GeoTIFFs; do not rely on host worker detection.
  const pool = new Pool(0);
  let raster;
  try { raster = await image.readRasters({ samples: [0], interleave: true, pool }); }
  finally { await pool.destroy(); }
  const runs: [number, number, number][] = [];
  for (let y = 0; y < height; y++) {
    let start = -1;
    for (let x = 0; x <= width; x++) {
      const roof = x < width && raster[y * width + x] === 1;
      if (roof && start < 0) start = x;
      if (!roof && start >= 0) { runs.push([y, start, x - start]); start = -1; }
    }
  }
  stage = "read-transform";
  const origin = image.getOrigin(), resolution = image.getResolution();
  stage = "validate-mask";
  return maskSchema.parse({ width, height, runs, crs: `+proj=utm +zone=${zone} ${epsg >= 32701 ? "+south" : ""} +datum=WGS84 +units=m +no_defs`, origin: origin.slice(0, 2), resolution: resolution.slice(0, 2) });
  } catch (error) {
    if (error instanceof SolarError) throw error;
    // Error text may contain URLs/credentials. Log only an allowlisted category
    // and decoding stage, never provider bodies, signed URLs or stack traces.
    const text = error instanceof Error ? error.message : "";
    const category = /compression/i.test(text) ? "compression" : /worker/i.test(text) ? "worker" : /offset|buffer|TIFF/i.test(text) ? "binary" : "decoder";
    console.error("solar_mask_decode_failed", { stage, category });
    throw new SolarError("MASK_DECODE_FAILED", `Roof-mask decoding failed at ${stage} (${category}). Retry the mask; if it repeats, check the Worker decoder compatibility.`, 502);
  }
}
