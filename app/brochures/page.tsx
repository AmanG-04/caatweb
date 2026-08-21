import type { Metadata } from "next";
import { FileText, PanelsTopLeft } from "lucide-react";
import { PublicPage } from "@/components/public-page";

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

          <div className="mx-auto mt-12 max-w-4xl rounded-[2rem] border border-ink/10 bg-white p-7 text-center shadow-soft sm:p-10">
            <span className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-lime text-teal">
              <FileText size={27} aria-hidden="true" />
            </span>
            <h2 className="mt-6 text-2xl font-black tracking-tight">Documents are being verified.</h2>
            <p className="mx-auto mt-3 max-w-xl leading-7 text-ink/65">Manufacturer brochures, technical datasheets and product documents will be published here after the relevant equipment range and public source link are confirmed.</p>
            <div className="mx-auto mt-7 flex max-w-max items-center gap-2 rounded-full border border-ink/10 bg-cream px-4 py-2 text-xs font-bold text-ink/65">
              <PanelsTopLeft size={15} className="text-teal" aria-hidden="true" />
              Solar · Storage · EV · Generators
            </div>
          </div>
        </div>
      </section>
    </PublicPage>
  );
}
