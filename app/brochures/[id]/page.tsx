import type { Metadata } from "next";
import { ExternalLink } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { brochures } from "@/lib/brochures";

type BrochurePageProps = {
  params: Promise<{ id: string }>;
};

export async function generateStaticParams() {
  return brochures.map(({ id }) => ({ id }));
}

export async function generateMetadata({ params }: BrochurePageProps): Promise<Metadata> {
  const { id } = await params;
  const brochure = brochures.find((item) => item.id === id);

  if (!brochure) {
    return {};
  }

  return {
    title: `${brochure.label} | CAAT PowerBot`,
    robots: { index: false, follow: false },
  };
}

export default async function BrochureViewerPage({ params }: BrochurePageProps) {
  const { id } = await params;
  const brochure = brochures.find((item) => item.id === id);

  if (!brochure) {
    notFound();
  }

  const driveUrl = `https://drive.google.com/file/d/${brochure.id}/view`;
  const previewUrl = `https://drive.google.com/file/d/${brochure.id}/preview`;

  return (
    <main className="min-h-screen bg-paper px-4 py-5 sm:px-8 sm:py-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-5 flex flex-wrap items-center justify-between gap-4">
          <Link
            href="/brochures"
            prefetch={false}
            className="font-mono text-[11px] font-bold uppercase tracking-[.14em] text-teal underline decoration-teal/35 underline-offset-4 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-teal"
          >
            Back to documents
          </Link>
          <a
            href={driveUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-xl bg-teal px-4 py-3 font-mono text-[10px] font-bold uppercase tracking-[.12em] text-white transition-colors hover:bg-ink focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-teal"
          >
            Open in Google Drive
            <ExternalLink size={14} aria-hidden="true" />
          </a>
        </div>
        <section className="overflow-hidden rounded-[1.5rem] border border-ink/10 bg-white shadow-soft" aria-label={`${brochure.label} PDF preview`}>
          <iframe
            src={previewUrl}
            title={`${brochure.label} PDF preview`}
            className="h-[calc(100svh-8.5rem)] min-h-[36rem] w-full border-0"
            allow="autoplay"
          />
        </section>
      </div>
    </main>
  );
}
