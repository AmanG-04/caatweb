import Reveal from "@/components/Reveal";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { buttonStyles } from "@/components/ui";

const subsidyRows: { capacity: string; amount: string }[] = [
  { capacity: "1 kW", amount: "₹30,000" },
  { capacity: "2 kW", amount: "₹60,000" },
  { capacity: "3 kW or more", amount: "₹78,000 (capped)" },
];

const steps = [
  "Apply on portal",
  "DISCOM approval",
  "Install & inspect",
  "Subsidy in bank",
];

function StepArrow({ index }: { index: number }) {
  return (
    <svg
      viewBox="0 0 24 12"
      className="subsidy-step-arrow h-4 w-8 shrink-0"
      style={{ animationDelay: `${index * 180}ms` }}
      aria-hidden="true"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M2 6h18M16 2l4 4-4 4" />
    </svg>
  );
}

export default function SubsidyInfo() {
  return (
    <section id="subsidy" className="bg-paper-dim py-20 sm:py-18">
      <div className="container-wide">
        <div className="grid grid-cols-1 items-start gap-12 lg:grid-cols-2 lg:gap-16">
          {/* Left: plain-language explanation */}
          <Reveal>
            <p className="section-kicker">
              Government Subsidy
            </p>
            <h2 className="section-title !text-3xl sm:!text-5xl">
              PM Surya Ghar: Muft Bijli Yojana, decoded.
            </h2>
            <div className="mt-6 space-y-4 text-base leading-relaxed text-ink-soft">
              <p>
                The central subsidy is paid directly into your bank account after
                your plant is commissioned and net metering is switched on. No
                middlemen, no deductions — the money moves from the government to
                you.
              </p>
              <p>
                We handle the national portal application, DISCOM approval and
                the final inspection end-to-end, so you never chase paperwork or
                stand in a queue at the electricity office.
              </p>
              {/* <p>
                Housing societies benefit too: common-area systems (lifts, pumps,
                lighting) get <strong className="font-semibold text-ink">₹18,000 per kW</strong>{" "}
                of subsidy for capacities up to 500 kW.
              </p> */}
            </div>
          </Reveal>

          {/* Right: subsidy table card */}
          <Reveal delay={0.15}>
            <div className="rounded-3xl border border-ink/10 bg-paper p-7 sm:p-13">
              <p className="font-mono text-[11px] uppercase tracking-[0.28em] text-violet">
                Residential Subsidy
              </p>
              <dl className="mt-5 divide-y divide-ink/10">
                {subsidyRows.map((row) => (
                  <div
                    key={row.capacity}
                    className="flex items-baseline justify-between gap-4 py-4"
                  >
                    <dt className="font-mono text-sm text-ink-soft">{row.capacity}</dt>
                    <dd className="font-display text-xl font-bold tracking-tight text-ink">
                      {row.amount}
                    </dd>
                  </div>
                ))}
              </dl>
              <p className="mt-4 font-mono text-[10px] uppercase tracking-[0.12em] text-ink-soft/70">
                Residential, per PM Surya Ghar rates. Subject to government
                revision.
              </p>
              {/* <Link href="/quote" className={buttonStyles("primary", "mt-6 gap-2")}>
                Check my estimated subsidy <ArrowUpRight size={16} />
              </Link> */}
            </div>
          </Reveal>
        </div>

        {/* 4-step mini-strip */}
        <Reveal delay={0.1} className="mt-14">
          <ol className="flex flex-wrap items-center justify-center gap-x-3 gap-y-3 rounded-3xl border border-ink/10 bg-white px-6 py-5 shadow-soft">
            {steps.map((step, i) => (
              <li key={step} className="flex items-center gap-3">
                <span className="flex items-center gap-3">
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-teal font-mono text-[11px] font-bold text-white shadow-sm">
                    {i + 1}
                  </span>
                  <span className="text-xs font-bold uppercase tracking-[0.08em] text-ink sm:text-sm">
                    {step}
                  </span>
                </span>
                {i < steps.length - 1 && <StepArrow index={i} />}
              </li>
            ))}
          </ol>
        </Reveal>
      </div>
    </section>
  );
}
