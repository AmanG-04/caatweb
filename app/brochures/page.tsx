import type { Metadata } from "next";
import { ArrowUpRight, ExternalLink, FileText, PanelsTopLeft } from "lucide-react";
import Link from "next/link";
import { PublicPage } from "@/components/public-page";
import { brochures, brochuresDriveUrl } from "@/lib/brochures";

export const metadata: Metadata = {
  title: "Brochures & Technical Documents | CAAT PowerBot",
  description: "Manufacturer brochures and technical documents for CAAT PowerBot energy solutions.",
  alternates: { canonical: "/brochures" },
};

export default function BrochuresPage() {
  return (
    <PublicPage>
      <section className="bg-paper py-16 sm:py-24" aria-labelledby="brochures-title">
        <div className="container-wide">
          <div className="mx-auto max-w-3xl text-center">
            <h1 id="brochures-title" className="hero-title-highlight inline-block px-2 pb-1 text-2xl font-black leading-[1.15] tracking-[-.05em] sm:text-5xl">Brochures & Technical Documents</h1>
            <p className="section-copy mx-auto">Verified product literature for the equipment ranges we recommend and install.</p>
          </div>

          <div className="mx-auto mt-12 max-w-6xl">
            <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <span className="grid h-11 w-11 place-items-center rounded-xl bg-lime text-teal">
                  <FileText size={22} aria-hidden="true" />
                </span>
                <p className="font-mono text-[11px] font-bold uppercase tracking-[.16em] text-ink/55">
                  Select a document to preview
                </p>
              </div>
              <a
                href={brochuresDriveUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 font-mono text-[11px] font-bold uppercase tracking-[.12em] text-teal underline decoration-teal/35 underline-offset-4 transition-colors hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-teal"
              >
                Open full library
                <ExternalLink size={14} aria-hidden="true" />
              </a>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {brochures.map((brochure, index) => (
                <Link
                  key={brochure.id}
                  href={`/brochures/${brochure.id}`}
                  prefetch={false}
                  className="group min-h-52 rounded-[1.5rem] border border-ink/10 bg-white p-6 shadow-soft transition duration-200 hover:-translate-y-1 hover:border-teal/40 hover:shadow-lg focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-teal"
                >
                  <span className="flex items-center justify-between font-mono text-[10px] font-bold uppercase tracking-[.16em] text-ink/45">
                    PDF {String(index + 1).padStart(2, "0")}
                    <ArrowUpRight size={17} className="text-teal transition-transform group-hover:-translate-y-1 group-hover:translate-x-1" aria-hidden="true" />
                  </span>
                  <span className="mt-10 grid h-12 w-12 place-items-center rounded-xl bg-cream text-teal transition-colors group-hover:bg-lime">
                    <FileText size={23} aria-hidden="true" />
                  </span>
                  <span className="mt-5 block text-xl font-black tracking-tight text-ink">
                    {brochure.label}
                  </span>
                  <span className="mt-2 block text-sm text-ink/60">Preview document</span>
                </Link>
              ))}
              <a
                href={brochuresDriveUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="group min-h-52 rounded-[1.5rem] border border-dashed border-teal/35 bg-teal p-6 text-white shadow-soft transition duration-200 hover:-translate-y-1 hover:bg-ink focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-teal"
              >
                <span className="flex items-center justify-between font-mono text-[10px] font-bold uppercase tracking-[.16em] text-white/55">
                  More documents
                  <ExternalLink size={17} className="transition-transform group-hover:-translate-y-1 group-hover:translate-x-1" aria-hidden="true" />
                </span>
                <span className="mt-10 grid h-12 w-12 place-items-center rounded-xl bg-lime text-teal">
                  <PanelsTopLeft size={23} aria-hidden="true" />
                </span>
                <span className="mt-5 block text-xl font-black tracking-tight">Full document library</span>
                <span className="mt-2 block text-sm text-white/70">Browse all available files</span>
              </a>
            </div>
          </div>
        </div>
      </section>
    </PublicPage>
  );
}
