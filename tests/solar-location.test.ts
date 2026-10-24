import { afterEach, describe, expect, it, vi } from "vitest";
const env = vi.hoisted(() => ({ DB: { prepare: () => ({ bind: () => ({ first: async () => ({ count: 1 }) }) }) } }));
vi.mock("@/lib/cloudflare", () => ({ getEnv: () => env }));
import { googleSolarProvider } from "../lib/solar/provider";

afterEach(() => { vi.restoreAllMocks(); vi.unstubAllEnvs(); });
describe("explicit address search", () => {
  function configure(result: unknown) {
    vi.stubEnv("SOLAR_GOOGLE_ENABLED", "true"); vi.stubEnv("GOOGLE_SOLAR_API_KEY", "test-key");
    vi.spyOn(globalThis, "fetch").mockImplementation(async () => Response.json(result));
  }
  it("returns formatted transient results and flags approximate locality matches", async () => {
    configure({ status: "OK", results: [{ formatted_address: "Test locality, Delhi", geometry: { location_type: "APPROXIMATE", location: { lat: 28.6, lng: 77.2 } } }] });
    expect(await googleSolarProvider.search("Test locality")).toEqual([{ label: "Test locality, Delhi", location: { latitude: 28.6, longitude: 77.2 }, approximate: true }]);
    await expect(googleSolarProvider.geocode("Test locality")).rejects.toMatchObject({ code: "ADDRESS_NEEDS_PIN" });
  });
  it("does not silently select the first house when an address has multiple matches", async () => {
    const result = { formatted_address: "Test house", geometry: { location_type: "ROOFTOP", location: { lat: 28.6, lng: 77.2 } } };
    configure({ status: "OK", results: [result, result] });
    await expect(googleSolarProvider.geocode("Ambiguous house")).rejects.toMatchObject({ code: "ADDRESS_NEEDS_PIN" });
  });
  it("distinguishes rejected geocoding from an address with no results", async () => {
    configure({ status: "REQUEST_DENIED", results: [] });
    await expect(googleSolarProvider.search("Test house")).rejects.toMatchObject({ code: "GEOCODING_REJECTED" });
  });
});
