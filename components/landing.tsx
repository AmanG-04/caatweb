import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, MessageCircle } from "lucide-react";
import logo from "../companyinfo/caatlogo.webp";
import { buttonStyles, Card } from "./ui";
import { ClientReferences } from "./client-references";
import SolarScene from "./solar-scene";
import { BrandMarquee } from "./brand-marquee";
import HowItWorks from "./how-it-works";
import SubsidyInfo from "./subsidy-info";
import FAQ from "./faq";
import FloatingWhatsApp from "./floating-whatsapp";
import { ProjectTimeline } from "./project-timeline";
import Footer from "./footer";
import LeadCta from "./lead-cta";
import { defaultWhatsappMessage, site } from "@/lib/site";
import { SiteHeader } from "./site-header";
import { PowerbotBenefits } from "./powerbot-benefits";

export function Landing() {
  return (
    <main className="">
      <SiteHeader fixed />
      <div className="h-10" aria-hidden="true" />

      <section className="hero-flow relative overflow-hidden">
        <div className="container-wide relative z-10 grid min-h-[590px] items-center gap-15 py-14 lg:grid-cols-[.86fr_1.14fr] lg:py-2">
          <div className="hero-copy">
            {/* <p className="section-kicker">Delhi NCR rooftop solar</p> */}
            <h1 className="hero-copy-title mt-6 max-w-2xl text-[2.65rem] font-black leading-[1.01] tracking-[-.05em] sm:text-5xl md:text-6xl">
              Access to green energy,<br />
              <span className="hero-title-highlight">made simple.</span>
            </h1>
            <p className="hero-copy-body mt-6 max-w-xl text-base leading-7 text-ink/70 sm:text-lg sm:leading-8">
              Take the next step towards energy independence with CAAT PowerBot. Install solar panels and harness the sun&apos;s energy for your home or business.
            </p>
            <div className="hero-copy-actions mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
              {/* <Link href="/quote" className={buttonStyles("primary", "gap-2 px-6")}>
                Calculate my savings <ArrowUpRight size={17} />
              </Link> */}
              <a
                href={site.whatsapp(defaultWhatsappMessage)}
                target="_blank"
                rel="noopener noreferrer"
                className={buttonStyles("outline", "gap-2 px-6")}
              >
                <MessageCircle size={17} /> Free online consultation
              </a>
            </div>
          </div>
          <div className="hero-scene min-w-0">
            <SolarScene />
            <p className="mt-3 text-center font-mono text-[10px] font-bold tracking-[.16em] text-teal/60">DRAG THE TIMELINE · WATCH THE SUN CHARGE THE HOUSE</p>
          </div>
        </div>
      </section>
      
      <div className="-mt-8 sm:-mt-12">
        <BrandMarquee />
      </div>

      <section id="services" className="bg-paper py-20 sm:py-18">
        <div className="container-wide">
          <p className="section-kicker">Why CAAT PowerBot</p>
          <h2 className="section-title">One team for the estimate, installation and aftercare.</h2>
          <p className="section-copy">Start with the numbers that matter, then move forward with clear support across design, paperwork, installation and maintenance.</p>
          <PowerbotBenefits />
        </div>
      </section>
      <SubsidyInfo />
      <ProjectTimeline />
      <ClientReferences />
      <LeadCta />
      <HowItWorks />

      <section id="about" className="bg-paper py-20 sm:py-18">
        <div className="container-wide grid gap-10 md:grid-cols-[.7fr_1.3fr] md:items-center">
          <div className="rounded-[2rem] border border-ink/10 bg-white p-8 shadow-soft">
            <Image src={logo} alt="CAAT PowerBot" width={260} height={260} className="mx-auto h-44 w-44 object-contain md:h-52 md:w-52" />
          </div>
          <div>
            <p className="section-kicker">About CAAT PowerBot</p>
            <h2 className="section-title">Practical power solutions built around your property.</h2>
            <p className="section-copy">CAAT PowerBot LLP helps homes and businesses in Delhi NCR design and install rooftop solar systems, maintain them, and navigate the steps from assessment through commissioning.</p>
            {/* <Link href="/quote" className={buttonStyles("primary", "mt-7 gap-2 px-6")}>
              Start my estimate <ArrowUpRight size={17} />
            </Link> */}
          </div>
        </div>
      </section>

      <FAQ />
      <Footer />
      <FloatingWhatsApp />
    </main>
  );
}
