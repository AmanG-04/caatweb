import { describe, expect, it, vi } from "vitest";
import { PDFDocument } from "pdf-lib";
vi.mock("@/lib/cloudflare", () => ({ getEnv: () => ({}) }));
import { createLayoutPdf, persistLayoutPdf } from "../lib/solar/pdf";
import { fixture, maskFixture } from "./solar-fixture";

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
});
