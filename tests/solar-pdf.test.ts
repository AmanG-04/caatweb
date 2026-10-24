import { describe, expect, it, vi } from "vitest";
import { PDFDocument } from "pdf-lib";
vi.mock("@/lib/cloudflare", () => ({ getEnv: () => ({}) }));
import { createLayoutPdf, persistLayoutPdf } from "../lib/solar/pdf";
import { fixture, maskFixture } from "./solar-fixture";
import { emptyHybrid, hybridSchema } from "../lib/solar/hybrid-model";
import { generateHybridLayout } from "../lib/solar/hybrid-engine";

describe("Solar fixed-media PDF", () => {
  it("exports an A4 landscape PDF with georeferenced raster mask and vector panel content", async () => {
    const project = fixture(); project.solar!.mask = maskFixture();
    const bytes = await createLayoutPdf(project), pdf = await PDFDocument.load(bytes);
    expect(pdf.getPageCount()).toBe(1); expect(pdf.getPages()[0].getWidth()).toBe(842);
    expect(bytes.byteLength).toBeGreaterThan(2000);
    expect(pdf.getPages()[0].node.Contents()).toBeTruthy();
  });
  it("exports user notes on a separate sheet and handles unicode without crashing", async () => {
    const project = fixture(); project.name = "दिल्ली roof"; project.settings.notes = "Alternative layout with requested access requirements.";
    const pdf = await PDFDocument.load(await createLayoutPdf(project));
    expect(pdf.getPageCount()).toBe(2);
  });
  it("refuses permanent output without an address-specific user request or R2", async () => {
    const project = fixture(); project.settings.requestConfirmed = false;
    await expect(persistLayoutPdf(project)).rejects.toMatchObject({ code: "USER_REQUEST_REQUIRED" });
    project.settings.requestConfirmed = true;
    await expect(persistLayoutPdf(project)).rejects.toMatchObject({ code: "STORAGE_UNAVAILABLE" });
  });
  it("requires confirmation of the current detected building before permanently exporting", async () => {
    const project = fixture(); project.settings.confirmedBuildingName = "buildings/another-house";
    await expect(persistLayoutPdf(project)).rejects.toMatchObject({ code: "BUILDING_CONFIRMATION_REQUIRED" });
  });
  it("exports an independently surveyed south-facing layout without Google data and rejects stale geometry", async () => {
    const project = fixture(); project.solar = null;
    const hybrid = hybridSchema.parse({ ...emptyHybrid(), mode: "survey", origin: { latitude: 28.6, longitude: 77.2 }, sections: [{ id: "roof", name: "Roof", points: [{ x: 0, y: 0 }, { x: 10, y: 0 }, { x: 10, y: 8 }, { x: 0, y: 8 }], verified: true }] });
    hybrid.layout = await generateHybridLayout(hybrid); project.settings.hybrid = hybrid;
    expect((await PDFDocument.load(await createLayoutPdf(project))).getPageCount()).toBe(1);
    hybrid.array.azimuth = 150;
    await expect(createLayoutPdf(project)).rejects.toThrow("changed");
  });
});
