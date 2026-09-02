import type { Metadata } from "next";
import { ArrowUpRight, BellRing, MessageCircle, Sun } from "lucide-react";
import Footer from "@/components/footer";
import FloatingWhatsApp from "@/components/floating-whatsapp";
import { SiteHeader } from "@/components/site-header";
import { buttonStyles } from "@/components/ui";
import { defaultWhatsappMessage, site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Solar Savings Calculator Coming Soon | CAAT PowerBot",
  description: "CAAT PowerBot's bill-based rooftop solar savings calculator is coming soon. Speak with our team for an online consultation today.",
  alternates: { canonical: "/quote" },
};

export default function QuotePage() {
  return (
    <main className="grid-lines min-h-screen">
      <SiteHeader context="Solar estimate" />
      <section className="hero-flow relative overflow-hidden">
        <div className="container-wide grid min-h-[calc(100vh-6rem)] place-items-center py-16 sm:py-24">
          <div className="max-w-3xl text-center">
            <span className="mx-auto grid h-16 w-16 place-items-center rounded-3xl bg-lime text-teal shadow-soft sm:h-20 sm:w-20">
              <Sun size={36} aria-hidden="true" />
            </span>
            <p className="section-kicker mt-8">CAAT PowerBot</p>
            <h1 className="page-title mx-auto mt-5">
              Your solar savings calculator is coming soon.
            </h1>
            <p className="section-copy mx-auto mt-6 max-w-2xl">
              We&apos;re preparing a simpler way to turn your electricity use into a practical rooftop solar estimate. Until then, our team can help you take the next step.
            </p>
            <div className="mt-9 flex flex-col justify-center gap-3 sm:flex-row">
              <a href={site.whatsapp(defaultWhatsappMessage)} target="_blank" rel="noopener noreferrer" className={buttonStyles("primary", "gap-2 px-6")}>
                <MessageCircle size={17} /> Online consultation
              </a>
              <a href="/" className={buttonStyles("outline", "gap-2 px-6")}>
                Explore solar solutions <ArrowUpRight size={17} />
              </a>
            </div>
            <p className="mt-8 inline-flex items-center gap-2 text-sm font-semibold text-ink/55">
              <BellRing size={16} className="text-teal" /> Calculator launch updates available through WhatsApp.
            </p>
          </div>
        </div>
      </section>
      <Footer />
      <FloatingWhatsApp />
    </main>
  );
}
