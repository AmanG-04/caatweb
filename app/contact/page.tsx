import type { Metadata } from "next";
import { ExternalLink, FileText, Mail, MessageCircle } from "lucide-react";
import Footer from "@/components/footer";
import { SiteHeader } from "@/components/site-header";
import { Card } from "@/components/ui";
import { defaultWhatsappMessage, site } from "@/lib/site";
import FloatingWhatsApp from "@/components/floating-whatsapp";

export const metadata: Metadata = {
  title: "Contact CAAT PowerBot | Solar in Delhi NCR",
  description: "Contact CAAT PowerBot about rooftop solar, water heating, battery storage, EV charging, generators, electrical work and maintenance in Delhi NCR.",
  alternates: { canonical: "/contact" },
};

const contacts = [
  { icon: MessageCircle, label: "WhatsApp", value: "Online consultation", href: site.whatsapp(defaultWhatsappMessage), external: true },
  { icon: Mail, label: "Email", value: site.email, href: `mailto:${site.email}` },
];

export default function ContactPage() {
  return (
    <main className="grid-lines min-h-screen">
      <SiteHeader fixed />
      <div className="landing-header-space" aria-hidden="true" />
      <section className="hero-flow">
        <div className="container-wide py-16 sm:py-14">
          <div className="text-center">
            <h1 className="hero-title-highlight inline-block px-2 pb-1 text-2xl font-black leading-[1.15] tracking-[-.05em] sm:text-5xl">Contact</h1>
          </div>
        </div>
      </section>
      <section className="bg-paper py-12 sm:py-16">
        <div className="container-wide max-w-4xl">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="text-2xl font-black tracking-tight text-ink sm:text-3xl">Talk to an energy solutions team</h2>
            <p className="mt-4 leading-7 text-ink/70">
              CAAT PowerBot helps homes, businesses and institutions plan practical power systems in Delhi NCR. We can discuss rooftop solar, solar water heating, battery energy storage, EV charging, generators, electrical work and maintenance support.
            </p>
            <p className="mt-4 leading-7 text-ink/70">
              Our technical documentation library includes product information from Vikram Solar, Adani, K Solare, Deye hybrid and Sungrow. These documents help compare equipment capabilities before a system is designed around the property, electrical load and operating requirement.
            </p>
          </div>
          <div className="mt-10 grid gap-5 sm:grid-cols-2">
            {contacts.map(({ icon: Icon, label, value, href, external }) => (
              <Card key={label} className="border border-ink/10">
                <Icon className="text-teal" size={24} />
                <p className="mt-5 font-mono text-[11px] font-bold uppercase tracking-[.2em] text-ink/50">
                  {label}
                </p>
                <a
                  href={href}
                  target={external ? "_blank" : undefined}
                  rel={external ? "noopener noreferrer" : undefined}
                  className="mt-3 block break-words text-lg font-black tracking-tight hover:text-teal"
                >
                  {value}
                </a>
              </Card>
            ))}
          </div>
          <a
            href="https://drive.google.com/drive/folders/1VDJCP4I6PV7MJlPkpE64gLiy23yVDRCF?usp=sharing"
            target="_blank"
            rel="noopener noreferrer"
            className="mt-5 flex items-center justify-between gap-4 rounded-3xl border border-ink/10 bg-white p-6 shadow-soft transition hover:border-teal/40 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-teal"
          >
            <span className="flex items-center gap-4">
              <span className="grid h-11 w-11 place-items-center rounded-xl bg-lime text-teal"><FileText size={21} aria-hidden="true" /></span>
              <span>
                <span className="block text-lg font-black tracking-tight">Technical documentation</span>
                <span className="mt-1 block text-sm leading-6 text-ink/60">Vikram Solar, Adani, K Solare, Deye hybrid and Sungrow product documents</span>
              </span>
            </span>
            <ExternalLink className="shrink-0 text-teal" size={18} aria-hidden="true" />
          </a>
        </div>
      </section>
      <Footer />
      <FloatingWhatsApp />
    </main>
  );
}
