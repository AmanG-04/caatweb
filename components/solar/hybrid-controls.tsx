"use client";

import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui";
import { emptyHybrid, hybridSchema, type HybridDesign, type HybridLayout } from "@/lib/solar/hybrid-model";
import { generateHybridLayout, layoutIssues, polygonIssue, usableSections } from "@/lib/solar/hybrid-engine";
import { distance, polygonArea, type Point } from "@/lib/solar/geometry";
import type { Project } from "@/lib/solar/model";
import SurveyCanvas from "./survey-canvas";

export default function HybridControls({ project, disabled, onChange }: { project: Project; disabled: boolean; onChange: (value: HybridDesign) => void }) {
  const design = project.settings.hybrid;
  const [vertices, setVertices] = useState(""), [name, setName] = useState(""), [kind, setKind] = useState("flat-roof");
  const [setback, setSetback] = useState("0"), [height, setHeight] = useState("0"), [verified, setVerified] = useState(false);
  const [editing, setEditing] = useState<string | null>(null), [message, setMessage] = useState("");
  const [originLat, setOriginLat] = useState(design.origin ? String(design.origin.latitude) : ""), [originLng, setOriginLng] = useState(design.origin ? String(design.origin.longitude) : "");
  const [preview, setPreview] = useState<HybridLayout | null>(null), [generating, setGenerating] = useState(false);
  const cancel = useRef(false), generation = useRef(0);
  useEffect(() => { const key = (event: KeyboardEvent) => { if (event.key === "Escape") { cancel.current = true; setPreview(null); } }; window.addEventListener("keydown", key); return () => { window.removeEventListener("keydown", key); cancel.current = true; }; }, []);
  function change(next: HybridDesign) { setPreview(null); cancel.current = true; generation.current++; onChange(next); }
  function applyGeometry() {
    try {
      const points = vertices.trim().split(/\n+/).map(line => { const values = line.trim().split(/[,\s]+/).map(Number); if (values.length !== 2) throw new Error("Each line must contain East, North in metres."); return { x: values[0], y: values[1] }; });
      const issue = polygonIssue(points); if (issue) throw new Error(issue);
      const id = editing ?? crypto.randomUUID(), objectName = name.trim() || (kind === "obstacle" ? "Obstacle" : kind === "access-path" ? "Access path" : "Survey section");
      let next: HybridDesign;
      if (kind === "obstacle" || kind === "access-path") next = { ...design, exclusions: [...design.exclusions.filter(item => item.id !== id), { id, name: objectName, kind, points, clearance: Number(setback), height: Number(height) }] };
      else next = { ...design, sections: [...design.sections.filter(item => item.id !== id), { id, name: objectName, type: kind as "flat-roof" | "ground", points, setback: Number(setback), height: Number(height), verified }] };
      next = hybridSchema.parse(next); usableSections(next); change(next); setMessage("Survey geometry applied. Preview a layout when ready."); setEditing(null); setVertices(""); setName("");
    } catch (error) { setMessage(error instanceof Error ? error.message : "Check the survey geometry."); }
  }
  async function previewLayout() {
    const job = ++generation.current; cancel.current = false; setGenerating(true); setMessage("");
    try {
      const result = await generateHybridLayout(design, { mask: project.solar?.mask, maskIdentity: project.solar?.fetchedAt, cancelled: () => cancel.current || job !== generation.current, yieldControl: () => new Promise(resolve => setTimeout(resolve, 0)) });
      if (!cancel.current && job === generation.current) setPreview(result);
    } catch (error) { setMessage(error instanceof Error ? error.message : "Preview failed."); }
    finally { setGenerating(false); }
  }
  const issues = (() => { try { return layoutIssues(design, project.solar?.mask, project.solar?.fetchedAt); } catch (error) { return [String(error)]; } })();
  return (
    <section className="solar-panel mt-4" aria-label="Hybrid flat roof designer">
      <h2>Survey boundary & south-facing arrays</h2>
      <label>
        Active design
        <select value={design.mode} disabled={disabled || generating} onChange={event => change({ ...design, mode: event.target.value as HybridDesign["mode"] })}>
          <option value="google">Google reference layout</option>
          <option value="survey">Surveyed flat-roof / ground layout</option>
        </select>
      </label>
      <p className="solar-canvas-caption">True south (180°) is the default for fixed arrays in India. Site shading, roof constraints and usage can favour other directions; this tool calculates geometry, not annual generation. Array direction is independent of Google’s roof azimuth.</p>
      {design.mode === "survey" && (
        <div className="solar-fields mt-4">
          <h3>1. Geographic survey origin</h3>
          <p className="solar-canvas-caption">Enter a surveyed WGS84 origin. Vertices below are horizontal East/North offsets in metres from this origin. Do not derive these boundary vertices by tracing Google satellite imagery.</p>
          <div className="solar-coordinates">
            <label>
              Survey origin latitude
              <input type="number" step="any" value={originLat} disabled={disabled || generating} onChange={event => setOriginLat(event.target.value)} />
            </label>
            <label>
              Survey origin longitude
              <input type="number" step="any" value={originLng} disabled={disabled || generating} onChange={event => setOriginLng(event.target.value)} />
            </label>
          </div>
          <Button variant="outline" disabled={disabled || generating} onClick={() => {
            try { if (!originLat.trim() || !originLng.trim()) throw new Error("Enter both surveyed origin coordinates."); const next = hybridSchema.parse({ ...design, origin: { latitude: Number(originLat), longitude: Number(originLng) } }); change(next); setMessage("Origin applied. Existing offsets stay unchanged."); } catch { setMessage("Enter valid survey latitude/longitude."); }
          }}>Apply surveyed origin</Button>
          <h3>2. Boundaries, obstacles & access paths</h3>
          <div className="solar-survey-list">
            {[...design.sections, ...design.exclusions].map(item => (
              <article className="solar-version" key={item.id}>
                <h4 className="font-bold">{item.name}</h4>
                <p>{polygonArea(item.points).toFixed(2)} m² · {"verified" in item ? item.verified ? "Survey-verified" : "Unverified survey entry" : item.kind}</p>
                <p className="solar-canvas-caption">Edges: {item.points.map((p, i) => `${distance(p, item.points[(i + 1) % item.points.length]).toFixed(2)} m`).join(" / ")}</p>
                <div className="solar-actions mt-2">
                  <Button variant="outline" disabled={disabled || generating} onClick={() => { setEditing(item.id); setName(item.name); setVertices(item.points.map(p => `${p.x}, ${p.y}`).join("\n")); setKind("type" in item ? item.type : item.kind); setSetback(String("setback" in item ? item.setback : item.clearance)); setHeight(String(item.height)); setVerified("verified" in item && item.verified); }}>Edit vertices</Button>
                  <Button variant="outline" disabled={disabled || generating} onClick={() => change({ ...design, sections: design.sections.filter(s => s.id !== item.id), exclusions: design.exclusions.filter(s => s.id !== item.id) })}>Delete</Button>
                </div>
              </article>
            ))}
          </div>
          <fieldset className="solar-survey-form" disabled={disabled || generating}>
            <label>
              Object name
              <input value={name} maxLength={120} onChange={event => setName(event.target.value)} />
            </label>
            <label>
              Geometry type
              <select value={kind} disabled={Boolean(editing)} onChange={event => setKind(event.target.value)}>
                <option value="flat-roof">Flat roof section</option>
                <option value="ground">Flat ground section</option>
                <option value="obstacle">Obstacle / unusable area</option>
                <option value="access-path">Access / maintenance path</option>
              </select>
            </label>
            <label>
              Survey vertices — East, North (m), one pair per line
              <textarea rows={6} value={vertices} onChange={event => setVertices(event.target.value)} placeholder={"0, 0\n10, 0\n10, 8\n0, 8"} />
            </label>
            <div className="solar-coordinates">
              <label>
                {kind === "obstacle" || kind === "access-path" ? "Clearance (m)" : "Boundary setback (m)"}
                <input type="number" min={0} max={30} step="0.01" value={setback} onChange={event => setSetback(event.target.value)} />
              </label>
              <label>
                {kind === "obstacle" ? "Obstacle height (m)" : "Section height above local datum (m)"}
                <input type="number" min={0} max={200} step="0.1" value={height} onChange={event => setHeight(event.target.value)} />
              </label>
            </div>
            {kind !== "obstacle" && kind !== "access-path" && (
              <label className="solar-checkbox">
                <input type="checkbox" checked={verified} onChange={event => setVerified(event.target.checked)} />
                These dimensions were verified by a site survey.
              </label>
            )}
            <div className="solar-actions">
              <Button disabled={disabled || generating || !vertices.trim()} onClick={applyGeometry}>{editing ? "Apply vertex edits" : "Add surveyed polygon"}</Button>
              {editing && <Button variant="outline" onClick={() => { setEditing(null); setVertices(""); setName(""); }}>Cancel edit</Button>}
            </div>
          </fieldset>
          <h3>3. Module & array settings</h3>
          <label>
            Module manufacturer / model label
            <input value={design.array.label} maxLength={120} onChange={event => { if (event.target.value.trim()) change({ ...design, array: { ...design.array, label: event.target.value } }); }} />
          </label>
          <div className="solar-array-fields">
            {([['lengthMm', 'Module length (mm)', 100, 6000], ['widthMm', 'Module width (mm)', 100, 4000], ['watts', 'Module rated power (W)', 1, 3000], ['azimuth', 'Array azimuth — true north (°)', 0, 360], ['tilt', 'Panel tilt above horizontal (°)', 0, 75], ['panelGap', 'Panel-to-panel clear gap (m)', 0, 10], ['rowGap', 'Row clear gap, not pitch (m)', 0, 30]] as const).map(([key, label, min, max]) => (
              <label key={key}>
                {label}
                <input type="number" step="any" min={min} max={max} value={design.array[key]} disabled={disabled || generating} onChange={event => { const value = Number(event.target.value); if (event.target.value !== "" && value >= min && value <= max) change({ ...design, array: { ...design.array, [key]: value } }); }} />
              </label>
            ))}
            <label>
              Panel orientation
              <select value={design.array.orientation} onChange={event => change({ ...design, array: { ...design.array, orientation: event.target.value as "portrait" | "landscape" } })}>
                <option value="portrait">Portrait</option>
                <option value="landscape">Landscape</option>
              </select>
            </label>
          </div>
          <Button variant="outline" disabled={disabled || generating} onClick={() => change({ ...design, array: { ...design.array, azimuth: 180 } })}>Face true south — 180°</Button>
          <label className="solar-checkbox">
            <input type="checkbox" checked={design.array.maskConstraint} disabled={disabled || generating} onChange={event => change({ ...design, array: { ...design.array, maskConstraint: event.target.checked } })} />
            Also require the complete panel footprint to lie on Google’s current raster roof mask (preliminary).
          </label>
          <p className="solar-canvas-caption">Starter module dimensions are examples. Setbacks and row gaps are configurable, not universal rules. Row spacing is a horizontal clear gap; no shadow-free spacing or generation optimum is claimed. Ground terrain is treated as flat.</p>
          <div className="solar-actions">
            <Button disabled={disabled || generating || !design.origin || !design.sections.length} onClick={() => void previewLayout()}>{generating ? "Calculating alternatives…" : "Preview automatic layout"}</Button>
            {generating && <Button variant="outline" onClick={() => { cancel.current = true; }}>Cancel preview</Button>}
          </div>
          {preview && (
            <div className="solar-warning" role="status">
              <SurveyCanvas design={{ ...design, layout: preview }} />
              <p>Preview: {preview.panels.length} panels · {(preview.panels.length * preview.settings.watts / 1000).toFixed(2)} kWp · {preview.settings.azimuth}° azimuth. The best of four grid offsets was selected, not a guaranteed global optimum.</p>
              <Button className="mt-3" onClick={() => { if (!design.layout || window.confirm("Replace the currently applied array? Previous PDF versions remain available.")) { onChange({ ...design, layout: preview }); setPreview(null); } }}>Apply preview{design.layout ? " and replace current array" : ""}</Button>
            </div>
          )}
          {issues.length > 0 && <p role="status" className="solar-warning">{issues.join(" ")}</p>}
          {message && <p role="status" className="solar-canvas-caption">{message}</p>}
        </div>
      )}
    </section>
  );
}
