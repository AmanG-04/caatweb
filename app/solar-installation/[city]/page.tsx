import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowUpRight, MapPin } from "lucide-react";
import Footer from "@/components/footer";
import { SiteHeader } from "@/components/site-header";
import { buttonStyles, Card } from "@/components/ui";
import { getServiceArea, serviceAreas } from "@/lib/service-areas";

type PageProps = { params: Promise<{ city: string }> };

export const dynamicParams = false;

export function generateStaticParams() {
  return serviceAreas.map((area) => ({ city: area.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const area = getServiceArea((await params).city);
  if (!area) return { title: "Service area not found | CAAT PowerBot" };

  return {
    title: `Solar Panel Installation in ${area.name} | CAAT PowerBot`,
    description: `Rooftop solar installation in ${area.name}, ${area.state}. Get a practical bill-based estimate and support with net metering from CAAT PowerBot.`,
    alternates: { canonical: `/solar-installation/${area.slug}` },
  };
}

export default async function ServiceAreaPage({ params }: PageProps) {
  const area = getServiceArea((await params).city);
  if (!area) notFound();

  const areaSchema = {
    "@context": "https://schema.org",
    "@type": "Service",
    name: `Rooftop solar installation in ${area.name}`,
    provider: { "@type": "Organization", name: "CAAT PowerBot LLP" },
    areaServed: { "@type": "City", name: area.name, address: { "@type": "PostalAddress", addressRegion: area.state, addressCountry: "IN" } },
  };

  return (
    <main className="grid-lines min-h-screen">
      <SiteHeader fixed />
      <div className="landing-header-space" aria-hidden="true" />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(areaSchema).replace(/</g, "\\u003c") }} />
      <section className="hero-flow border-b border-ink/10">
        <div className="container-wide py-12 sm:py-16">
          <p className="section-kicker">Solar in {area.name}</p>
          <h1 className="page-title mt-5 max-w-4xl">Rooftop solar, designed for {area.name}.</h1>
          <p className="section-copy mt-6 max-w-2xl">{area.description}</p>
          <Link href="/quote" className={buttonStyles("primary", "mt-8 gap-2 px-6")}>
            Get my solar estimate
            <ArrowUpRight size={17} />
          </Link>
        </div>
      </section>
      <section className="bg-paper py-12 sm:py-16">
        <div className="container-wide grid gap-5 md:grid-cols-2">
          <Card className="border border-ink/10">
            <p className="font-mono text-[11px] font-bold uppercase tracking-[.2em] text-teal">Power connection</p>
            <h2 className="mt-4 text-2xl font-black tracking-tight">Net metering starts with your DISCOM.</h2>
            <p className="mt-4 leading-7 text-ink/70">We review the connection details and help you understand the relevant steps for:</p>
            <ul className="mt-5 space-y-3 text-sm font-semibold text-ink/75">
              {area.discoms.map((discom) => <li key={discom}>{discom}</li>)}
            </ul>
          </Card>
          <Card className="border border-ink/10">
            <p className="font-mono text-[11px] font-bold uppercase tracking-[.2em] text-teal">Areas nearby</p>
            <h2 className="mt-4 text-2xl font-black tracking-tight">Serving all of {area.name}.</h2>
            <p className="mt-4 leading-7 text-ink/70">We work across {area.districtLabel}, not only in the locations below. These are examples of areas we commonly serve and recognise.</p>
            <div className="mt-5 flex flex-wrap gap-2">
              {area.localities.map((locality) => (
                <span key={locality} className="inline-flex items-center gap-1.5 rounded-full border border-ink/10 bg-cream px-3 py-2 text-xs font-semibold text-ink/70">
                  <MapPin size={13} className="text-teal" aria-hidden="true" />
                  {locality}
                </span>
              ))}
              <span className="inline-flex items-center rounded-full border border-dashed border-ink/20 px-3 py-2 text-xs font-semibold text-ink/55">
                + more across {area.districtLabel}
              </span>
            </div>
          </Card>
        </div>
      </section>
      {area.projects.length > 0 && (
        <section className="bg-white py-12 sm:py-16">
          <div className="container-wide max-w-5xl">
            <p className="section-kicker">Local work</p>
            <h2 className="section-title">Projects in and around {area.name}.</h2>
            <div className="mt-7 grid gap-4 md:grid-cols-2">
              {area.projects.map((project) => (
                <Card key={project} className="border border-ink/10">
                  <p className="font-semibold leading-7 text-ink/75">{project}</p>
                </Card>
              ))}
            </div>
          </div>
        </section>
      )}
      <Footer />
    </main>
  );
}
