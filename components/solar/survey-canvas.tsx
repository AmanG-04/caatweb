"use client";

import type { HybridDesign } from "@/lib/solar/hybrid-model";
import { hybridPanelCorners, usableSections } from "@/lib/solar/hybrid-engine";
import { polygonIssue } from "@/lib/solar/hybrid-engine";
import { useRef, useState } from "react";

export default function SurveyCanvas({ design, onChange }: { design: HybridDesign; onChange?: (value: HybridDesign) => void }) {
  const svg = useRef<SVGSVGElement>(null);
  const [drag, setDrag] = useState<{ sectionId: string; vertex: number; x: number; y: number } | null>(null);
  const sections = usableSections(design), points = design.sections.flatMap(section => section.points);
  const minX = Math.min(0, ...points.map(p => p.x)), maxX = Math.max(10, ...points.map(p => p.x)), minY = Math.min(0, ...points.map(p => p.y)), maxY = Math.max(10, ...points.map(p => p.y));
  const width = maxX - minX + 4, height = maxY - minY + 4;
  const path = (points: { x: number; y: number }[]) => points.map((p, index) => `${index ? "L" : "M"}${p.x},${-p.y}`).join(" ") + "Z";
  const drawing = drag ? { ...design, sections: design.sections.map(section => section.id === drag.sectionId ? { ...section, points: section.points.map((p, i) => i === drag.vertex ? { x: drag.x, y: drag.y } : p) } : section) } : design;
  const screenPoint = (event: React.PointerEvent) => {
    const matrix = svg.current?.getScreenCTM(); if (!matrix) return null;
    const p = new DOMPoint(event.clientX, event.clientY).matrixTransform(matrix.inverse());
    return { x: Math.round(p.x * 100) / 100, y: -Math.round(p.y * 100) / 100 };
  };
  return (
    <div className="solar-canvas solar-survey-canvas">
      <svg ref={svg} viewBox={`${minX - 2} ${-maxY - 2} ${width} ${height}`} role="img" aria-label="Measured roof drawing, true north up" onPointerMove={event => { if (drag) { const point = screenPoint(event); if (point) setDrag({ ...drag, ...point }); } }} onPointerUp={event => {
        if (!drag) return;
        const section = drawing.sections.find(section => section.id === drag.sectionId);
        if (section && !polygonIssue(section.points)) onChange?.({ ...drawing, sections: drawing.sections.map(section => section.id === drag.sectionId ? { ...section, verified: false } : section) });
        setDrag(null); event.currentTarget.releasePointerCapture(event.pointerId);
      }} onPointerCancel={() => setDrag(null)}>
        {drawing.sections.map(section => (
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
        {onChange && drawing.sections.flatMap(section => section.points.map((p, index) => (
          <circle key={`${section.id}-${index}`} cx={p.x} cy={-p.y} r={Math.max(width, height) / 65} fill="#fff" stroke="#0f766e" strokeWidth={0.08} role="button" tabIndex={0} aria-label={`Move ${section.name} corner ${index + 1}; arrow keys adjust 10 centimetres`} onPointerDown={event => {
            event.preventDefault(); event.stopPropagation(); svg.current?.setPointerCapture(event.pointerId); setDrag({ sectionId: section.id, vertex: index, x: p.x, y: p.y });
          }} onKeyDown={event => {
            if (!['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(event.key)) return;
            event.preventDefault();
            const step = event.shiftKey ? 1 : 0.1, point = { x: p.x + (event.key === 'ArrowRight' ? step : event.key === 'ArrowLeft' ? -step : 0), y: p.y + (event.key === 'ArrowUp' ? step : event.key === 'ArrowDown' ? -step : 0) };
            const vertices = section.points.map((p, i) => i === index ? point : p);
            if (!polygonIssue(vertices)) onChange({ ...design, sections: design.sections.map(s => s.id === section.id ? { ...s, points: vertices, verified: false } : s) });
          }} />
        )))}
      </svg>
      <div className="solar-map-north">↑ N</div>
      <p className="solar-survey-caption">{onChange ? "Drag a white corner to change roof shape · arrows move 0.1 m · recheck dimensions after editing" : "Measured roof plan · metres · true north up"}</p>
    </div>
  );
}
