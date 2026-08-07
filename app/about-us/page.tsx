import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight, CheckCircle2 } from "lucide-react";
import { PublicPage } from "@/components/public-page";
import { buttonStyles, Card } from "@/components/ui";

export const metadata: Metadata = {
  title: "About CAAT PowerBot | Solar in Delhi NCR",
  description: "Learn how CAAT PowerBot approaches rooftop solar planning, installation and support for homes and businesses in Delhi NCR.",
  alternates: { canonical: "/about-us" },
};

const principles = [
  ["Start with the property", "Every solar plan begins with electricity use, roof conditions and the goal behind the system."],
  ["Keep the process clear", "From the first estimate through installation and commissioning, the next step should be easy to understand."],
  ["Support the system after switch-on", "A solar installation is a long-term energy asset, so ongoing care and practical guidance matter."],
];

export default function AboutUsPage() {
  return (
    <PublicPage eyebrow="About CAAT PowerBot" title="Practical power solutions, built around your property." description="CAAT PowerBot LLP helps homes and businesses in Delhi NCR plan rooftop solar, navigate the installation process and keep their systems working well after commissioning.">
      <section className="bg-paper py-16 sm:py-24">
        <div className="container-wide grid gap-5 md:grid-cols-3">
          {principles.map(([title, body], index) => (
            <Card key={title} className="border border-ink/10 p-7 sm:p-8">
              <div className="grid h-10 w-10 place-items-center rounded-2xl bg-lime font-mono text-sm font-black text-teal">0{index + 1}</div>
              <h2 className="mt-6 text-2xl font-black tracking-tight">{title}</h2>
              <p className="mt-4 leading-7 text-ink/70">{body}</p>
            </Card>
          ))}
        </div>
      </section>
      <section className="bg-white py-16 sm:py-24">
        <div className="container-wide grid gap-10 lg:grid-cols-[1.1fr_.9fr] lg:items-center">
          <div>
            <p className="section-kicker">A considered starting point</p>
            <h2 className="section-title">A useful estimate before a detailed site review.</h2>
            <p className="section-copy">Share your electricity use and property details to get a practical first view of the system that may suit you. The final design is confirmed after the roof, electrical setup and project requirements are reviewed.</p>
          </div>
          <Card className="border border-ink/10 p-7 sm:p-8">
            <ul className="space-y-4">
              {["Bill-based sizing and savings estimate", "Guidance on on-grid, hybrid and backup options", "Installation, documentation and commissioning support"].map((item) => <li key={item} className="flex gap-3 text-sm leading-6 text-ink/75"><CheckCircle2 className="mt-0.5 shrink-0 text-teal" size={18} />{item}</li>)}
            </ul>
            <Link href="/quote" className={buttonStyles("primary", "mt-8 gap-2 px-6")}>Get my solar estimate <ArrowUpRight size={17} /></Link>
          </Card>
        </div>
      </section>
    </PublicPage>
  );
}
