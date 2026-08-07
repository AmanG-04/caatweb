import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight, BatteryCharging, Building2, Sun, Wrench } from "lucide-react";
import { PublicPage } from "@/components/public-page";
import { buttonStyles, Card } from "@/components/ui";

export const metadata: Metadata = {
  title: "Solar Solutions | CAAT PowerBot",
  description: "Explore rooftop solar, hybrid power, battery backup and support services from CAAT PowerBot in Delhi NCR.",
  alternates: { canonical: "/solutions" },
};

const solutions = [
  { icon: Sun, title: "Rooftop solar", body: "Solar planning for homes and properties where daytime energy use and available roof space can work together." },
  { icon: Building2, title: "Commercial & institutional solar", body: "A considered starting point for businesses, housing societies and institutions with larger or shared energy needs." },
  { icon: BatteryCharging, title: "Hybrid power & battery backup", body: "Options for properties that need a solar plan alongside backup power for essential loads." },
  { icon: Wrench, title: "Maintenance & energy support", body: "Ongoing support, monitoring discussions and practical energy solutions after installation." },
];

export default function SolutionsPage() {
  return (
    <PublicPage eyebrow="Solar solutions" title="The right solar system starts with how you use power." description="Every property has a different roof, electricity pattern and goal. Explore the areas CAAT PowerBot can help you assess before the final system is designed.">
      <section className="bg-paper py-16 sm:py-24">
        <div className="container-wide grid gap-5 md:grid-cols-2">
          {solutions.map(({ icon: Icon, title, body }) => (
            <Card key={title} className="border border-ink/10 p-7 sm:p-8">
              <div className="grid h-12 w-12 place-items-center rounded-2xl bg-lime text-teal"><Icon size={23} /></div>
              <h2 className="mt-6 text-2xl font-black tracking-tight">{title}</h2>
              <p className="mt-4 max-w-lg leading-7 text-ink/70">{body}</p>
            </Card>
          ))}
        </div>
      </section>
      <section className="bg-white py-16 sm:py-24">
        <div className="container-wide grid gap-8 lg:grid-cols-[.8fr_1.2fr] lg:items-start">
          <div>
            <p className="section-kicker">Government subsidy</p>
            <h2 className="section-title !text-3xl sm:!text-5xl">Guidance for the steps around your rooftop solar plan.</h2>
          </div>
          <div className="rounded-3xl border border-ink/10 bg-cream p-7 sm:p-9">
            <p className="text-base leading-8 text-ink/75">Homeowners in Delhi, Uttar Pradesh, and Haryana can avail financial assistance under the PM Surya Ghar: Muft Bijli Yojana for rooftop solar systems. The Central Government offers subsidies of ₹30,000 for 1 kW, ₹60,000 for 2 kW, and up to ₹78,000 for 3 kW and above, credited directly after installation and approval.</p>
            <p className="mt-5 text-sm leading-6 text-ink/65">Eligibility, state incentives, net metering and final approval depend on the applicable programme requirements. CAAT PowerBot can guide you through the relevant process.</p>
            <Link href="/quote" className={buttonStyles("outline", "mt-7 gap-2 px-5")}>Start with an estimate <ArrowUpRight size={16} /></Link>
          </div>
        </div>
      </section>
    </PublicPage>
  );
}
