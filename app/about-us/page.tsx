import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowDownRight,
  ArrowUpRight,
  BatteryCharging,
  Building2,
  CheckCircle2,
  MapPin,
  PanelsTopLeft,
  Sun,
  Wrench,
  Zap,
} from "lucide-react";
import Footer from "@/components/footer";
import { SiteHeader } from "@/components/site-header";
import { buttonStyles, Card } from "@/components/ui";
import { defaultWhatsappMessage, site } from "@/lib/site";

export const metadata: Metadata = {
  title: "About CAAT PowerBot | Electrical & Solar Engineering in Delhi NCR",
  description: "Learn about us: an electrical engineering, trading and contracting company founded in 2020 and serving projects across Delhi NCR.",
  alternates: { canonical: "/about-us" },
};

const principles = [
  ["Right-sized solutions", "We start with the property, application and operating need before we recommend equipment or scope."],
  ["Transparent advice", "We keep options, materials, timelines and the decisions affecting an installation easy to understand."],
  ["Quality installation", "We work with reputed brands, premium materials and robust engineering practices."],
  ["Long-term support", "We plan for service, maintenance and dependable performance after commissioning."],
];

const expertise = [
  { icon: Sun, title: "Solar EPC", body: "Assessment, design, installation, commissioning and support." },
  { icon: PanelsTopLeft, title: "Rooftop solar", body: "For residential, institutional and commercial properties." },
  { icon: Zap, title: "Energy audits & net metering", body: "Guidance around energy use, system planning and connection steps." },
  { icon: Wrench, title: "AMC & maintenance", body: "Ongoing care to help systems stay dependable over time." },
  { icon: Building2, title: "EV charging", body: "Electrical infrastructure for the next layer of energy use." },
  { icon: BatteryCharging, title: "Backup power", body: "Battery energy storage, UPS and generator-related solutions." },
];

const certificates = [
  { title: "LLP incorporation", image: "/about/llp-incorporation-certificate.png", alt: "CAAT PowerBot LLP certificate of incorporation from the Government of India" },
  { title: "GST registration", image: "/about/gst-registration-certificate.jpeg", alt: "CAAT PowerBot LLP GST registration certificate" },
  { title: "Udyam registration", image: "/about/udyam-registration-certificate.png", alt: "CAAT PowerBot LLP Udyam registration certificate" },
  { title: "Photovoltaic technology", image: "/about/photovoltaic-technology-certificate.png", alt: "Tushar Gupta advanced certificate in photovoltaic technology and business management" },
];

// const locations = ["Delhi", "Gurgaon", "Noida", "Greater Noida"];

function ServiceFootprintMap() {
  return (
    <div className="relative isolate overflow-hidden rounded-[2rem] border border-teal/20 bg-night p-5 shadow-[0_28px_70px_rgba(16,42,42,.18)] sm:p-8">
      <div className="absolute inset-0 opacity-30" aria-hidden="true" style={{ backgroundImage: "linear-gradient(rgba(216,243,106,.18) 1px, transparent 1px), linear-gradient(90deg, rgba(216,243,106,.18) 1px, transparent 1px)", backgroundSize: "36px 36px" }} />
      <div className="relative flex items-center justify-between gap-5">
        <div>
          <p className="font-mono text-[10px] font-bold uppercase tracking-[.26em] text-gold">Our core presence</p>
          <p className="mt-2 text-xl font-black tracking-tight text-white">Delhi NCR</p>
        </div>
        <span className="rounded-full border border-gold/25 bg-gold/10 px-3 py-1.5 font-mono text-[10px] font-bold uppercase tracking-[.16em] text-gold">India</span>
      </div>
      <div className="relative mx-auto mt-2 aspect-[.879] max-w-[28rem]">
        <img
          src="https://cdn.jsdelivr.net/npm/@svg-maps/india@2.0.0/india.svg"
          alt="Map of India, with Delhi NCR marked as CAAT PowerBot's core presence"
          className="h-full w-full object-contain opacity-95 [filter:invert(79%)_sepia(31%)_saturate(691%)_hue-rotate(41deg)_brightness(104%)_contrast(91%)]"
        />
        <div className="absolute left-[30.7%] top-[29.7%] -translate-x-1/2 -translate-y-1/2" aria-hidden="true">
          <span className="absolute inset-[-.95rem] rounded-full border border-gold/70 animate-ping" />
          <span className="relative block h-6 w-6 rounded-full border-[3px] border-night bg-gold shadow-[0_0_0_5px_rgba(216,243,106,.18)]" />
        </div>
        {/* <div className="absolute left-[34%] top-[26.5%] rounded-xl border border-white/15 bg-night/90 px-3 py-2 shadow-lg backdrop-blur-sm">
          <p className="font-mono text-[9px] font-bold uppercase tracking-[.16em] text-gold">Delhi NCR</p>
          <p className="mt-0.5 text-[11px] font-semibold text-white/75">Core presence</p>
        </div> */}
      </div>
      <div className="relative mt-2 flex flex-wrap justify-center gap-2 border-t border-white/10 pt-5">
        {/* {locations.map((location) => <span key={location} className="inline-flex items-center gap-1.5 rounded-full bg-white/8 px-3 py-1.5 text-xs font-semibold text-white/70"><MapPin size={12} className="text-gold" aria-hidden="true" />{location}</span>)} */}
      </div>
      <p className="relative mt-5 text-center text-[10px] leading-5 text-white/40">Map outline: <a href="https://mapsvg.com/maps/india" target="_blank" rel="noopener noreferrer" className="underline decoration-white/25 underline-offset-2 transition-colors hover:text-gold">MapSVG via svg-maps</a> (CC BY 4.0).</p>
    </div>
  );
}

export default function AboutUsPage() {
  return (
    <main className="min-h-screen bg-paper">
      <SiteHeader fixed />
      <div className="landing-header-space" aria-hidden="true" />

      <section className="relative isolate overflow-hidden bg-cream" aria-labelledby="about-title">
        <div className="about-hero-grid" aria-hidden="true" />
        <div className="container-wide sm: lg:">
          {/* <p className="section-kicker mx-auto !flex w-max justify-center">About CAAT PowerBot</p> */}
          <div className="mt-12 grid gap-12 lg:grid-cols-[1.12fr_.88fr] lg:items-end">
          <div className="max-w-4xl">
            {/* <p className="mt-7 font-mono text-[11px] font-bold uppercase tracking-[.26em] text-teal">Electrical engineering &middot; Solar &middot; Delhi NCR</p> */}
            <h1 id="about-title" className="mt-5 text-5xl font-black leading-[.94] tracking-[-.065em] text-ink sm:text-6xl lg:text-7xl">Power systems designed with care, built to keep working.</h1>
            <p className="mt-7 max-w-2xl text-lg leading-8 text-ink/70">We are an electrical engineering, trading and contracting company founded in August 2020. We bring practical engineering, experienced people and long-term responsibility to every system we work on.</p>
            {/* <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <a href="#our-story" className={buttonStyles("primary", "gap-2 px-6")}>Our story <ArrowDownRight size={17} /></a>
              <a href={site.whatsapp(defaultWhatsappMessage)} target="_blank" rel="noopener noreferrer" className={buttonStyles("outline", "gap-2 bg-white/70 px-6")}>Start a conversation <ArrowUpRight size={17} /></a>
            </div> */}
          </div>
          <div className="grid grid-cols-2 gap-3 self-stretch sm:gap-4">
            <div className="col-span-2 mx-auto flex aspect-square w-full max-w-56 flex-col items-center justify-center rounded-full bg-night p-7 text-center text-white shadow-[0_22px_50px_rgba(16,42,42,.18)] sm:max-w-60 sm:p-8">
              <p className="font-mono text-[10px] font-bold uppercase tracking-[.24em] text-gold">Our purpose</p>
              <p className="mt-4 max-w-[12rem] text-xl font-black leading-tight tracking-[-.035em] sm:text-2xl">Make every installation efficient, safe and reliable.</p>
            </div>
            <div className="mx-auto flex aspect-square w-full max-w-40 flex-col items-center justify-center rounded-full border border-ink/10 bg-white/80 p-5 text-center backdrop-blur-sm sm:p-6">
              <p className="font-mono text-[10px] font-bold uppercase tracking-[.18em] text-teal">Established</p>
              <p className="mt-3 text-3xl font-black tracking-[-.05em]">2020</p>
            </div>
            <div className="mx-auto flex aspect-square w-full max-w-40 flex-col items-center justify-center rounded-full border border-lime bg-lime p-5 text-center sm:p-6">
              <p className="font-mono text-[10px] font-bold uppercase tracking-[.18em] text-teal">Core area</p>
              <p className="mt-3 text-xl font-black leading-tight tracking-[-.04em]">Delhi NCR</p>
            </div>
          </div>
          </div>
        </div>
      </section>

      <section id="our-story" className="about-story-section relative isolate overflow-hidden bg-paper py-16 sm:py-24" aria-labelledby="story-title">
        <div className="about-grid-continuation" aria-hidden="true" />
        <div className="container-wide">
          <p className="section-kicker mx-auto !flex w-max justify-center">Our story</p>
          <div className="mt-12 grid gap-10 lg:grid-cols-[.76fr_1.24fr] lg:gap-16">
          <div className="lg:sticky lg:top-32 lg:self-start">
            <h2 id="story-title" className="section-title !mt-5">A power company that keeps learning.</h2>
          </div>
          <div className="border-l border-ink/15 pl-6 sm:pl-7">
            <div className="relative pb-9"><span className="absolute -left-[2.36rem] top grid h-7 w-7 place-items-center rounded-full bg-lime text-xs font-black text-teal sm:-left-[2.68rem]">01</span><p className="font-mono text-[10px] font-bold uppercase tracking-[.3em] text-teal">August 2020</p><h3 className="mt-3 text-2xl font-black tracking-tight">We began with an electrical-systems foundation.</h3><p className="mt-4 max-w-2xl leading-8 text-ink/70">We started as an electrical engineering, trading and contracting company, building on experience across power generation, distribution, emergency power, and automation and control systems.</p></div>
            <div className="relative pb-10"><span className="absolute -left-[2.36rem] top grid h-7 w-7 place-items-center rounded-full border border-ink/15 bg-white text-xs font-black text-teal sm:-left-[2.68rem]">02</span><p className="font-mono text-[10px] font-bold uppercase tracking-[.3em] text-teal">Today</p><h3 className="mt-3 text-2xl font-black tracking-tight">We focus on rooftop solar and battery energy storage.</h3><p className="mt-4 max-w-2xl leading-8 text-ink/70">Our work serves residential, institutional and commercial clients across Delhi NCR, with an approach rooted in practical design, robust engineering and long-term support.</p></div>
            <div className="relative"><span className="absolute -left-[2.36rem] top-1 grid h-7 w-7 place-items-center rounded-full bg-teal text-xs font-black text-white sm:-left-[2.68rem]">03</span><p className="font-mono text-[10px] font-bold uppercase tracking-[.2em] text-teal">What stays constant</p><h3 className="mt-3 text-2xl font-black tracking-tight">We keep solutions useful, clear and dependable.</h3><p className="mt-4 max-w-2xl leading-8 text-ink/70">We keep learning, add new offerings when they genuinely help, and work to make each installation efficient, safe and reliable.</p></div>
          </div>
          </div>
        </div>
      </section>

      <section className="bg-night py-16 text-white sm:py-24" aria-labelledby="values-title">
        <div className="container-wide">
          <div className="mx-auto max-w-3xl text-center"><p className="section-kicker section-kicker-dark mx-auto !flex w-max justify-center">What we stand for</p><h2 id="values-title" className="mx-auto mt-5 text-4xl font-black leading-[1.02] tracking-[-.055em] sm:text-5xl">Good engineering should feel clear, considered and dependable.</h2></div>
          <div className="mt-10 grid divide-y divide-white/10 border-y border-white/10 sm:grid-cols-2 sm:divide-x sm:divide-y-0 lg:grid-cols-4">
            {principles.map(([title, body], index) => <div key={title} className="p-6 first:pl-0 sm:px-6 sm:first:pl-0 lg:min-h-64 lg:px-7"><p className="font-mono text-xs font-bold tracking-[.2em] text-gold">0{index + 1}</p><h3 className="mt-8 text-xl font-black tracking-tight">{title}</h3><p className="mt-4 text-sm leading-7 text-white/60">{body}</p></div>)}
          </div>
        </div>
      </section>

      <section className="bg-white py-16 sm:py-24" aria-labelledby="people-title">
        <div className="container-wide">
          <p className="section-kicker mx-auto !flex w-max justify-center">People</p>
          <div className="mt-12 grid gap-10 lg:grid-cols-[.85fr_1.15fr] lg:items-center">
          <div className="relative mx-auto w-full max-w-md">
            <div className="absolute -inset-4 -z-10 rotate-3 rounded-[2rem] bg-lime/60" aria-hidden="true" />
            <Card className="overflow-hidden border border-ink/10 p-3 shadow-[0_22px_50px_rgba(16,42,42,.12)] sm:p-4"><div className="relative aspect-[1.02] overflow-hidden rounded-[1.4rem] bg-cream"><Image src="/about/tushar-gupta.jpeg" alt="Tushar Gupta, founder of CAAT PowerBot LLP" fill sizes="(max-width: 1024px) 100vw, 34vw" className="object-cover" /></div></Card>
            <div className="absolute -bottom-5 -right-3 rounded-2xl bg-night px-5 py-4 text-white shadow-xl"><p className="font-mono text-[9px] font-bold uppercase tracking-[.2em] text-gold">Founder</p><p className="mt-1 font-black">Tushar Gupta</p></div>
          </div>
          <div className="max-w-2xl"><h2 id="people-title" className="section-title !mt-0">Experience at the centre of every decision.</h2><p className="mt-6 text-lg leading-8 text-ink/75">Our founder, Tushar Gupta, is an Electrical Engineer with postgraduate study in Sales, Marketing and IT management. He brings more than 30 years of experience in the power sector across India and international markets.</p><p className="mt-5 leading-8 text-ink/70">His experience includes work with Kirloskar Oil Engines, Wartsila (Finland), Jakson and HCL. He believes in customer-focused, environmentally friendly, safe and reliable technology solutions.</p><div className="mt-7 flex flex-wrap gap-2">{["Electrical engineering", "30+ years in power", "India & international markets"].map((item) => <span key={item} className="rounded-full border border-ink/15 bg-cream px-3 py-2 text-xs font-bold text-ink/65">{item}</span>)}</div></div>
          </div>
        </div>
      </section>

      <section className="bg-paper py-16 sm:py-24" aria-labelledby="expertise-title">
        <div className="container-wide"><p className="section-kicker mx-auto !flex w-max justify-center">Expertise</p><div className="mt-12 flex flex-col justify-between gap-6 lg:flex-row lg:items-end"><div className="max-w-2xl"><h2 id="expertise-title" className="section-title !mt-0">A broader electrical view of the property.</h2></div><p className="max-w-md text-base leading-8 text-ink/65">We can combine generation, distribution, backup, automation and energy management around the way a property actually operates.</p></div>
          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{expertise.map(({ icon: Icon, title, body }) => <Card key={title} className="group border border-ink/10 p-6 transition-all duration-300 hover:-translate-y-1 hover:border-teal/40 hover:shadow-[0_22px_50px_rgba(16,42,42,.12)]"><div className="flex items-start justify-between gap-4"><div className="grid h-12 w-12 place-items-center rounded-2xl bg-lime text-teal"><Icon size={22} aria-hidden="true" /></div><ArrowUpRight size={19} className="text-ink/25 transition-all group-hover:-translate-y-1 group-hover:translate-x-1 group-hover:text-teal" aria-hidden="true" /></div><h3 className="mt-6 text-xl font-black tracking-tight">{title}</h3><p className="mt-3 text-sm leading-7 text-ink/70">{body}</p></Card>)}</div>
        </div>
      </section>

      <section className="bg-white py-16 sm:py-24" aria-labelledby="credentials-title">
        <div className="container-wide"><p className="section-kicker mx-auto !flex w-max justify-center">Credentials</p>
          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">{certificates.map(({ title, image, alt }) => <Card key={title} className="group overflow-hidden border border-ink/10 p-3 transition-transform duration-300 hover:-translate-y-1"><div className="relative aspect-[.78] overflow-hidden rounded-2xl bg-cream"><Image src={image} alt={alt} fill sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw" className="object-contain p-2 transition-transform duration-500 group-hover:scale-105" /></div><p className="px-2 pb-1 pt-4 text-sm font-black tracking-tight">{title}</p></Card>)}</div>
        </div>
      </section>

      <section className="bg-paper py-16 sm:py-24" aria-labelledby="work-title">
        <div className="container-wide"><p className="section-kicker mx-auto !flex w-max justify-center">Where we work</p><div className="mt-12 grid gap-10 lg:grid-cols-[.8fr_1.2fr] lg:items"><div><h2 id="work-title" className="section-title !mt-0">Rooted in the Nations Heart.</h2><p className="section-copy">We started in Delhi and grew with the momentum of the region. Today, our work reaches across Delhi, Gurgaon, Noida and Greater Noida, helping homes, institutions and businesses power up with rooftop solar and battery solutions.</p><p className="mt-6 border-l-2 border-lime pl-4 text-sm leading-7 text-ink/60">As demand grows, so does our radius—guided by the projects that matter and the people we serve.</p></div><ServiceFootprintMap /></div>
        {/* <p className="container-wide mt-8 border-t border-ink/10 pt-6 text-sm leading-7 text-ink/55">Wider references: Bangalore &middot; Hyderabad &middot; Kolkata &middot; Bihar &middot; Himachal Pradesh</p> */}
        </div>
      </section>

      <section className="bg-night px-5 py-16 text-center text-white sm:px-8 sm:py-20" aria-labelledby="about-cta-title"><div className="mx-auto max-w-2xl"><p className="section-kicker section-kicker-dark mx-auto !flex w-max justify-center">Start a conversation</p><h2 id="about-cta-title" className="mt-5 text-3xl font-black leading-tight tracking-[-.035em] sm:text-4xl">Have a project that needs a considered electrical solution?</h2><p className="mx-auto mt-4 max-w-xl leading-7 text-white/70">Tell us what you are planning. We will begin with the property, the application and the outcome you need.</p><div className="mx-auto mt-8 flex max-w-max flex-col gap-3 sm:flex-row"><a href={site.whatsapp(defaultWhatsappMessage)} target="_blank" rel="noopener noreferrer" className={buttonStyles("outline", "gap-2 border-white/25 bg-white/10 text-white hover:bg-white/15")}>WhatsApp consultation <ArrowUpRight size={17} /></a></div></div></section>
      <Footer />
    </main>
  );
}
