import Link from "next/link";
import { ArrowUpRight, CheckCircle2, MessageCircle } from "lucide-react";
import Footer from "@/components/footer";
import { SiteHeader } from "@/components/site-header";
import { buttonStyles, Card } from "@/components/ui";
import { defaultWhatsappMessage, site } from "@/lib/site";

type SeoPageProps = {
  eyebrow: string;
  title: string;
  description: string;
  benefits: string[];
  sections: Array<{ title: string; body: string }>;
  faq?: Array<{ question: string; answer: string }>;
};

export function SeoPage({ eyebrow, title, description, benefits, sections, faq = [] }: SeoPageProps) {
  return (
    <main className="grid-lines min-h-screen">
      <SiteHeader fixed />
      <div className="landing-header-space" aria-hidden="true" />

      <section className="hero-flow border-b border-ink/10">
        <div className="container-wide grid gap-10 py-16 sm:py-24 lg:grid-cols-[1.25fr_.75fr] lg:items-center">
          <div>
            <p className="section-kicker">{eyebrow}</p>
            <h1 className="mt-5 max-w-4xl text-4xl font-black leading-[1.02] tracking-[-.05em] sm:text-6xl">{title}</h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-ink/70">{description}</p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link href="/quote" className={buttonStyles("primary", "gap-2 px-6")}>
                Get my solar estimate <ArrowUpRight size={17} />
              </Link>
              <a href={site.whatsapp(defaultWhatsappMessage)} target="_blank" rel="noopener noreferrer" className={buttonStyles("outline", "gap-2 px-6")}>
                <MessageCircle size={17} /> Free online consultation
              </a>
            </div>
          </div>
          <Card className="border border-ink/10 bg-white/85 p-7 sm:p-8">
            <p className="font-mono text-[11px] font-bold uppercase tracking-[.22em] text-teal">What CAAT helps with</p>
            <ul className="mt-6 space-y-4">
              {benefits.map((benefit) => <li key={benefit} className="flex gap-3 text-sm leading-6 text-ink/75"><CheckCircle2 className="mt-0.5 shrink-0 text-teal" size={18} />{benefit}</li>)}
            </ul>
          </Card>
        </div>
      </section>

      <section className="bg-paper py-16 sm:py-24">
        <div className="container-wide grid gap-5 md:grid-cols-2">
          {sections.map((section) => (
            <article key={section.title} className="rounded-3xl border border-ink/10 bg-white p-7 shadow-soft sm:p-8">
              <h2 className="text-2xl font-black tracking-tight">{section.title}</h2>
              <p className="mt-4 leading-7 text-ink/70">{section.body}</p>
            </article>
          ))}
        </div>
      </section>

      {faq.length > 0 && <section className="bg-white py-16 sm:py-24"><div className="container-wide max-w-5xl"><p className="section-kicker">Common questions</p><h2 className="section-title">Answers before you decide.</h2><div className="mt-10 divide-y divide-ink/10 rounded-3xl border border-ink/10">{faq.map((item) => <details key={item.question} className="group p-6"><summary className="cursor-pointer list-none pr-8 text-lg font-black tracking-tight marker:hidden">{item.question}</summary><p className="mt-4 max-w-3xl leading-7 text-ink/70">{item.answer}</p></details>)}</div></div></section>}

      <section className="bg-night py-16 text-white sm:py-20"><div className="container-wide text-center"><p className="font-mono text-[11px] uppercase tracking-[.25em] text-gold">Start with your usage</p><h2 className="mx-auto mt-4 max-w-3xl text-3xl font-black tracking-tight sm:text-5xl">Get a practical solar estimate for your property.</h2><Link href="/quote" className={buttonStyles("primary", "mt-8 gap-2 px-6")}>Calculate my savings <ArrowUpRight size={17} /></Link></div></section>
      <Footer />
    </main>
  );
}
