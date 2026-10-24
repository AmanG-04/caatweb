"use client";

import type { HybridDesign } from "@/lib/solar/hybrid-model";
import { hybridPanelCorners, usableSections } from "@/lib/solar/hybrid-engine";

export default function SurveyCanvas({ design }: { design: HybridDesign }) {
  const sections = usableSections(design), points = design.sections.flatMap(section => section.points);
  const minX = Math.min(0, ...points.map(p => p.x)), maxX = Math.max(10, ...points.map(p => p.x)), minY = Math.min(0, ...points.map(p => p.y)), maxY = Math.max(10, ...points.map(p => p.y));
  const width = maxX - minX + 4, height = maxY - minY + 4;
  const path = (points: { x: number; y: number }[]) => points.map((p, index) => `${index ? "L" : "M"}${p.x},${-p.y}`).join(" ") + "Z";
  return (
    <div className="solar-canvas solar-survey-canvas">
      <svg viewBox={`${minX - 2} ${-maxY - 2} ${width} ${height}`} role="img" aria-label="Surveyed metric site drawing, true north up">
        {design.sections.map(section => (
          <path key={section.id} d={path(section.points)} fill="#c5d8bf" stroke="#0f766e" strokeWidth={0.08} />
        ))}
        {sections.map(section => (
          <path key={section.id} d={section.polygons.flatMap(polygon => polygon.map(ring => path(ring.map(([x, y]) => ({ x, y }))))).join(" ")} fill="#d8f36a" fillOpacity={0.4} fillRule="evenodd" stroke="#0f766e" strokeDasharray=".2 .2" strokeWidth={0.04} />
        ))}
        {design.exclusions.map(item => (
          <path key={item.id} d={path(item.points)} fill={item.kind === "access-path" ? "#f7f8f2" : "#dd9185"} stroke="#87332c" strokeWidth={0.06} />
        ))}
        {design.layout?.panels.map(panel => (
          <path key={panel.id} d={path(hybridPanelCorners(panel, design.layout!.settings, design.sections.find(section => section.id === panel.sectionId)?.height ?? 0))} fill="#0d1a3c" stroke="#d8f36a" strokeWidth={0.035} />
        ))}
      </svg>
      <div className="solar-map-north">↑ N</div>
      <p className="solar-survey-caption">Survey geometry · metres · true north up</p>
    </div>
  );
}
