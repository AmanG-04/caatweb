import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, Check, MapPin, Phone, Sun, Zap } from "lucide-react";
import logo from "../companyinfo/caatlogo.webp";
import { Button, Card } from "./ui";

const company = {
  legalName: "CAAT PowerBot LLP",
  phone: "+91 9820897343",
  email: "caat.powerbot@gmail.com",
  address: "20, Sreshtha Vihar, Delhi-110092, India",
};

const benefits = [
  "Rooftop systems designed for Delhi homes and businesses",
  "High-efficiency panels and inverters from trusted brands",
  "Professional installation and end-to-end EPC support",
  "Guidance with subsidy paperwork and system commissioning",
];

export function Landing() {
  return <main>
    <nav className="container-wide flex items-center justify-between gap-6 py-5">
      <Link href="/" className="flex items-center gap-3" aria-label="CAAT PowerBot home">
        <Image src={logo} alt="CAAT PowerBot logo" width={48} height={48} className="h-11 w-11 object-contain" priority />
        <span className="text-lg font-black tracking-tight">CAAT PowerBot <span className="text-teal">LLP</span></span>
      </Link>
      <div className="hidden gap-7 text-sm font-semibold md:flex"><a href="#why">Why solar</a><a href="#process">Process</a><a href="#about">About</a><a href="#contact">Contact</a></div>
      <Link href="/quote"><Button>Get instant quote <ArrowUpRight className="ml-1 inline" size={16} /></Button></Link>
    </nav>

    <section className="grid-lines overflow-hidden"><div className="container-wide grid min-h-[600px] items-center gap-10 py-16 lg:grid-cols-[1.05fr_.95fr]">
      <div><p className="mb-5 inline-flex items-center gap-2 rounded-full border border-teal/20 bg-white px-4 py-2 text-xs font-bold uppercase tracking-[.18em] text-teal"><Sun size={15} /> Delhi&apos;s clean energy partner</p>
        <h1 className="max-w-3xl text-5xl font-black leading-[.98] tracking-[-.05em] md:text-7xl">Clean energy made <span className="text-teal">simple.</span></h1>
        <p className="mt-7 max-w-xl text-lg leading-8 text-ink/65">See how much a rooftop solar system can save, find the right size for your property, and take the first step toward energy independence.</p>
        <div className="mt-8 flex flex-wrap gap-3"><Link href="/quote"><Button>Calculate your savings <ArrowUpRight className="ml-1 inline" size={17} /></Button></Link><a href="tel:+919820897343"><Button variant="outline">Book a site visit</Button></a></div>
        <div className="mt-8 flex items-center gap-3 text-sm font-semibold"><span className="grid h-9 w-9 place-items-center rounded-full bg-lime"><Sun size={17} className="text-teal" /></span> Rooftop solar for homes and businesses</div>
      </div>
      <div className="relative"><div className="absolute -right-20 -top-10 h-72 w-72 rounded-full bg-lime/60 blur-3xl" /><Card className="relative rotate-2 border border-ink/5 bg-ink text-cream"><div className="flex items-center justify-between"><span className="text-sm text-cream/60">Your solar snapshot</span><Zap className="text-lime" /></div><div className="mt-12 text-5xl font-black">₹ savings<span className="text-xl text-cream/50"> / month</span></div><p className="mt-2 text-cream/60">Estimate your potential with our two-minute quote</p><div className="mt-12 h-32 rounded-2xl bg-gradient-to-t from-teal/50 to-lime/60 p-4"><div className="flex h-full items-end gap-2">{[30, 42, 55, 48, 70, 82, 95].map((height, index) => <div key={index} className="flex-1 rounded-t bg-lime/80" style={{ height: `${height}%` }} />)}</div></div><div className="mt-6 grid grid-cols-2 gap-3 text-sm"><div className="rounded-2xl bg-white/10 p-4"><b>Right-sized</b><br /><span className="text-cream/50">For your roof</span></div><div className="rounded-2xl bg-white/10 p-4"><b>25 years</b><br /><span className="text-cream/50">Panel performance</span></div></div></Card></div>
    </div></section>

    <section id="why" className="container-wide py-24"><p className="font-bold uppercase tracking-[.18em] text-teal">Why CAAT PowerBot</p><h2 className="mt-3 max-w-2xl text-4xl font-black tracking-tight md:text-5xl">A trusted partner for a smarter energy decision.</h2><div className="mt-10 grid gap-4 md:grid-cols-4">{benefits.map((benefit, index) => <Card key={benefit} className={index === 1 ? "bg-lime" : ""}><div className="mb-12 text-3xl font-black">0{index + 1}</div><Check className="text-teal" /><h3 className="mt-4 font-bold">{benefit}</h3></Card>)}</div></section>

    <section id="process" className="bg-ink py-24 text-cream"><div className="container-wide"><p className="font-bold uppercase tracking-[.18em] text-lime">Our solar process</p><div className="mt-8 grid gap-10 md:grid-cols-3">{[["01", "Tell us about your property", "Share your bill, roof type, and location in a two-minute form."], ["02", "Get your solar estimate", "See a right-sized system recommendation, savings, subsidy estimate, and payback."], ["03", "Plan your installation", "Book a free site visit and let our team validate the final design." ]].map(([number, title, description]) => <div key={number} className="border-t border-white/20 pt-5"><span className="text-lime">{number}</span><h3 className="mt-10 text-2xl font-black">{title}</h3><p className="mt-3 text-cream/60">{description}</p></div>)}</div></div></section>

    <section id="about" className="container-wide grid gap-12 py-24 md:grid-cols-[.8fr_1.2fr] md:items-center"><div><Image src={logo} alt="CAAT PowerBot" width={260} height={260} className="mx-auto h-56 w-56 object-contain md:mx-0" /></div><div><p className="font-bold uppercase tracking-[.18em] text-teal">About us</p><h2 className="mt-3 text-4xl font-black tracking-tight">Power solutions built around your property.</h2><p className="mt-5 max-w-2xl leading-8 text-ink/65">CAAT PowerBot LLP helps homes and businesses in Delhi move toward reliable, cleaner energy. We design and install rooftop solar systems, support maintenance, and provide practical energy solutions from assessment through commissioning.</p></div></section>

    <section id="faq" className="container-wide py-8 pb-24"><p className="font-bold uppercase tracking-[.18em] text-teal">FAQ</p><div className="mt-8 grid gap-4 md:grid-cols-2">{["How accurate is my solar estimate?", "What happens after I submit?", "Can you help with subsidy paperwork?", "Do you provide maintenance support?"].map(question => <Card key={question}><h3 className="font-bold">{question}</h3><p className="mt-3 text-sm leading-6 text-ink/60">We use the details you share to create an initial estimate. A free site survey validates the final system design, pricing, eligibility, and installation plan.</p></Card>)}</div></section>

    <section id="contact" className="bg-lime py-16"><div className="container-wide flex flex-col justify-between gap-8 md:flex-row md:items-center"><div><h2 className="text-4xl font-black tracking-tight">Ready to see your number?</h2><p className="mt-2 text-ink/65">Start with a free, no-obligation solar estimate.</p><div className="mt-5 flex flex-col gap-2 text-sm"><a href="tel:+919820897343" className="flex items-center gap-2"><Phone size={16} /> {company.phone}</a><a href={`mailto:${company.email}`} className="flex items-center gap-2">{company.email}</a><span className="flex items-center gap-2"><MapPin size={16} /> {company.address}</span></div></div><Link href="/quote"><Button className="w-fit">Calculate my savings <ArrowUpRight className="ml-1 inline" size={17} /></Button></Link></div></section>

    <footer className="container-wide flex flex-col justify-between gap-4 py-8 text-sm text-ink/60 md:flex-row"><span className="font-black text-ink">{company.legalName}</span><span>Rooftop solar, made more human. © 2026</span></footer>
  </main>;
}
