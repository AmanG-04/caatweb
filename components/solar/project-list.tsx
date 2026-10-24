"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { Button, Card } from "@/components/ui";
import { emptyProject, type Project } from "@/lib/solar/model";
import { api, endpoint } from "./api";

type Item = { id: string; name: string; address: string; revision: number; updated_at: string };
export default function ProjectList() {
  const [items, setItems] = useState<Item[]>([]), [name, setName] = useState(""), [error, setError] = useState("");
  const [loading, setLoading] = useState(true), [busy, setBusy] = useState(false);
  const load = useCallback(async () => {
    setError(""); setLoading(true);
    try { setItems((await api<{ items: Item[] }>("/api/admin/solar-projects")).items); }
    catch (error) { setError(error instanceof Error ? error.message : "Projects could not be loaded."); }
    finally { setLoading(false); }
  }, []);
  useEffect(() => { void load(); }, [load]);
  async function action(work: () => Promise<unknown>) {
    setBusy(true); setError("");
    try { await work(); await load(); } catch (error) { setError(error instanceof Error ? error.message : "Operation failed."); }
    finally { setBusy(false); }
  }
  return (
    <main className="solar-shell">
      <nav aria-label="Admin tools" className="solar-nav">
        <Link href="/admin">← Lead operations</Link>
        <span aria-current="page">Solar Site Designer</span>
      </nav>
      <header className="solar-banner">
        <p className="solar-kicker">CAAT PowerBot / internal design workspace</p>
        <h1>Solar Site Designer.</h1>
        <p>Locate a building. Generate a reference layout. Save the design as a PDF.</p>
      </header>
      <Card className="mt-6">
        <form onSubmit={event => { event.preventDefault(); void action(async () => { await api<Project>("/api/admin/solar-projects", "POST", emptyProject(name)); setName(""); }); }} className="solar-create">
          <label>
            Project name
            <input value={name} onChange={event => setName(event.target.value)} required maxLength={120} placeholder="e.g. Noida office rooftop" />
          </label>
          <Button disabled={busy || !name.trim()}>Create project</Button>
        </form>
      </Card>
      {error && (
        <div role="alert" className="solar-error mt-5">
          <p>{error}</p>
          <Button variant="outline" onClick={() => void load()}>Retry loading projects</Button>
        </div>
      )}
      {loading && <p role="status" className="mt-6">Loading persisted projects…</p>}
      {!loading && !error && !items.length && <p className="mt-8">No projects yet. Create your first site above.</p>}
      <div className="solar-project-grid">
        {items.map(item => (
          <Card key={item.id}>
            <p className="solar-kicker">Revision {item.revision}</p>
            <h2 className="mt-3 text-2xl font-black">{item.name}</h2>
            <p className="mt-2 text-sm text-ink/65">{item.address || "Location not set"}</p>
            <p className="mt-2 text-xs text-ink/60">Updated {new Date(item.updated_at).toLocaleString("en-IN")}</p>
            <div className="solar-actions mt-5">
              <Link className="solar-link-button" href={`/admin/solar-designer/${item.id}`}>Open</Link>
              <Button variant="outline" disabled={busy} onClick={() => {
                const newName = window.prompt("Rename project", item.name);
                if (newName?.trim()) void action(async () => { const project = await api<Project>(endpoint(item.id)); await api(endpoint(item.id), "PATCH", { project: { ...project, name: newName }, revision: project.revision }); });
              }}>Rename</Button>
              <Button variant="outline" disabled={busy} onClick={() => void action(() => api(endpoint(item.id), "POST"))}>Duplicate</Button>
              <Button variant="outline" disabled={busy} onClick={() => {
                if (window.confirm(`Permanently delete “${item.name}” and all saved PDFs?`)) void action(() => api(endpoint(item.id), "DELETE"));
              }}>Delete</Button>
            </div>
          </Card>
        ))}
      </div>
      <p className="solar-footnote">Automatic Google reference layouts; no manual satellite tracing. Project copies retain authored settings and require a fresh generation. Flat or sloped buildings depend on provider coverage. Ground sites are not supported by Building Insights.</p>
    </main>
  );
}
