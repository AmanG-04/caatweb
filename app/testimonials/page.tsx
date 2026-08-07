import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { ClientReferences } from "@/components/client-references";
import { PublicPage } from "@/components/public-page";
import { buttonStyles } from "@/components/ui";

export const metadata: Metadata = {
  title: "Client References | CAAT PowerBot",
  description: "Explore a selection of solar, storage and hybrid power systems delivered by CAAT PowerBot across Delhi NCR.",
  alternates: { canonical: "/testimonials" },
};

export default function TestimonialsPage() {
  return (
    <PublicPage eyebrow="Client references" title="Real systems. Real places. Real work." description="A selection of solar, storage and hybrid power projects delivered by CAAT PowerBot across Delhi NCR. We share references rather than invented review quotes.">
      <ClientReferences />
      <section className="bg-white py-16 text-center sm:py-20">
        <div className="container-wide">
          <p className="section-kicker">Your project</p>
          <h2 className="section-title mx-auto">See what your roof could support.</h2>
          <p className="section-copy mx-auto">Start with your electricity use for a practical first estimate, then discuss the details that are specific to your property.</p>
          <Link href="/quote" className={buttonStyles("primary", "mt-8 gap-2 px-6")}>Get my solar estimate <ArrowUpRight size={17} /></Link>
        </div>
      </section>
    </PublicPage>
  );
}
