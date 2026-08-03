import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import Footer from "@/components/footer";
import { SiteHeader } from "@/components/site-header";
import { buttonStyles } from "@/components/ui";

export const metadata: Metadata = { title: "Solar Projects in Delhi NCR | CAAT PowerBot", description: "A growing record of rooftop solar, storage and hybrid power projects from CAAT PowerBot across Delhi NCR.", alternates: { canonical: "/projects" } };

export default function ProjectsPage() { return <main className="grid-lines min-h-screen"><SiteHeader fixed /><div className="landing-header-space" aria-hidden="true" /><section className="hero-flow"><div className="container-wide py-16 sm:py-24"><p className="section-kicker">CAAT project portfolio</p><h1 className="mt-5 max-w-4xl text-4xl font-black tracking-[-.05em] sm:text-6xl">Solar projects, documented properly.</h1><p className="mt-6 max-w-2xl text-lg leading-8 text-ink/70">This page is being prepared for detailed project case studies, including project photographs, system size, location, scope and outcomes.</p><div className="mt-8"><Link href="/#references" className={buttonStyles("outline", "gap-2")}>View current client references <ArrowUpRight size={17} /></Link></div></div></section><section className="bg-paper py-16 sm:py-24"><div className="container-wide"><div className="rounded-3xl border border-dashed border-ink/25 bg-white p-8 text-center sm:p-14"><p className="font-mono text-[11px] font-bold uppercase tracking-[.22em] text-teal">Case studies coming soon</p><h2 className="mt-4 text-3xl font-black tracking-tight">Detailed project stories will appear here.</h2><p className="mx-auto mt-4 max-w-2xl leading-7 text-ink/70">CAAT will add verified project details and images here as they are ready to publish.</p></div></div></section><Footer /></main>; }
