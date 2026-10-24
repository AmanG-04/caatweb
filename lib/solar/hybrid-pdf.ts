import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import type { Project } from "./model";
import { capacityKwp } from "./model";
import { hybridPanelCorners, layoutIssues, usableSections } from "./hybrid-engine";
import { distance, polygonArea, type Point } from "./geometry";

const ascii = (text: string) => text.replace(/[^\x20-\x7e]/g, "?");
export async function createHybridPdf(project: Project) {
  const design = project.settings.hybrid, layout = design.layout;
  if (!layout || !design.origin) throw new Error("Apply a surveyed layout before exporting.");
  const issues = layoutIssues(design, project.solar?.mask, project.solar?.fetchedAt);
  if (issues.length) throw new Error(issues[0]);
  const pdf = await PDFDocument.create(), font = await pdf.embedFont(StandardFonts.Helvetica), bold = await pdf.embedFont(StandardFonts.HelveticaBold);
  const page = pdf.addPage([842, 595]);
  const ink = rgb(0.06, 0.16, 0.16), teal = rgb(0.06, 0.46, 0.43), lime = rgb(0.85, 0.95, 0.42);
  const text = (value: string, x: number, y: number, size = 10, heavy = false) => page.drawText(ascii(value), { x, y, size, font: heavy ? bold : font, color: ink });
  text("CAAT POWERBOT / SURVEYED SOLAR LAYOUT", 30, 560, 11, true);
  text(project.name.slice(0, 65), 30, 530, 22, true);
  text((project.address || "Survey-coordinate site").slice(0, 120), 30, 508);
  text(`${design.origin.latitude.toFixed(6)}, ${design.origin.longitude.toFixed(6)} | ${project.settings.versionName.slice(0, 50)} | Revision ${project.revision}`, 30, 485);
  const points = design.sections.flatMap(section => section.points), minX = Math.min(...points.map(p => p.x)), maxX = Math.max(...points.map(p => p.x)), minY = Math.min(...points.map(p => p.y)), maxY = Math.max(...points.map(p => p.y));
  const scale = Math.min(465 / Math.max(1, maxX - minX), 300 / Math.max(1, maxY - minY));
  const xy = (p: Point) => ({ x: 285 + (p.x - (minX + maxX) / 2) * scale, y: 280 + (p.y - (minY + maxY) / 2) * scale });
  const draw = (vertices: Point[], fill: ReturnType<typeof rgb> | undefined, stroke: ReturnType<typeof rgb>, lineWidth = 0.6) => {
    const p = vertices.map(xy), path = `M${p[0].x},${-p[0].y} ${p.slice(1).map(p => `L${p.x},${-p.y}`).join(" ")}Z`;
    page.drawSvgPath(path, { x: 0, y: 0, color: fill, borderColor: stroke, borderWidth: lineWidth });
  };
  page.drawRectangle({ x: 30, y: 105, width: 510, height: 350, color: rgb(0.96, 0.97, 0.94), borderColor: teal, borderWidth: 0.5 });
  for (const section of design.sections) {
    draw(section.points, rgb(0.8, 0.87, 0.78), teal);
    section.points.forEach((p, i) => { const q = section.points[(i + 1) % section.points.length], center = xy({ x: (p.x + q.x) / 2, y: (p.y + q.y) / 2 }); text(`${distance(p, q).toFixed(2)} m`, center.x, center.y, 7); });
  }
  const usable = usableSections(design);
  for (const section of usable) for (const polygon of section.polygons) for (const ring of polygon) draw(ring.map(([x, y]) => ({ x, y })), undefined, teal, 0.3);
  for (const item of design.exclusions) draw(item.points, item.kind === "access-path" ? rgb(1, 1, 1) : rgb(0.85, 0.5, 0.45), rgb(0.5, 0.2, 0.15));
  for (const panel of layout.panels) draw(hybridPanelCorners(panel, layout.settings, design.sections.find(s => s.id === panel.sectionId)?.height ?? 0), rgb(0.05, 0.1, 0.23), lime, 0.3);
  page.drawLine({ start: { x: 515, y: 410 }, end: { x: 515, y: 440 }, thickness: 2, color: ink }); text("N", 510, 442, 10, true);
  const lines = [
    `${layout.panels.length} panels / ${capacityKwp(layout.panels.length, layout.settings.watts).toFixed(2)} kWp DC`,
    ...[layout.settings.label, `${layout.settings.watts} W / ${layout.settings.lengthMm} x ${layout.settings.widthMm} mm`, `${layout.settings.orientation} / tilt ${layout.settings.tilt} deg`, `True azimuth ${layout.settings.azimuth} deg (180 = south)`, `Panel clear gap ${layout.settings.panelGap} m`, `Row horizontal clear gap ${layout.settings.rowGap} m`, `Horizontal site area ${design.sections.reduce((a, s) => a + polygonArea(s.points), 0).toFixed(2)} m2`, `Usable area ${usable.reduce((a, s) => a + s.area, 0).toFixed(2)} m2`, `Survey status: ${design.sections.every(s => s.verified) ? "survey-verified" : "includes unverified entries"}`, `Flat roof / flat terrain assumption.`, `Setbacks and clearances are user-entered.`, `Best of four grid offsets; not globally optimal.`, `No shading, energy or structural assessment.`, `Raster mask constraint: ${layout.settings.maskConstraint ? "enabled, API-derived preliminary check" : "disabled"}`],
  ];
  let y = 440;
  for (const line of lines) {
    const chunks = ascii(line).match(/.{1,42}(?:\s|$)|.{1,42}/g) ?? [];
    for (const chunk of chunks) { text(chunk.trim(), 560, y, 9); y -= 13; }
    y -= 4;
  }
  text(`Exported ${new Date().toISOString()} | Requested by ${project.settings.requestedBy.slice(0, 50)}`, 30, 65, 9);
  text("Independent survey geometry. All dimensions horizontal unless stated. True north up.", 30, 48, 9);
  if (layout.settings.maskConstraint) text("Source: Includes solar data from Google", 30, 30, 9);
  if (project.settings.notes) {
    const notes = pdf.addPage([842, 595]); notes.drawText("Design notes", { x: 30, y: 555, size: 20, font: bold });
    (ascii(project.settings.notes).match(/.{1,100}(?:\s|$)|.{1,100}/g) ?? []).slice(0, 36).forEach((line, i) => notes.drawText(line.trim(), { x: 30, y: 525 - i * 13, size: 10, font }));
  }
  return pdf.save();
}
