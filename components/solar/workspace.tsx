"use client";

import Link from "next/link";
import dynamic from "next/dynamic";
import { useCallback, useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui";
import { capacityKwp, imageryDate, projectInputSchema, selectedPanels, type DesignExport, type Project, type ProjectInput } from "@/lib/solar/model";
import { api, endpoint } from "./api";
import { distance, localFrame, polygonArea } from "@/lib/solar/geometry";
import type { Location } from "@/lib/solar/model";
import { layoutIssues, usableSections } from "@/lib/solar/hybrid-engine";

const GoogleMap = dynamic(() => import("./google-map"), { ssr: false, loading: () => <p role="status">Loading map renderer…</p> });
const Preview = dynamic(() => import("./preview"), { ssr: false, loading: () => <p role="status">Loading 3D geometry…</p> });
const HybridControls = dynamic(() => import("./hybrid-controls"));
const SurveyCanvas = dynamic(() => import("./survey-canvas"));
type Config = { enabled: boolean; solarConfigured: boolean; browserKey: string | null; database: boolean; storage: boolean; dailyLimit: number };
const authored = (project: Project): ProjectInput => projectInputSchema.parse(project);
const fingerprint = (project: Project) => JSON.stringify(authored(project));

export default function Workspace({ id }: { id: string }) {
  const [project, setProject] = useState<Project | null>(null), [configuration, setConfiguration] = useState<Config | null>(null);
  const [versions, setVersions] = useState<DesignExport[]>([]), [status, setStatus] = useState("Loading…"), [error, setError] = useState("");
  const [warning, setWarning] = useState(""), [busy, setBusy] = useState(false), [view, setView] = useState<"2d" | "3d" | "survey">("2d"), [pinMode, setPinMode] = useState(false);
  const [dirty, setDirty] = useState(false), [lat, setLat] = useState(""), [lng, setLng] = useState("");
  const [searching, setSearching] = useState(false), [searchResults, setSearchResults] = useState<{ location: Location; label: string; approximate: boolean }[]>([]);
  const [searchLocation, setSearchLocation] = useState<Location | null>(null);
  const [showPanels, setShowPanels] = useState(true), [showMask, setShowMask] = useState(true);
  const current = useRef<Project | null>(null), savedFingerprint = useRef(""), revision = useRef(0), inFlight = useRef<Promise<boolean> | null>(null), blocked = useRef(false), busyRef = useRef(false);
  const undoStack = useRef<ProjectInput[]>([]), redoStack = useRef<ProjectInput[]>([]);
  const [historyTick, setHistoryTick] = useState(0);
  const refreshVersions = useCallback(async () => { setVersions((await api<{ items: DesignExport[] }>(`${endpoint(id)}/exports`)).items); }, [id]);
  const accept = useCallback((value: Project) => {
    current.current = value; revision.current = value.revision; savedFingerprint.current = fingerprint(value); blocked.current = false;
    setProject(value); setDirty(false); setStatus("Saved");
    setLat(value.location ? String(value.location.latitude) : ""); setLng(value.location ? String(value.location.longitude) : "");
  }, []);
  const load = useCallback(async () => {
    setError(""); setStatus("Loading…");
    try {
      const [value, config] = await Promise.all([api<Project>(endpoint(id)), api<Config>("/api/admin/solar-config")]);
      accept(value); setConfiguration(config); await refreshVersions();
      undoStack.current = []; redoStack.current = []; setHistoryTick(tick => tick + 1);
    } catch (error) { setError(error instanceof Error ? error.message : "Project could not be loaded."); setStatus("Load failed"); }
  }, [accept, id, refreshVersions]);
  useEffect(() => { void load(); }, [load]);

  const edit = useCallback((change: (value: Project) => Project) => {
    const previous = current.current; if (!previous || busyRef.current) return;
    const next = change(previous);
    if (!projectInputSchema.safeParse(next).success) { setError("Check numeric limits and required text fields."); return; }
    undoStack.current = [...undoStack.current.slice(-49), authored(previous)]; redoStack.current = [];
    current.current = next; setProject(next); setDirty(fingerprint(next) !== savedFingerprint.current); setStatus("Unsaved changes"); setHistoryTick(tick => tick + 1);
  }, []);
  const save = useCallback(async (): Promise<boolean> => {
    if (inFlight.current) { const ok = await inFlight.current; if (!ok) return false; }
    const value = current.current; if (!value) return false;
    if (fingerprint(value) === savedFingerprint.current) return true;
    if (blocked.current) { setError("Reload the latest project to resolve the simultaneous-edit conflict. Current edits have been kept in this tab."); return false; }
    const input = authored(value), sent = JSON.stringify(input);
    setStatus("Saving…");
    const operation = (async () => {
      try {
        const saved = await api<Project>(endpoint(id), "PATCH", { project: input, revision: revision.current });
        revision.current = saved.revision; savedFingerprint.current = sent;
        if (current.current) {
          current.current = { ...current.current, revision: saved.revision, updatedAt: saved.updatedAt };
          setProject(current.current);
          const changed = fingerprint(current.current) !== sent;
          setDirty(changed); setStatus(changed ? "Unsaved changes" : "Saved");
        }
        setError(""); return true;
      } catch (error) {
        const message = error instanceof Error ? error.message : "Save failed.";
        if (message.includes("another session")) blocked.current = true;
        setError(message); setStatus("Save failed — edits remain in this tab"); return false;
      }
    })();
    inFlight.current = operation;
    try { return await operation; } finally { if (inFlight.current === operation) inFlight.current = null; }
  }, [id]);
  useEffect(() => {
    if (!dirty || busy || blocked.current) return;
    const timer = setTimeout(() => void save(), 1200);
    return () => clearTimeout(timer);
  }, [project, dirty, busy, save]);
  useEffect(() => {
    const beforeUnload = (event: BeforeUnloadEvent) => { if (current.current && fingerprint(current.current) !== savedFingerprint.current) { event.preventDefault(); event.returnValue = ""; } };
    window.addEventListener("beforeunload", beforeUnload);
    return () => window.removeEventListener("beforeunload", beforeUnload);
  }, []);
  function history(direction: "undo" | "redo") {
    if (!current.current || busyRef.current) return;
    const from = direction === "undo" ? undoStack : redoStack, to = direction === "undo" ? redoStack : undoStack;
    const input = from.current.pop(); if (!input) return;
    to.current.push(authored(current.current)); current.current = { ...current.current, ...input };
    setProject(current.current); setDirty(fingerprint(current.current) !== savedFingerprint.current); setStatus("Unsaved changes"); setHistoryTick(tick => tick + 1);
  }
  const historyRef = useRef(history); historyRef.current = history;
  useEffect(() => {
    const key = (event: KeyboardEvent) => {
      if ((event.target as HTMLElement).closest("input,textarea,select,[contenteditable=true]")) return;
      if (event.key === "Escape") { setPinMode(false); return; }
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "z" && !event.altKey) {
        event.preventDefault(); historyRef.current(event.shiftKey ? "redo" : "undo");
      }
    };
    window.addEventListener("keydown", key); return () => window.removeEventListener("keydown", key);
  }, []);
  const run = async (kind: "generate" | "export" | "mask") => {
    if (busyRef.current) return;
    if (kind === "generate" && current.current?.solar && !window.confirm("Regenerate Google's layout? The live layout will be replaced. Saved PDF versions remain available.")) return;
    busyRef.current = true; setBusy(true); setError(""); setWarning(""); setPinMode(false);
    try {
      if (!await save()) return;
      setStatus(kind === "generate" ? "Finding building and generating a review layout…" : kind === "mask" ? "Downloading roof mask…" : "Saving permanent PDF version…");
      if (kind === "generate") {
        const result = await api<{ project: Project; exportId: string | null; warning?: string }>(`${endpoint(id)}/generate`, "POST", { revision: revision.current });
        accept(result.project); setWarning(result.warning ?? ""); undoStack.current = []; redoStack.current = []; setHistoryTick(tick => tick + 1);
      } else if (kind === "mask") {
        const result = await api<{ project: Project }>(`${endpoint(id)}/mask`, "POST", { revision: revision.current });
        accept(result.project);
      } else await api(`${endpoint(id)}/exports`, "POST", { revision: revision.current });
      await refreshVersions(); setStatus("Saved");
    } catch (error) { setError(error instanceof Error ? error.message : "Operation failed."); setStatus("Operation failed"); }
    finally { busyRef.current = false; setBusy(false); }
  };
  const searchAddress = async () => {
    if (busyRef.current || searching || !current.current) return;
    setSearching(true); setError(""); setSearchResults([]);
    try {
      const result = await api<{ items: { location: Location; label: string; approximate: boolean }[] }>(`${endpoint(id)}/locate`, "POST", { address: current.current.address });
      setSearchResults(result.items); setView("2d");
      if (result.items[0]) setSearchLocation(result.items[0].location);
    } catch (error) { setError(error instanceof Error ? error.message : "Address search failed."); }
    finally { setSearching(false); }
  };
  const leave = (event: React.MouseEvent) => { if (dirty && !window.confirm("Leave with unsaved edits? Save first to keep these changes.")) event.preventDefault(); };
  if (!project) return (
    <main className="solar-shell">
      <Link href="/admin/solar-designer">← Projects</Link>
      <p className="mt-6" role="status">{status}</p>
      {error && <p role="alert" className="solar-error mt-5">{error}</p>}
      <Button className="mt-5" onClick={() => void load()}>Retry</Button>
    </main>
  );
  const hybrid = project.settings.hybrid, surveyMode = hybrid.mode === "survey";
  const hybridIssues = surveyMode ? layoutIssues(hybrid, project.solar?.mask, project.solar?.fetchedAt) : [];
  const usable = surveyMode ? usableSections(hybrid).reduce((sum, section) => sum + section.area, 0) : null;
  const surveyArea = surveyMode ? hybrid.sections.reduce((sum, section) => sum + polygonArea(section.points), 0) : null;
  const potential = project.solar?.insights.solarPotential, count = surveyMode ? hybrid.layout?.panels.length ?? 0 : selectedPanels(project).length;
  const rating = surveyMode ? hybrid.layout?.settings.watts ?? hybrid.array.watts : potential?.panelCapacityWatts ?? 0;
  const permittedCounts = potential ? [...new Set([0, ...potential.solarPanelConfigs.map(item => item.panelsCount), Math.min(potential.maxArrayPanelsCount, potential.solarPanels.length)])].filter(value => value <= potential.solarPanels.length).sort((a, b) => a - b) : [0];
  const generatedAtLocation = project.solar?.requestedLocation;
  const moved = Boolean(project.solar && (project.address !== project.solar.requestedAddress || (generatedAtLocation && project.location && (Math.abs(generatedAtLocation.latitude - project.location.latitude) > 0.00001 || Math.abs(generatedAtLocation.longitude - project.location.longitude) > 0.00001))));
  const confirmed = Boolean(project.solar && project.settings.confirmedBuildingName === project.solar.insights.name && !moved);
  const buildingDistance = project.solar ? distance({ x: 0, y: 0 }, localFrame(project.solar.requestedLocation).toLocal(project.solar.insights.center)) : null;
  return (
    <main className="solar-shell">
      <nav className="solar-nav" aria-label="Admin tools">
        <Link href="/admin/solar-designer" onClick={leave}>← Projects</Link>
        <Link href="/admin" onClick={leave}>Lead operations</Link>
      </nav>
      <div className="solar-topbar">
        <div>
          <p className="solar-kicker mb-3 text-teal">Solar Site Designer / automated layout</p>
          <label>
            Project name
            <input value={project.name} disabled={busy} maxLength={120} onChange={event => edit(value => ({ ...value, name: event.target.value }))} />
          </label>
          <p className="solar-save-status" role="status" aria-live="polite">{status} · Revision {project.revision}</p>
        </div>
        <div className="solar-actions">
          <Button variant="outline" disabled={busy || !undoStack.current.length} onClick={() => history("undo")} title="Undo settings (Ctrl/Cmd Z)">Undo</Button>
          <Button variant="outline" disabled={busy || !redoStack.current.length} onClick={() => history("redo")} title="Redo settings (Ctrl/Cmd Shift Z)">Redo</Button>
          <Button variant="outline" disabled={busy} onClick={() => void save()}>Save</Button>
          <Button disabled={busy || (surveyMode ? !hybrid.layout || hybridIssues.length > 0 : !confirmed)} onClick={() => void run("export")}>Save PDF version</Button>
        </div>
      </div>
      {error && (
        <div className="solar-error mb-4" role="alert">
          <p>{error}</p>
          <Button variant="outline" className="mt-3" disabled={busy} onClick={() => { if (!dirty || window.confirm("Discard this tab's edits and reload the latest saved project?")) void load(); }}>Reload saved project</Button>
        </div>
      )}
      {warning && <p className="solar-warning mb-4" role="alert">{warning}</p>}
      {configuration && (!configuration.enabled || !configuration.solarConfigured || !configuration.storage) && (
        <p className="solar-warning">Google generation is not configured. An approved existing billing account, server Solar/Geocoding key, browser Maps key and R2 binding are required. No provider requests are made until you generate or load an enabled map.</p>
      )}
      {project.solarExpired && <p className="solar-warning mt-3">Live Google data expired and was removed. Permanently saved, user-requested PDF versions remain available. Generate fresh data to edit another alternative.</p>}
      {moved && <p className="solar-warning mt-3">The pin differs from the generated building. Generate again before exporting. Current geometry still belongs to the previous result.</p>}
      <div className="solar-workspace">
        <aside className="solar-panel solar-location">
          <h2>1. Locate the building</h2>
          <div className="solar-fields">
            <label>
              House / site address
              <textarea rows={3} maxLength={400} disabled={busy || searching} placeholder="House number, street, locality, city, PIN code" value={project.address} onChange={event => { edit(value => ({ ...value, address: event.target.value, location: null, settings: { ...value.settings, confirmedBuildingName: "" } })); setSearchResults([]); setSearchLocation(null); setLat(""); setLng(""); }} />
            </label>
            <Button variant="outline" disabled={busy || searching || !configuration?.enabled || !configuration.solarConfigured || project.address.trim().length < 3} onClick={() => void searchAddress()}>{searching ? "Searching address…" : "Find address on map"}</Button>
            <p className="solar-canvas-caption">The address helps find the neighbourhood and labels your PDF. Search it first, then click the exact rooftop centre. A house address alone may resolve to a street or locality. Choosing a pin makes that pin the input to Solar, rather than searching the address again.</p>
            {searchResults.map((result, index) => (
              <article className="solar-version" key={index}>
                <p>{result.label}</p>
                <p className="solar-canvas-caption">{result.approximate ? "Approximate address match — locate the rooftop visually." : "Rooftop address match — still verify the house visually."}</p>
                <Button variant="outline" className="mt-2" onClick={() => { setSearchLocation(result.location); setView("2d"); setPinMode(true); }}>Show match; choose rooftop pin</Button>
                <p translate="no" className="solar-canvas-caption">Google Maps</p>
              </article>
            ))}
            <div className="solar-coordinates">
              <label>
                Latitude
                <input type="number" step="any" min={-85} max={85} value={lat} disabled={busy} onChange={event => setLat(event.target.value)} />
              </label>
              <label>
                Longitude
                <input type="number" step="any" min={-180} max={180} value={lng} disabled={busy} onChange={event => setLng(event.target.value)} />
              </label>
            </div>
            <Button variant="outline" disabled={busy} onClick={() => {
              const latitude = Number(lat), longitude = Number(lng);
              if (!lat.trim() || !lng.trim() || !Number.isFinite(latitude) || !Number.isFinite(longitude) || Math.abs(latitude) > 85 || Math.abs(longitude) > 180) { setError("Enter latitude between -85 and 85 and longitude between -180 and 180."); return; }
              edit(value => ({ ...value, location: { latitude, longitude }, settings: { ...value.settings, confirmedBuildingName: "" } })); setSearchLocation(null);
            }}>Apply coordinates</Button>
            <Button variant="outline" aria-pressed={pinMode} disabled={busy || !configuration?.browserKey || view !== "2d"} onClick={() => setPinMode(value => !value)}>{pinMode ? "Cancel pin (Escape)" : "Choose map pin"}</Button>
            <p className="solar-canvas-caption">{pinMode ? "Click the building centre. Map gestures still pan; Escape cancels pin mode." : "Pan and zoom to inspect imagery. Satellite tracing is disabled."}</p>
            <h3>2. Generate the design</h3>
            <label>
              Requested by
              <input value={project.settings.requestedBy} disabled={busy} maxLength={160} placeholder="Customer or requester name" onChange={event => edit(value => ({ ...value, settings: { ...value.settings, requestedBy: event.target.value } }))} />
            </label>
            <label className="solar-checkbox">
              <input type="checkbox" disabled={busy} checked={project.settings.requestConfirmed} onChange={event => edit(value => ({ ...value, settings: { ...value.settings, requestConfirmed: event.target.checked } }))} />
              This requester asked for an energy-system design at this address.
            </label>
            <Button disabled={busy || searching || !configuration?.enabled || !configuration.solarConfigured || !configuration.storage || !project.settings.requestConfirmed || !project.settings.requestedBy.trim()} onClick={() => void run("generate")}>{busy ? "Working…" : project.solar ? "Regenerate review layout" : "Generate review layout"}</Button>
            <p className="solar-canvas-caption">Google chooses the nearest known building within roughly 50 m. It may merge adjacent roofs or return a neighbouring house. Review the detected-building box before creating a PDF.</p>
            <p className="solar-canvas-caption">Calls Google Building Insights and Data Layers; may incur approved account charges. Application cap: {configuration?.dailyLimit ?? "—"} requests/day per backend service. Browser map usage needs Google Cloud quotas separately.</p>
          </div>
        </aside>
        <section className="solar-drawing" aria-label="Design visualization">
          <div className="solar-tabs" aria-label="Design view">
            <Button variant="outline" aria-pressed={view === "2d"} onClick={() => setView("2d")}>2D satellite layout</Button>
            <Button variant="outline" aria-pressed={view === "survey"} onClick={() => { setView("survey"); setPinMode(false); }}>Survey drawing</Button>
            <Button variant="outline" aria-pressed={view === "3d"} onClick={() => { setView("3d"); setPinMode(false); }}>3D geometry</Button>
          </div>
          <div className="solar-layer-controls">
            <label className="solar-checkbox">
              <input type="checkbox" checked={showPanels} onChange={event => setShowPanels(event.target.checked)} />
              Show suggested panels
            </label>
            <label className="solar-checkbox">
              <input type="checkbox" checked={showMask} onChange={event => setShowMask(event.target.checked)} />
              Show raster roof mask
            </label>
          </div>
          {view === "2d" ? (
            <GoogleMap browserKey={configuration?.browserKey ?? null} project={project} pinMode={pinMode} searchLocation={searchLocation} showPanels={showPanels} showMask={showMask} onPin={location => { edit(value => ({ ...value, location, settings: { ...value.settings, confirmedBuildingName: "" } })); setLat(String(location.latitude)); setLng(String(location.longitude)); setPinMode(false); setSearchLocation(null); }} />
          ) : view === "survey" ? (
            <SurveyCanvas design={hybrid} />
          ) : (
            <Preview project={project} />
          )}
          <HybridControls project={project} disabled={busy} onChange={value => edit(current => ({ ...current, settings: { ...current.settings, hybrid: value } }))} />
          <p className="solar-canvas-caption">Lime raster: Google's roof mask. Navy rectangles: Google's suggested panel positions with actual API reference dimensions. North is true north; measurements use local metres. Mask may include other buildings; no exact segment boundaries or obstacle polygons are available.</p>
          {project.solar?.maskWarning && (
            <div role="status" className="solar-warning mt-3">
              <p>{project.solar.maskWarning} The suggested panel positions are available, but roof-mask alignment cannot be checked yet.</p>
              <Button variant="outline" className="mt-3" disabled={busy || moved} onClick={() => void run("mask")}>Retry roof mask only</Button>
              <p className="solar-canvas-caption">Requests fresh Data Layers without regenerating panels. Uses the approved Google account quota.</p>
            </div>
          )}
          {project.solar && (
            <div className="solar-panel mt-4">
              <h2>3. Is this the correct house?</h2>
              <p className="text-sm">The dashed cyan box is Google’s detected building bounding box, not an exact roof boundary. Its centre is {buildingDistance?.toFixed(1)} m from the requested point.</p>
              <p className="solar-canvas-caption">Google Solar data and the current satellite basemap may use different imagery. Rotations come from detected roof-plane azimuths; they are not a tidy-array design. If the box covers the wrong house or multiple properties, do not confirm it. Move the pin and regenerate.</p>
              <label className="solar-checkbox mt-4">
                <input type="checkbox" disabled={busy || moved} checked={confirmed} onChange={event => edit(value => ({ ...value, settings: { ...value.settings, confirmedBuildingName: event.target.checked ? value.solar!.insights.name : "" } }))} />
                I checked the detected building on the map; it is the intended house/site.
              </label>
            </div>
          )}
          {potential && (
            <div className="solar-panel solar-segments">
              <h2>Detected roof planes</h2>
              <table>
                <caption className="mb-3 text-left">API-derived, not survey-verified. Azimuth clockwise from true north; height at segment centre.</caption>
                <thead>
                  <tr>
                    <th scope="col">Section</th>
                    <th scope="col">Include panels</th>
                    <th scope="col">Pitch</th>
                    <th scope="col">Azimuth</th>
                    <th scope="col">Elevation ASL</th>
                    <th scope="col">Horizontal m²</th>
                    <th scope="col">Surface m²</th>
                  </tr>
                </thead>
                <tbody>
                  {potential.roofSegmentStats.map((segment, index) => (
                    <tr key={index}>
                      <th scope="row">{index + 1}</th>
                      <td>
                        <input type="checkbox" aria-label={`Include panels on roof section ${index + 1}`} disabled={busy} checked={!project.settings.excludedSegments.includes(index)} onChange={event => edit(value => ({ ...value, settings: { ...value.settings, excludedSegments: event.target.checked ? value.settings.excludedSegments.filter(item => item !== index) : [...value.settings.excludedSegments, index] } }))} />
                      </td>
                      <td>{segment.pitchDegrees.toFixed(1)}°</td>
                      <td>{segment.azimuthDegrees.toFixed(1)}°</td>
                      <td>{segment.planeHeightAtCenterMeters.toFixed(1)} m</td>
                      <td>{segment.stats.groundAreaMeters2.toFixed(1)}</td>
                      <td>{segment.stats.areaMeters2.toFixed(1)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <p className="solar-canvas-caption">Roof section numbers are shown on the map. Excluding a section removes its suggested panels from the summary, preview and future PDF; it does not redraw the roof or optimise the remaining layout. Height is elevation above sea level, not building height.</p>
            </div>
          )}
        </section>
        <aside className="solar-panel solar-summary">
          <h2>Layout summary</h2>
          <div className="solar-summary-stats">
            <div className="solar-stat">
              <span>Panels</span>
              <strong>{count}</strong>
            </div>
            <div className="solar-stat">
              <span>DC capacity</span>
              <strong>{capacityKwp(count, rating).toFixed(2)} kWp</strong>
            </div>
            <div className="solar-stat">
              <span>Horizontal roof</span>
              <strong>{surveyMode ? Math.abs(surveyArea ?? 0).toFixed(1) : potential?.wholeRoofStats.groundAreaMeters2.toFixed(1) ?? "—"} m²</strong>
            </div>
            <div className="solar-stat">
              <span>Roof surface</span>
              <strong>{surveyMode ? Math.abs(surveyArea ?? 0).toFixed(1) : potential?.wholeRoofStats.areaMeters2.toFixed(1) ?? "—"} m²</strong>
            </div>
          </div>
          <p className="solar-canvas-caption">{surveyMode ? `Usable horizontal area after setbacks, exclusions and section-overlap removal: ${usable?.toFixed(2)} m². Flat-section assumption. ${hybridIssues.join(" ")}` : "Usable area after setbacks: not calculated. Google's placement is not a custom-clearance check or a guaranteed globally optimal layout."}</p>
          {surveyMode && (
            <p className="solar-canvas-caption">{hybrid.layout?.settings.label ?? hybrid.array.label} · {rating} W · Array {hybrid.layout?.settings.azimuth ?? hybrid.array.azimuth}° true azimuth · Tilt {hybrid.layout?.settings.tilt ?? hybrid.array.tilt}°. Row spacing is a clear horizontal gap.</p>
          )}
          {potential && !surveyMode && (
            <div className="solar-fields mt-5">
              <p className="text-sm">Google reference module: <strong>{potential.panelCapacityWatts} W</strong>, {(potential.panelHeightMeters * 1000).toFixed(0)} × {(potential.panelWidthMeters * 1000).toFixed(0)} mm. No manufacturer/model supplied. Changing module dimensions would require a separate placement calculation.</p>
              <label>
                Google's layout alternatives
                <select disabled={busy} value={project.settings.selectedPanelCount} onChange={event => edit(value => ({ ...value, settings: { ...value.settings, selectedPanelCount: Number(event.target.value) } }))}>
                  {permittedCounts.map(value => (
                    <option key={value} value={value}>{value} panels / {capacityKwp(value, potential.panelCapacityWatts).toFixed(2)} kWp</option>
                  ))}
                </select>
              </label>
              <p className="solar-canvas-caption">Alternatives use the first N panels from Google's ranked list. Pitch, azimuth and portrait/landscape are supplied per segment/panel. No panel movement or satellite drawing.</p>
            </div>
          )}
          <div className="solar-fields mt-5">
            <label>
              PDF version name
              <input disabled={busy} maxLength={100} value={project.settings.versionName} onChange={event => edit(value => ({ ...value, settings: { ...value.settings, versionName: event.target.value } }))} />
            </label>
            <label>
              Design notes
              <textarea rows={3} disabled={busy} maxLength={2000} value={project.settings.notes} onChange={event => edit(value => ({ ...value, settings: { ...value.settings, notes: event.target.value } }))} />
            </label>
          </div>
          {project.solar && (
            <div className="solar-canvas-caption mt-4">
              <p>Imagery: {imageryDate(project.solar.insights.imageryDate)} · {project.solar.insights.imageryQuality}</p>
              <p>Live data expires {new Date(project.solar.expiresAt).toLocaleDateString("en-IN")}. API-derived; not survey-verified.</p>
              <p className="mt-3" translate="no">Source: Includes solar data from Google</p>
              <p translate="no" style={{ color: "#5e5e5e", fontWeight: 400, fontSize: 12, letterSpacing: "normal" }}>Google Maps</p>
            </div>
          )}
          <h3>Saved PDF alternatives</h3>
          <p className="solar-canvas-caption">Immutable fixed-media versions for this requested design. Compare counts and capacities below; download the layouts for visual comparison.</p>
          <div className="solar-versions">
            {!versions.length && <p className="text-sm">No permanently saved PDF yet.</p>}
            {versions.map(version => (
              <article className="solar-version" key={version.id}>
                <h4 className="font-bold">{version.name}</h4>
                <p>{version.panel_count} panels · {version.capacity_kwp.toFixed(2)} kWp · Rev {version.design_revision}</p>
                <p>{new Date(version.created_at).toLocaleString("en-IN")}</p>
                <a href={`${endpoint(id)}/exports/${version.id}`}>Download vector PDF layout</a>
              </article>
            ))}
          </div>
        </aside>
      </div>
      <p className="solar-footnote">Google reference layouts depend on building coverage. Survey layouts support independently entered flat-roof and flat-ground boundaries, exclusions and module-sized arrays. True south is the default, not a verified energy optimum. No satellite boundary tracing, energy estimates, quotations, structural checks or shadow simulation.</p>
      <span hidden>{historyTick}</span>
    </main>
  );
}
