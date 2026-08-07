import Reveal from "@/components/Reveal";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { buttonStyles } from "@/components/ui";

export default function SubsidyInfo() {
  return (
    <section id="subsidy" className="bg-paper py-14 sm:py-18">
      <div className="container-wide grid gap-7 lg:grid-cols-[.75fr_1.25fr] lg:gap-16">
        <Reveal className="max-w-xl">
          <p className="section-kicker">Government subsidy</p>
          <h2 className="section-title !text-3xl sm:!text-5xl">
            Support for your rooftop solar plan.
          </h2>
          <p className="section-copy !text-base">
            Homeowners in Delhi, Uttar Pradesh, and Haryana can avail financial assistance under the PM Surya Ghar: Muft Bijli Yojana for rooftop solar systems. The Central Government offers subsidies of ₹30,000 for 1 kW, ₹60,000 for 2 kW, and up to ₹78,000 for 3 kW and above, credited directly after installation and approval.
          </p>
          <p className="mt-4 max-w-xl text-sm leading-6 text-ink/65">
            CAAT PowerBot handles everything from survey to subsidy, approvals, installation, and support for a hassle-free solar switch.
          </p>
        </Reveal>

        <Reveal delay={0.1} className="max-w-3xl lg:pt-2">
          <p className="font-mono text-[11px] font-bold uppercase tracking-[.18em] text-teal">
            State subsidy &amp; eligibility
          </p>

          <dl className="mt-4 divide-y divide-ink/10 border-y border-ink/10">
            <div className="grid gap-2 py-4 sm:grid-cols-[10rem_minmax(0,1fr)] sm:gap-6">
              <dt className="font-mono text-[11px] font-bold uppercase tracking-[.16em] text-teal">Delhi &amp; UP</dt>
              <dd className="text-sm leading-6 text-ink/70">
                Delhi offers an additional state subsidy of up to ₹30,000 (₹10,000 per kW up to 3 kW), enabling total support of up to ₹1,08,000 (subject to eligibility). Uttar Pradesh currently has only the Central subsidy; state incentives may be announced separately.
              </dd>
            </div>
            <div className="grid gap-2 py-4 sm:grid-cols-[10rem_minmax(0,1fr)] sm:gap-6">
              <dt className="font-mono text-[11px] font-bold uppercase tracking-[.16em] text-teal">Haryana</dt>
              <dd className="text-sm leading-6 text-ink/70">
                Only Central subsidy is currently available; any additional benefits depend on state notifications.
              </dd>
            </div>
            <div className="grid gap-2 py-4 sm:grid-cols-[10rem_minmax(0,1fr)] sm:gap-6">
              <dt className="font-mono text-[11px] font-bold uppercase tracking-[.16em] text-teal">Eligibility</dt>
              <dd className="text-sm leading-6 text-ink/70">
                Eligibility requires a residential rooftop system, net metering, and installation by an MNRE/DISCOM-approved vendor.
              </dd>
            </div>
          </dl>

          <Link href="/solar-subsidy-delhi-ncr" className={buttonStyles("outline", "mt-6 gap-2 px-5")}>
            Explore full subsidy guidance <ArrowUpRight size={16} />
          </Link>
        </Reveal>
      </div>
    </section>
  );
}
