import Image from "next/image";
import logo from "../companyinfo/caatlogo-512.webp";
import { Card } from "./ui";
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
import { SiteHeader } from "./site-header";
import { PowerbotBenefits } from "./powerbot-benefits";

export function Landing() {
  return (
    <main className="">
      <SiteHeader fixed />
      <div className="landing-header-space" aria-hidden="true" />

      <section className="hero-flow relative overflow-hidden">
        <div className="container-wide relative z-10 grid items-center gap-6 py-6 sm:gap-10 sm:py-8 lg:min-h-fit lg:gap-15 lg:grid-cols-[.86fr_1.14fr] lg:py-4 xl:min-h-fit">
          <div className="hero-copy">
            {/* <p className="section-kicker">Delhi NCR rooftop solar</p> */}
            <h1 className="hero-copy-title mt-0 max-w-2xl text-[2.25rem] font-black leading-[1.01] tracking-[-.05em] sm:text-5xl lg:text-5xl">
              Premium Solar Solutions.<br />
              <span className="hero-title-highlight">Built to Perform.</span>
            </h1>
            <p className="hero-copy-body mt-6 max-w-xl text-sm leading-7 text-ink/70 sm:mt-6 sm:text-base sm:leading-8">
              At CAAT PowerBot, we deliver high-performance solar solutions engineered for maximum efficiency, reliability, and long-term savings. Every project is executed with precision using quality components and industry best practices.
            </p>
          </div>
          <div className="hero-scene min-w-0">
            <SolarScene />
          </div>
        </div>
      </section>
      
      <div>
        <BrandMarquee />
      </div>

      <section id="services" className="bg-paper py-14 sm:py-18">
        <div className="container-wide">
          <div className="mx-auto max-w-3xl text-center">
            <p className="section-kicker">Why CAAT PowerBot</p>
            <h2 className="section-title mx-auto">One Trusted Partner. From Consultation to Lifetime Support</h2>
          </div>
          {/* <p className="section-copy">Start with the numbers that matter, then move forward with clear support across design, paperwork, installation and maintenance.</p> */}
          <PowerbotBenefits />
        </div>
      </section>
      <ProjectTimeline />
      <SubsidyInfo />
      <ClientReferences />
      <LeadCta />
      <HowItWorks />

      <section id="about" className="bg-paper py-14 sm:py-18">
        <div className="container-wide">
          <div className="text-center">
            <p className="section-kicker">About CAAT PowerBot</p>
          </div>
          <div className="mt-9 grid gap-6 md:gap-10 md:grid-cols-[.7fr_1.3fr] md:items-center">
            <div className="rounded-[2rem] border border-ink/10 bg-white p-8 shadow-soft">
              <Image src={logo} alt="CAAT PowerBot" width={260} height={260} className="mx-auto h-44 w-44 object-contain md:h-52 md:w-52" />
            </div>
            <div>
              <h2 className="section-title !mt-0">Electrical expertise built around reliable installations.</h2>
              <p className="section-copy">Founded in August 2020, CAAT PowerBot LLP is an electrical engineering, trading and contracting company delivering rooftop solar solutions from assessment and design through installation, commissioning and maintenance, alongside expertise in power generation, distribution, emergency power, and automation and control systems. Our experienced team serves residential, commercial, industrial and infrastructure projects, making every installation efficient, safe and reliable.</p>
            </div>
          </div>
        </div>
      </section>

      <FAQ />
      <Footer />
      <FloatingWhatsApp />
    </main>
  );
}
