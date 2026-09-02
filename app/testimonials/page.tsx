import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { ProjectTestimonials } from "@/components/project-testimonials";
import { PublicPage } from "@/components/public-page";
import { buttonStyles } from "@/components/ui";

export const metadata: Metadata = {
  title: "Client Projects & Testimonials | CAAT PowerBot",
  description: "Explore nine CAAT PowerBot project references across Delhi NCR, including solar, storage, electrical and backup-power work.",
  alternates: { canonical: "/testimonials" },
};

export default function TestimonialsPage() {
  return (
    <PublicPage
    // eyebrow="Client projects & testimonials" title="Real systems. Real places. Real work." description="Nine references from our company profile, with customer-comment spaces ready for approved feedback."
    >
      <ProjectTestimonials />
      {/* <section className="bg-white py-16 text-center sm:py-20">
        <div className="container-wide">
          <p className="section-kicker">Your project</p>
          <h2 className="section-title mx-auto">See what your roof could support.</h2>
          <p className="section-copy mx-auto">Start with your electricity use for a practical first estimate, then discuss the details that are specific to your property.</p>
          <Link href="/quote" prefetch={false} className={buttonStyles("primary", "mt-8 gap-2 px-6")}>Get my solar estimate <ArrowUpRight size={17} /></Link>
        </div>
      </section> */}
    </PublicPage>
  );
}
