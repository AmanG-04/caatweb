import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight, Mail, MessageCircle } from "lucide-react";
import Footer from "@/components/footer";
import { SiteHeader } from "@/components/site-header";
import { buttonStyles, Card } from "@/components/ui";
import { defaultWhatsappMessage, site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Contact CAAT PowerBot | Solar in Delhi NCR",
  description: "Speak with CAAT PowerBot about rooftop solar, your bill-based estimate or an online consultation.",
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
        <div className="container-wide py-16 sm:py-24">
          <p className="section-kicker">Contact CAAT PowerBot</p>
          <h1 className="page-title mt-5 max-w-3xl">
            Let&apos;s talk about your rooftop solar plan.
          </h1>
          <p className="section-copy mt-6 max-w-2xl">
            Start with an online consultation or generate a bill-based solar estimate whenever you are ready.
          </p>
          <div className="mt-8">
            <Link href="/quote" className={buttonStyles("primary", "gap-2")}>
              Get my solar estimate
              <ArrowUpRight size={17} />
            </Link>
          </div>
        </div>
      </section>
      <section className="bg-paper py-16 sm:py-24">
        <div className="container-wide grid gap-5 md:grid-cols-2">
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
      </section>
      <Footer />
    </main>
  );
}
