import { describe, expect, it, vi, afterEach } from "vitest";
import { writeArrayBuffer } from "geotiff";
vi.mock("@/lib/cloudflare", () => ({ getEnv: () => ({}) }));
import { readRoofMask } from "../lib/solar/provider";

afterEach(() => vi.restoreAllMocks());
describe("Google roof-mask binary decoding", () => {
  it("decodes actual GeoTIFF roof pixels, exclusions, UTM CRS and negative northing resolution", async () => {
    const bytes = writeArrayBuffer([1, 1, 0, 0, 1, 0], {
      width: 3, height: 2, BitsPerSample: [8], SamplesPerPixel: 1,
      ModelPixelScale: [0.25, 0.25, 0], ModelTiepoint: [0, 0, 0, 700000, 3100000, 0],
      GTModelTypeGeoKey: 1, GTRasterTypeGeoKey: 1, ProjectedCSTypeGeoKey: 32643,
    });
    vi.spyOn(globalThis, "fetch").mockResolvedValue(new Response(bytes));
    const mask = await readRoofMask("https://solar.googleapis.com/v1/geoTiff:get?id=test");
    expect(mask.width).toBe(3); expect(mask.height).toBe(2);
    expect(mask.origin).toEqual([700000, 3100000]); expect(mask.resolution).toEqual([0.25, -0.25]);
    expect(mask.runs).toEqual([[0, 0, 2], [1, 1, 1]]); expect(mask.crs).toContain("+zone=43");
  });
  it("rejects non-provider mask URLs without fetching them", async () => {
    const fetch = vi.spyOn(globalThis, "fetch");
    await expect(readRoofMask("https://untrusted.test/mask.tiff")).rejects.toMatchObject({ code: "INVALID_MASK_URL" });
    expect(fetch).not.toHaveBeenCalled();
  });
});
