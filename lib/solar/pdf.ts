import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import { capacityKwp, imageryDate, selectedPanels, type Project } from "./model";
import { distance, localFrame, maskGeo, panelCorners } from "./geometry";
import { SolarError } from "./provider";
import { database } from "./store";
import { getEnv } from "@/lib/cloudflare";
import { PNG } from "pngjs";
import { createHybridPdf } from "./hybrid-pdf";
import { layoutIssues } from "./hybrid-engine";

const clean = (value: string) => value.replace(/[^\x20-\x7E]/g, "?");
export async function createLayoutPdf(project: Project) {
  if (project.settings.hybrid.mode === "survey") return createHybridPdf(project);
  const solar = project.solar;
  if (!solar) throw new SolarError("NO_DESIGN", "Generate a current layout before exporting.", 422);
  const pdf = await PDFDocument.create(); const font = await pdf.embedFont(StandardFonts.Helvetica); const bold = await pdf.embedFont(StandardFonts.HelveticaBold);
  const page = pdf.addPage([842, 595]); const ink = rgb(0.063, 0.165, 0.165), teal = rgb(0.06, 0.46, 0.43);
  const text = (value: string, x: number, y: number, size = 10, heavy = false) => page.drawText(clean(value), { x, y, size, font: heavy ? bold : font, color: ink });
  const wrapped = (value: string, x: number, y: number, width: number, size = 9) => {
    let line = "", currentY = y;
    for (const word of clean(value).split(/\s+/)) {
      if (font.widthOfTextAtSize(`${line} ${word}`, size) > width && line) { text(line, x, currentY, size); currentY -= size + 4; line = word; }
      else line = line ? `${line} ${word}` : word;
    }
    if (line) text(line, x, currentY, size);
    return currentY - size - 4;
  };
  text("CAAT POWERBOT / SOLAR SITE DESIGNER", 30, 560, 10, true);
  text(project.name.slice(0, 70), 30, 531, 22, true);
  wrapped(project.address || "Coordinate-positioned site", 30, 510, 770);
  text(`${solar.insights.center.latitude.toFixed(6)}, ${solar.insights.center.longitude.toFixed(6)} | ${project.settings.versionName} | Revision ${project.revision}`, 30, 480);
  const frame = localFrame(solar.insights.center), box = solar.insights.boundingBox;
  const sw = frame.toLocal(box.sw), ne = frame.toLocal(box.ne);
  const spanX = Math.max(10, ne.x - sw.x), spanY = Math.max(10, ne.y - sw.y);
  const scale = Math.min(475 / spanX, 315 / spanY);
  const cx = (ne.x + sw.x) / 2, cy = (ne.y + sw.y) / 2;
  const xy = (point: { x: number; y: number }) => ({ x: 285 + (point.x - cx) * scale, y: 280 + (point.y - cy) * scale });
  page.drawRectangle({ x: 30, y: 100, width: 510, height: 350, color: rgb(0.965, 0.973, 0.949), borderColor: teal, borderWidth: 0.5 });
  if (solar.mask) {
    // Roof mask stays raster in fixed media. Reprojection uses its georeferencing,
    // not its axis-aligned bounding box, so UTM convergence isn't lost.
    const width = 1020, height = 700, pixels = new Uint8Array(width * height * 4);
    for (const [y, x, count] of solar.mask.runs) for (let i = 0; i < count; i++) {
      const p = xy(frame.toLocal(maskGeo(solar.mask, x + i + 0.5, y + 0.5)));
      const px = Math.round((p.x - 30) * 2), py = Math.round((450 - p.y) * 2);
      const radius = Math.max(1, Math.ceil(Math.abs(solar.mask.resolution[0]) * scale));
      for (let dy = -radius; dy <= radius; dy++) for (let dx = -radius; dx <= radius; dx++) {
        const xx = px + dx, yy = py + dy;
        if (xx >= 0 && xx < width && yy >= 0 && yy < height) { const n = (yy * width + xx) * 4; pixels[n] = 114; pixels[n + 1] = 166; pixels[n + 2] = 130; pixels[n + 3] = 145; }
      }
    }
    const png = PNG.sync.write({ width, height, data: Buffer.from(pixels) } as PNG);
    const image = await pdf.embedPng(png); page.drawImage(image, { x: 30, y: 100, width: 510, height: 350 });
  }
  for (const panel of selectedPanels(project)) {
    const corners = panelCorners(solar.insights, panel, frame).map(xy);
    const path = `M ${corners[0].x} ${-corners[0].y} ${corners.slice(1).map(p => `L ${p.x} ${-p.y}`).join(" ")} Z`;
    page.drawSvgPath(path, { x: 0, y: 0, color: rgb(0.055, 0.1, 0.24), borderColor: rgb(0.85, 0.95, 0.42), borderWidth: 0.35 });
  }
  page.drawLine({ start: { x: 510, y: 405 }, end: { x: 510, y: 435 }, thickness: 2, color: ink });
  page.drawLine({ start: { x: 504, y: 427 }, end: { x: 510, y: 435 }, thickness: 2, color: ink });
  text("N", 506, 438, 10, true);
  const barMetres = Math.max(1, Math.pow(10, Math.floor(Math.log10(80 / scale))));
  page.drawLine({ start: { x: 45, y: 118 }, end: { x: 45 + barMetres * scale, y: 118 }, color: ink, thickness: 2 });
  text(`${barMetres} m | true north up`, 45, 128, 8);
  const potential = solar.insights.solarPotential, panels = selectedPanels(project);
  let y = 438;
  const note = (value: string, heavy = false) => { if (heavy) { text(value, 562, y, 11, true); y -= 20; } else y = wrapped(value, 562, y, 248); y -= 6; };
  note("AUTOMATIC LAYOUT", true);
  note(`${panels.length} panels | ${capacityKwp(panels.length, potential.panelCapacityWatts).toFixed(2)} kWp DC`);
  note(`Google reference module: ${potential.panelCapacityWatts} W; ${(potential.panelHeightMeters * 1000).toFixed(0)} x ${(potential.panelWidthMeters * 1000).toFixed(0)} mm. Manufacturer/model not supplied.`);
  note(`Horizontal roof area: ${potential.wholeRoofStats.groundAreaMeters2.toFixed(1)} m2. Roof surface: ${potential.wholeRoofStats.areaMeters2.toFixed(1)} m2. Usable area after custom clearances: not calculated.`);
  note(`Imagery date: ${imageryDate(solar.insights.imageryDate)}. Quality: ${solar.insights.imageryQuality}. API-derived, not survey-verified.`);
  if (panels[0]) {
    const corners = panelCorners(solar.insights, panels[0]);
    note(`First panel projected edges: ${distance(corners[0], corners[1]).toFixed(2)} x ${distance(corners[1], corners[2]).toFixed(2)} m.`);
  }
  note("Roof mask is raster coverage and may include neighbouring roofs. Exact segment boundaries and obstacle geometry are not supplied. Panel positions use Google's reference dimensions; no custom setbacks or shading analysis performed.");
  if (project.settings.excludedSegments.length) note(`Panels excluded on roof sections: ${project.settings.excludedSegments.map(index => index + 1).join(", ")}. Remaining panel positions unchanged.`);
  if (solar.maskWarning) note(`Mask: ${solar.maskWarning}`);
  text("Source: Includes solar data from Google", 30, 78, 10);
  text("Google Maps", 30, 61, 12);
  text(`User-requested design: ${project.settings.requestedBy} | Exported ${new Date().toISOString()}`, 30, 40, 9);
  text("Geometry layout sheet only. No energy, price, structural or installation assessment.", 30, 25, 9);
  if (project.settings.notes) {
    const notesPage = pdf.addPage([842, 595]);
    notesPage.drawText("Design notes", { x: 30, y: 555, size: 20, font: bold });
    const lines = clean(project.settings.notes).match(/.{1,100}(?:\s|$)|.{1,100}/g) ?? [];
    lines.slice(0, 36).forEach((line, index) => notesPage.drawText(line.trim(), { x: 30, y: 525 - index * 13, size: 10, font }));
  }
  return pdf.save();
}
export async function persistLayoutPdf(project: Project) {
  if (!project.settings.requestConfirmed || !project.settings.requestedBy.trim()) throw new SolarError("USER_REQUEST_REQUIRED", "Record who requested this address-specific design before permanently storing a PDF.", 422);
  const hybrid = project.settings.hybrid;
  if (hybrid.mode === "survey") {
    if (!hybrid.layout) throw new SolarError("NO_DESIGN", "Apply a measured roof layout before exporting.", 422);
    const issues = layoutIssues(hybrid, project.solar?.mask, project.solar?.fetchedAt);
    if (issues.length) throw new SolarError("GEOMETRY_CONFLICT", issues[0], 422);
  } else if (!project.solar || project.settings.confirmedBuildingName !== project.solar.insights.name) throw new SolarError("BUILDING_CONFIRMATION_REQUIRED", "Confirm that Google's detected building is the intended house before saving its PDF.", 422);
  const bucket = getEnv().BILLS_BUCKET;
  if (!bucket) throw new SolarError("STORAGE_UNAVAILABLE", "R2 storage is required for permanent PDF design versions.", 503);
  const bytes = await createLayoutPdf(project), id = crypto.randomUUID(), key = `solar-designs/${project.id}/${id}.pdf`;
  await bucket.put(key, Uint8Array.from(bytes).buffer, { httpMetadata: { contentType: "application/pdf" } });
  try {
    const watts = hybrid.mode === "survey" ? hybrid.layout!.settings.watts : project.solar!.insights.solarPotential.panelCapacityWatts, count = hybrid.mode === "survey" ? hybrid.layout!.panels.length : selectedPanels(project).length;
    await database().prepare("INSERT INTO solar_exports(id,project_id,name,design_revision,panel_count,capacity_kwp,object_key,created_at) VALUES(?,?,?,?,?,?,?,?)")
      .bind(id, project.id, project.settings.versionName, project.revision, count, capacityKwp(count, watts), key, new Date().toISOString()).run();
  } catch (error) { await bucket.delete?.(key); throw error; }
  return id;
}
