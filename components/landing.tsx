import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, Check, MessageCircle } from "lucide-react";
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

const benefits = [
  "Bill-based system sizing and savings estimate",
  "Residential, commercial and industrial rooftop systems",
  "Subsidy and net-metering support",
  "Installation, monitoring and maintenance",
];

const estimateIncludes = ["Recommended system size", "Subsidy and investment", "Monthly savings and payback"];

export function Landing() {
  return (
    <main className="grid-lines">
      <nav className="landing-nav container-wide z-50 flex items-center justify-between gap-3 bg-cream/95 py-3 backdrop-blur-md sm:gap-6 sm:py-4">
        <Link href="/" className="flex min-w-0 items-center gap-2.5" aria-label="CAAT PowerBot home">
          <Image src={logo} alt="CAAT PowerBot logo" width={48} height={48} className="h-9 w-9 shrink-0 object-contain sm:h-11 sm:w-11" priority />
          <span className="truncate text-sm font-black tracking-tight sm:text-lg">
            CAAT PowerBot <span className="hidden text-teal sm:inline">LLP</span>
          </span>
        </Link>
        <div className="hidden gap-7 text-sm font-semibold md:flex">
          <a href="#services">Solutions</a>
          <a href="#references">Projects</a>
          <a href="#process">Process</a>
          <a href="#faq">FAQ</a>
        </div>
        <Link href="/quote" className={buttonStyles("primary", "shrink-0 gap-1.5 px-4 sm:px-5")}>
          <span className="sm:hidden">Get estimate</span>
          <span className="hidden sm:inline">Get solar estimate</span>
          <ArrowUpRight size={16} />
        </Link>
      </nav>

      <section className="hero-flow relative overflow-hidden">
        <div className="container-wide relative z-10 grid min-h-[590px] items-center gap-10 py-14 lg:grid-cols-[.86fr_1.14fr] lg:py-16">
          <div>
            <p className="section-kicker">Delhi NCR rooftop solar</p>
            <h1 className="mt-6 max-w-2xl text-[2.65rem] font-black leading-[1.01] tracking-[-.05em] sm:text-5xl md:text-6xl">
              See what rooftop solar could <span className="text-teal">save you.</span>
            </h1>
            <p className="mt-6 max-w-xl text-base leading-7 text-ink/70 sm:text-lg sm:leading-8">
              Use your electricity bill to get a personalised estimate for system size, subsidy, investment and monthly savings.
            </p>
            <div className="mt-7 grid gap-2 text-sm font-semibold text-ink/75 sm:grid-cols-3">
              {estimateIncludes.map((item) => (
                <span key={item} className="flex items-center gap-2"><Check size={15} className="shrink-0 text-teal" /> {item}</span>
              ))}
            </div>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
              <Link href="/quote" className={buttonStyles("primary", "gap-2 px-6")}>
                Calculate my savings <ArrowUpRight size={17} />
              </Link>
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
          <div className="min-w-0">
            <SolarScene />
            <p className="mt-3 text-center font-mono text-[10px] font-bold tracking-[.16em] text-teal/60">DRAG THE TIMELINE · WATCH THE SUN CHARGE THE HOUSE</p>
          </div>
        </div>
      </section>

      <BrandMarquee />
      <SubsidyInfo />

      <section id="services" className="bg-paper py-20 sm:py-28">
        <div className="container-wide">
          <p className="section-kicker">Why CAAT PowerBot</p>
          <h2 className="section-title">One team for the estimate, installation and aftercare.</h2>
          <p className="section-copy">Start with the numbers that matter, then move forward with clear support across design, paperwork, installation and maintenance.</p>
          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {benefits.map((benefit, index) => (
              <Card key={benefit} className={`flex min-h-56 flex-col border border-ink/8 ${index === 0 ? "bg-lime" : ""}`}>
                <div className="text-sm font-black text-ink/45">0{index + 1}</div>
                <Check className="mt-auto text-teal" />
                <h3 className="mt-4 text-lg font-black leading-6">{benefit}</h3>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <ProjectTimeline />
      <ClientReferences />
      <LeadCta />
      <HowItWorks />

      <section id="about" className="bg-paper py-20 sm:py-28">
        <div className="container-wide grid gap-10 md:grid-cols-[.7fr_1.3fr] md:items-center">
          <div className="rounded-[2rem] border border-ink/10 bg-white p-8 shadow-soft">
            <Image src={logo} alt="CAAT PowerBot" width={260} height={260} className="mx-auto h-44 w-44 object-contain md:h-52 md:w-52" />
          </div>
          <div>
            <p className="section-kicker">About CAAT PowerBot</p>
            <h2 className="section-title">Practical power solutions built around your property.</h2>
            <p className="section-copy">CAAT PowerBot LLP helps homes and businesses in Delhi NCR design and install rooftop solar systems, maintain them, and navigate the steps from assessment through commissioning.</p>
            <Link href="/quote" className={buttonStyles("primary", "mt-7 gap-2 px-6")}>
              Start my estimate <ArrowUpRight size={17} />
            </Link>
          </div>
        </div>
      </section>

      <FAQ />
      <Footer />
      <FloatingWhatsApp />
    </main>
  );
}
