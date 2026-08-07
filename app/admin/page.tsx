"use client";

import { FormEvent, Fragment, useEffect, useState } from "react";
import { Button, Card } from "@/components/ui";
import { inr } from "@/lib/utils";
import { SETTING_FIELDS, TEMPLATE_QUOTE_SETTINGS } from "@/lib/settings";

type Lead = {
  id: string; name: string; phone: string; email: string; address?: string; city?: string; state?: string; pincode?: string;
  property_type: string; roof_type: string; ownership: string; system_type?: string; battery_required?: number;
  monthly_bill: number; monthly_units?: number; price_per_unit?: number; provider?: string; bill_object_key?: string; site_photo_object_key?: string;
  status: string; created_at?: string;
};

type BlogPost = {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  status: "draft" | "published";
  published_at: string | null;
  created_at: string;
  updated_at: string;
};

type BlogDraft = Omit<BlogPost, "id" | "published_at" | "created_at" | "updated_at">;

const statuses = ["new", "called", "site_visit", "proposal_sent", "won", "lost"];
const emptyBlog: BlogDraft = { title: "", slug: "", excerpt: "", content: "", status: "draft" };
const readable = (value?: string | number) => String(value ?? "-").replaceAll("_", " ").replace(/\b\w/g, (letter) => letter.toUpperCase());

const formatIndiaTimestamp = (value?: string | null) => {
  if (!value) return "-";
  const iso = value.includes("T") ? value : `${value.replace(" ", "T")}Z`;
  const date = new Date(iso);
  return Number.isNaN(date.getTime()) ? value : new Intl.DateTimeFormat("en-IN", { timeZone: "Asia/Kolkata", dateStyle: "medium", timeStyle: "short" }).format(date);
};

function slugify(value: string) {
  return value.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

async function responseMessage(response: Response) {
  const payload = await response.json().catch(() => null) as { error?: { message?: string } } | null;
  return payload?.error?.message ?? "Something went wrong. Please try again.";
}

export default function Admin() {
  const [logged, setLogged] = useState(false);
  const [adminId, setAdminId] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [leads, setLeads] = useState<Lead[]>([]);
  const [search, setSearch] = useState("");
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [settings, setSettings] = useState<Record<string, number>>({ ...TEMPLATE_QUOTE_SETTINGS });
  const [settingsMessage, setSettingsMessage] = useState("");
  const [blogs, setBlogs] = useState<BlogPost[]>([]);
  const [blogDraft, setBlogDraft] = useState<BlogDraft>(emptyBlog);
  const [editingBlogId, setEditingBlogId] = useState<string | null>(null);
  const [blogMessage, setBlogMessage] = useState("");
  const [savingBlog, setSavingBlog] = useState(false);

  const login = async (event: FormEvent) => {
    event.preventDefault();
    setError("");
    const response = await fetch("/api/auth/login", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ adminId, password }) });
    if (!response.ok) {
      setError("Admin ID or password is incorrect.");
      return;
    }
    setLogged(true);
  };

  const load = async (query = "") => {
    const [leadResponse, settingsResponse, blogResponse] = await Promise.all([
      fetch(`/api/admin/leads?search=${encodeURIComponent(query)}`),
      fetch("/api/settings", { cache: "no-store" }),
      fetch("/api/admin/blogs", { cache: "no-store" }),
    ]);

    if (leadResponse.ok) setLeads((await leadResponse.json()).data.items);
    if (settingsResponse.ok) {
      const payload = await settingsResponse.json();
      if (payload.data && typeof payload.data === "object") setSettings((current) => ({ ...current, ...payload.data }));
    }
    if (blogResponse.ok) {
      const payload = await blogResponse.json();
      if (Array.isArray(payload.data?.items)) setBlogs(payload.data.items);
    }
  };

  useEffect(() => {
    if (logged) void load();
  }, [logged]);

  const updateStatus = async (leadId: string, status: string) => {
    await fetch("/api/lead/status", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ leadId, status }) });
    await load(search);
    setSelectedLead((current) => current?.id === leadId ? { ...current, status } : current);
  };

  const saveSettings = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSettingsMessage("");
    const response = await fetch("/api/settings", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(settings) });
    setSettingsMessage(response.ok ? "Settings saved." : "Settings could not be saved.");
  };

  const exportCsv = () => {
    const csv = ["Name,Phone,Email,City,Monthly Bill,Status", ...leads.map((lead) => [lead.name, lead.phone, lead.email, lead.city, lead.monthly_bill, lead.status].map((value) => `"${String(value ?? "").replaceAll('"', '""')}"`).join(","))].join("\n");
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
    const link = document.createElement("a");
    link.href = url;
    link.download = "caat-powerbot-leads.csv";
    link.click();
    URL.revokeObjectURL(url);
  };

  const resetBlogForm = () => {
    setBlogDraft(emptyBlog);
    setEditingBlogId(null);
    setBlogMessage("");
  };

  const editBlog = (post: BlogPost) => {
    setEditingBlogId(post.id);
    setBlogDraft({ title: post.title, slug: post.slug, excerpt: post.excerpt, content: post.content, status: post.status });
    setBlogMessage("");
    document.getElementById("blogbot-admin")?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const saveBlog = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSavingBlog(true);
    setBlogMessage("");
    const response = await fetch(editingBlogId ? `/api/admin/blogs/${editingBlogId}` : "/api/admin/blogs", {
      method: editingBlogId ? "PATCH" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(blogDraft),
    });
    if (!response.ok) {
      setBlogMessage(await responseMessage(response));
      setSavingBlog(false);
      return;
    }
    setBlogMessage(editingBlogId ? "Blog post updated." : "Blog post created.");
    setBlogDraft(emptyBlog);
    setEditingBlogId(null);
    setSavingBlog(false);
    await load(search);
  };

  const deleteBlog = async (post: BlogPost) => {
    if (!window.confirm(`Delete “${post.title}”? This cannot be undone.`)) return;
    setBlogMessage("");
    const response = await fetch(`/api/admin/blogs/${post.id}`, { method: "DELETE" });
    if (!response.ok) {
      setBlogMessage(await responseMessage(response));
      return;
    }
    if (editingBlogId === post.id) resetBlogForm();
    setBlogMessage("Blog post deleted.");
    await load(search);
  };

  if (!logged) return <main className="grid min-h-screen place-items-center p-6"><Card className="w-full max-w-md"><p className="font-black text-teal">caat powerbot / admin</p><h1 className="mt-6 text-3xl font-black">Welcome back.</h1><form onSubmit={login} className="mt-6 space-y-3"><label className="block text-sm font-bold">Admin ID<sup className="ml-1 text-red-500">*</sup><input className="mt-2 w-full rounded-2xl border p-3 font-normal" placeholder="Admin ID" type="text" autoComplete="username" value={adminId} onChange={(event) => setAdminId(event.target.value)} required /></label><label className="block text-sm font-bold">Password<sup className="ml-1 text-red-500">*</sup><input className="mt-2 w-full rounded-2xl border p-3 font-normal" placeholder="Password" type="password" autoComplete="current-password" value={password} onChange={(event) => setPassword(event.target.value)} required /></label><button className="w-full rounded-full bg-ink p-3 font-bold text-white">Sign in</button>{error && <p className="text-sm text-red-600">{error}</p>}</form></Card></main>;

  return (
    <main className="min-h-screen p-6 md:p-10">
      <div className="mx-auto max-w-6xl">
        <div className="flex items-center justify-between gap-4"><div><p className="font-black text-teal">caat powerbot / admin</p><h1 className="mt-2 text-4xl font-black">Lead operations.</h1></div><button onClick={() => setLogged(false)} className="text-sm font-bold">Sign out</button></div>

        <div className="mt-10 grid gap-4 md:grid-cols-4">{[["Today’s leads", leads.length.toString()], ["Total leads", leads.length.toString()], ["Revenue estimate", inr(leads.reduce((total, lead) => total + Number(lead.monthly_bill || 0) * 40, 0))], ["Site visits", leads.filter((lead) => lead.status === "site_visit").length.toString()]].map(([label, value]) => <Card key={label}><p className="text-sm text-ink/50">{label}</p><b className="mt-3 block text-3xl">{value}</b></Card>)}</div>

        <Card className="mt-6 overflow-x-auto"><div className="flex flex-wrap items-center justify-between gap-3"><div><h2 className="text-xl font-black">Leads</h2><p className="mt-1 text-sm text-ink/50">Select a lead to view all submitted details.</p></div><div className="flex gap-2"><input className="rounded-full border px-4 py-2 text-sm" placeholder="Search leads" value={search} onChange={(event) => setSearch(event.target.value)} onKeyDown={(event) => { if (event.key === "Enter") void load(search); }} /><Button type="button" variant="outline" onClick={exportCsv}>Export CSV</Button></div></div>
          <table className="mt-6 w-full min-w-[720px] text-left text-sm"><thead className="text-ink/50"><tr><th className="pb-3">Customer</th><th>City</th><th>Monthly bill</th><th>Status</th></tr></thead><tbody>{leads.map((lead) => <Fragment key={lead.id}><tr onClick={() => setSelectedLead((current) => current?.id === lead.id ? null : lead)} className={`cursor-pointer border-t border-ink/10 transition hover:bg-cream/70 ${selectedLead?.id === lead.id ? "bg-cream" : ""}`} aria-expanded={selectedLead?.id === lead.id}><td className="py-4"><b>{lead.name}</b><br /><span className="text-xs text-ink/50">{lead.phone} · {lead.email}</span><span className="ml-2 text-xs font-bold text-teal">{selectedLead?.id === lead.id ? "Hide details" : "View details"}</span></td><td>{lead.city}</td><td>{inr(Number(lead.monthly_bill))}</td><td onClick={(event) => event.stopPropagation()}><select className="rounded-full border px-3 py-2 text-xs" value={lead.status} onChange={(event) => void updateStatus(lead.id, event.target.value)}>{statuses.map((status) => <option value={status} key={status}>{status.replaceAll("_", " ")}</option>)}</select></td></tr>{selectedLead?.id === lead.id && <tr className="border-b border-ink/10"><td colSpan={4} className="bg-cream/60 p-5"><LeadDetails lead={lead} onClose={() => setSelectedLead(null)} /></td></tr>}</Fragment>)}</tbody></table>
          {leads.length === 0 && <p className="py-10 text-center text-sm text-ink/50">No persisted leads yet. Submit a public estimate to populate this table.</p>}</Card>

        <Card className="mt-6"><div className="flex items-center justify-between gap-4"><div><h2 className="text-xl font-black">Estimate settings</h2><p className="mt-1 text-sm text-ink/50">These values control new estimate calculations.</p></div>{settingsMessage && <p className="text-sm font-semibold text-teal">{settingsMessage}</p>}</div><form onSubmit={saveSettings} className="mt-6 grid gap-4 md:grid-cols-3">{SETTING_FIELDS.map(([key, label]) => <label key={key} className="text-sm"><span className="mb-2 block font-bold">{label}</span><input className="w-full rounded-2xl border p-3" type="number" step="any" value={settings[key] ?? ""} onChange={(event) => setSettings((current) => ({ ...current, [key]: Number(event.target.value) }))} /></label>)}<div className="md:col-span-3"><Button>Save settings</Button></div></form></Card>

        <Card id="blogbot-admin" className="mt-6 border border-ink/10"><div className="flex flex-wrap items-start justify-between gap-4"><div><p className="font-mono text-[11px] font-bold uppercase tracking-[.18em] text-teal">BlogBot</p><h2 className="mt-2 text-2xl font-black">Write and manage posts.</h2><p className="mt-1 max-w-xl text-sm text-ink/55">Drafts stay private. Published posts go live on the public BlogBot page.</p></div>{blogMessage && <p className="text-sm font-semibold text-teal">{blogMessage}</p>}</div>
          <form onSubmit={saveBlog} className="mt-7 grid gap-4"><div className="grid gap-4 md:grid-cols-[1fr_.55fr]"><label className="text-sm font-bold">Post title<input className="mt-2 w-full rounded-2xl border p-3 font-normal" value={blogDraft.title} onChange={(event) => setBlogDraft((current) => ({ ...current, title: event.target.value, slug: current.slug || slugify(event.target.value) }))} minLength={3} maxLength={160} required /></label><label className="text-sm font-bold">URL slug<input className="mt-2 w-full rounded-2xl border p-3 font-normal" value={blogDraft.slug} onChange={(event) => setBlogDraft((current) => ({ ...current, slug: slugify(event.target.value) }))} pattern="[a-z0-9]+(-[a-z0-9]+)*" minLength={3} maxLength={160} required /></label></div>
            <label className="text-sm font-bold">Short summary<textarea className="mt-2 min-h-24 w-full rounded-2xl border p-3 font-normal" value={blogDraft.excerpt} onChange={(event) => setBlogDraft((current) => ({ ...current, excerpt: event.target.value }))} minLength={10} maxLength={360} required /></label>
            <label className="text-sm font-bold">Article content<textarea className="mt-2 min-h-56 w-full rounded-2xl border p-3 font-normal" value={blogDraft.content} onChange={(event) => setBlogDraft((current) => ({ ...current, content: event.target.value }))} minLength={20} maxLength={50000} required /><span className="mt-1 block text-xs font-normal text-ink/45">Use a blank line to start a new paragraph.</span></label>
            <div className="flex flex-wrap items-center justify-between gap-4"><label className="flex items-center gap-3 text-sm font-bold">Visibility<select className="rounded-full border bg-white px-4 py-2 font-normal" value={blogDraft.status} onChange={(event) => setBlogDraft((current) => ({ ...current, status: event.target.value as BlogPost["status"] }))}><option value="draft">Draft — private</option><option value="published">Published — public</option></select></label><div className="flex gap-2"><Button type="button" variant="outline" onClick={resetBlogForm}>Cancel</Button><Button disabled={savingBlog}>{savingBlog ? "Saving…" : editingBlogId ? "Update post" : "Create post"}</Button></div></div>
          </form>
          <div className="mt-10 border-t border-ink/10 pt-7"><h3 className="text-lg font-black">Existing posts</h3>{blogs.length === 0 ? <p className="mt-4 text-sm text-ink/55">No posts have been created yet.</p> : <div className="mt-4 divide-y divide-ink/10">{blogs.map((post) => <article key={post.id} className="flex flex-col gap-4 py-5 sm:flex-row sm:items-center sm:justify-between"><div><div className="flex flex-wrap items-center gap-2"><h4 className="font-black">{post.title}</h4><span className={`rounded-full px-2.5 py-1 text-[10px] font-black uppercase tracking-[.12em] ${post.status === "published" ? "bg-lime text-teal" : "bg-cream text-ink/55"}`}>{post.status}</span></div><p className="mt-1 text-sm text-ink/55">/{post.slug} · Updated {formatIndiaTimestamp(post.updated_at)}</p></div><div className="flex gap-2"><Button type="button" variant="outline" className="min-h-9 px-4 py-2" onClick={() => editBlog(post)}>Edit</Button><Button type="button" variant="outline" className="min-h-9 border-red-200 px-4 py-2 text-red-700" onClick={() => void deleteBlog(post)}>Delete</Button></div></article>)}</div>}</div>
        </Card>
      </div>
    </main>
  );
}

function LeadDetails({ lead, onClose }: { lead: Lead; onClose: () => void }) {
  const fileLink = (kind: "bill" | "site-photo", label: string) => <a href={`/api/admin/leads/${encodeURIComponent(lead.id)}/file?kind=${kind}`} target="_blank" rel="noreferrer" className="mt-1 inline-block text-sm font-bold text-teal underline underline-offset-4">{label}</a>;
  const data = [["Name", lead.name], ["Phone", lead.phone], ["Email", lead.email], ["Address", [lead.address, lead.city, lead.state, lead.pincode].filter(Boolean).join(", ") || "-"], ["Property type", readable(lead.property_type)], ["Roof type", readable(lead.roof_type)], ["Ownership", readable(lead.ownership)], ["System type", readable(lead.system_type)], ["Battery required", lead.battery_required ? "Yes" : "No"], ["Monthly usage", lead.monthly_units ? `${Number(lead.monthly_units).toLocaleString("en-IN")} units` : "-"], ["Price per unit", lead.price_per_unit ? inr(Number(lead.price_per_unit)) : "Not recorded for this older lead"], ["Electricity provider", lead.provider || "-"], ["Bill upload", lead.bill_object_key ? fileLink("bill", "View uploaded bill") : "Not available"], ["Site photo", lead.site_photo_object_key ? fileLink("site-photo", "View site photo") : "Not provided"], ["Submitted (IST)", formatIndiaTimestamp(lead.created_at)]];
  return <div className="rounded-2xl border border-teal/30 bg-white p-5 shadow-sm"><div className="flex items-start justify-between gap-4"><div><p className="section-kicker">Lead details</p><h2 className="mt-2 text-2xl font-black">{lead.name}</h2></div><Button type="button" variant="outline" onClick={onClose}>Close</Button></div><div className="mt-6 grid gap-x-8 gap-y-4 sm:grid-cols-2">{data.map(([label, value], index) => <div key={`${String(label)}-${index}`}><p className="text-xs font-bold uppercase tracking-wide text-ink/45">{label}</p><p className="mt-1 break-words text-sm font-semibold">{value}</p></div>)}</div></div>;
}
