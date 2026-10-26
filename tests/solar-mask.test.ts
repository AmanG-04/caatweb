import { describe, expect, it, vi, afterEach } from "vitest";
import { writeArrayBuffer } from "geotiff";
vi.mock("@/lib/cloudflare", () => ({ getEnv: () => ({}) }));
import { decodeRoofMask, downloadRoofMask, readRoofMask } from "../lib/solar/provider";
import { compressedRoofTiff } from "./solar-tiff-fixture";

afterEach(() => { vi.restoreAllMocks(); vi.unstubAllEnvs(); });
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
  it("reports the decoder stage for invalid binary content without leaking provider URLs", async () => {
    vi.spyOn(console, "error").mockImplementation(() => undefined);
    await expect(decodeRoofMask(new Uint8Array([1, 2, 3]).buffer)).rejects.toMatchObject({ code: "MASK_DECODE_FAILED", message: expect.stringContaining("read-image") });
  });
  it("decodes Deflate-compressed mask pixels with the explicit no-worker pool", async () => {
    const mask = await decodeRoofMask(compressedRoofTiff());
    expect(mask.runs).toEqual([[0, 0, 2], [1, 1, 1]]);
  });
  it("follows a Google storage redirect without forwarding the server key", async () => {
    vi.stubEnv("GOOGLE_SOLAR_API_KEY", "private-test-key");
    const fetch = vi.spyOn(globalThis, "fetch")
      .mockResolvedValueOnce(new Response(null, { status: 302, headers: { location: "https://storage.googleapis.com/provider-mask/test.tiff?signature=signed&key=private-test-key" } }))
      .mockResolvedValueOnce(new Response(compressedRoofTiff()));
    expect((await readRoofMask("https://solar.googleapis.com/v1/geoTiff:get?id=test")).runs).toEqual([[0, 0, 2], [1, 1, 1]]);
    const initial = new URL(String(fetch.mock.calls[0][0]));
    const destination = new URL(String(fetch.mock.calls[1][0]));
    expect(initial.searchParams.get("key")).toBe("private-test-key");
    expect(destination.hostname).toBe("storage.googleapis.com");
    expect(destination.searchParams.has("key")).toBe(false);
    expect(destination.searchParams.get("signature")).toBe("signed");
  });
  it("blocks external and insecure redirects before making another request", async () => {
    for (const location of ["https://untrusted.test/mask", "http://storage.googleapis.com/mask", "https://storage.googleapis.com.untrusted.test/mask"]) {
      const fetch = vi.spyOn(globalThis, "fetch").mockResolvedValue(new Response(null, { status: 302, headers: { location } }));
      await expect(downloadRoofMask("https://solar.googleapis.com/v1/geoTiff:get?id=test")).rejects.toMatchObject({ code: "MASK_REDIRECT_BLOCKED" });
      expect(fetch).toHaveBeenCalledTimes(1); fetch.mockRestore();
    }
  });
  it("distinguishes network failure from a redirected response", async () => {
    vi.spyOn(globalThis, "fetch").mockRejectedValue(new TypeError("fetch failed"));
    await expect(downloadRoofMask("https://solar.googleapis.com/v1/geoTiff:get?id=test")).rejects.toMatchObject({ code: "MASK_DOWNLOAD_NETWORK" });
  });
});
