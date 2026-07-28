import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, Check, Phone, Sun } from "lucide-react";
import logo from "../companyinfo/caatlogo.webp";
import { Button, Card } from "./ui";
import { ScrollEffects } from "./scroll-effects";
import { ClientReferences } from "./client-references";
import SolarScene from "./solar-scene";
import { BrandMarquee } from "./brand-marquee";
import { SolarProcess } from "./solar-process";
import HowItWorks from "./how-it-works";
import SubsidyInfo from "./subsidy-info";
import FAQ from "./faq";
import FloatingWhatsApp from "./floating-whatsapp";
import { ProjectTimeline } from "./project-timeline";
import EquipmentBrands from "./equipment-brands";
import Footer from "./footer";

const company = { legalName: "CAAT PowerBot LLP", phone: "+91 9820897343", email: "caat.powerbot@gmail.com" };
const benefits = ["Rooftop systems designed for Delhi homes and businesses", "High-efficiency panels and inverters from trusted brands", "Professional installation and end-to-end EPC support", "Guidance with subsidy paperwork and system commissioning"];

export function Landing() {
  return <main><ScrollEffects />
    <nav className="landing-nav container-wide sticky top-0 z-50 flex items-center justify-between gap-6 border-b border-ink/10 bg-cream/95 py-5 backdrop-blur-md"><Link href="/" className="flex items-center gap-3" aria-label="CAAT PowerBot home"><Image src={logo} alt="CAAT PowerBot logo" width={48} height={48} className="h-11 w-11 object-contain" priority /><span className="text-lg font-black tracking-tight">CAAT PowerBot <span className="text-teal">LLP</span></span></Link><div className="hidden gap-7 text-sm font-semibold md:flex"><a href="#why">Why solar</a><a href="#references">Projects</a><a href="#process">Process</a><a href="#about">About</a><a href="#contact">Contact</a></div><Link href="/quote"><Button>Get instant estimate <ArrowUpRight className="ml-1 inline" size={16} /></Button></Link></nav>
    <section className="hero-flow grid-lines relative overflow-hidden"><div className="container-wide relative z-10 grid min-h-[600px] items-center gap-10 py-16 lg:grid-cols-[.85fr_1.15fr]"><div><p className="mb-5 inline-flex items-center gap-2 rounded-full border border-teal/20 bg-white/90 px-4 py-2 text-xs font-bold uppercase tracking-[.18em] text-teal"><Sun size={15} /> Delhi&apos;s clean energy partner</p><h1 className="max-w-3xl text-5xl font-black leading-[.98] tracking-[-.05em] md:text-7xl">Clean energy made <span className="text-teal">simple.</span></h1><p className="mt-7 max-w-xl text-lg leading-8 text-ink/65">See how much a rooftop solar system can save, find the right size for your property, and take the first step toward energy independence.</p><div className="mt-8 flex flex-wrap gap-3"><Link href="/quote"><Button>Calculate your savings <ArrowUpRight className="ml-1 inline" size={17} /></Button></Link><a href="tel:+919820897343"><Button variant="outline">Book a site visit</Button></a></div><div className="mt-8 flex items-center gap-3 text-sm font-semibold"><span className="grid h-9 w-9 place-items-center rounded-full bg-lime"><Sun size={17} className="text-teal" /></span> Rooftop solar for homes and businesses</div></div><div className="w-full"><SolarScene /><p className="mt-3 text-center font-mono text-[10px] font-bold tracking-[.16em] text-teal/60">DRAG THE TIMELINE · WATCH THE SUN CHARGE THE HOUSE</p></div></div></section>
    <BrandMarquee /><HowItWorks /><section id="why" className="container-wide py-24"><p className="font-bold uppercase tracking-[.18em] text-teal">Why CAAT PowerBot</p><h2 className="mt-3 max-w-2xl text-4xl font-black tracking-tight md:text-5xl">A trusted partner for a smarter energy decision.</h2><div className="mt-10 grid gap-4 md:grid-cols-4">{benefits.map((benefit, index) => <Card key={benefit} className={index === 1 ? "bg-lime" : ""}><div className="mb-12 text-3xl font-black">0{index + 1}</div><Check className="text-teal" /><h3 className="mt-4 font-bold">{benefit}</h3></Card>)}</div></section>
    <ProjectTimeline />
    <ClientReferences /><EquipmentBrands /><SubsidyInfo />
    <section id="about" className="container-wide grid gap-12 py-24 md:grid-cols-[.8fr_1.2fr] md:items-center"><div><Image src={logo} alt="CAAT PowerBot" width={260} height={260} className="mx-auto h-56 w-56 object-contain md:mx-0" /></div><div><p className="font-bold uppercase tracking-[.18em] text-teal">About us</p><h2 className="mt-3 text-4xl font-black tracking-tight">Power solutions built around your property.</h2><p className="mt-5 max-w-2xl leading-8 text-ink/65">CAAT PowerBot LLP helps homes and businesses in Delhi move toward reliable, cleaner energy. We design and install rooftop solar systems, support maintenance, and provide practical energy solutions from assessment through commissioning.</p></div></section><FAQ />
    <section id="contact" className="bg-lime py-16"><div className="container-wide flex flex-col justify-between gap-8 md:flex-row md:items-center"><div><h2 className="text-4xl font-black tracking-tight">Ready to see your number?</h2><p className="mt-2 text-ink/65">Start with a free, no-obligation solar estimate.</p><div className="mt-5 flex flex-col gap-2 text-sm"><a href="tel:+919820897343" className="flex items-center gap-2"><Phone size={16} /> {company.phone}</a><a href={`mailto:${company.email}`} className="flex items-center gap-2">{company.email}</a></div></div><Link href="/quote"><Button className="w-fit">Calculate my savings <ArrowUpRight className="ml-1 inline" size={17} /></Button></Link></div></section>    <Footer />
    <FloatingWhatsApp />\n  </main>;
}
