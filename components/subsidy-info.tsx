import Reveal from "@/components/Reveal";
import { Check } from "lucide-react";

const subsidyRows = [
  {
    state: "Delhi & Uttar Pradesh",
    values: [
      { total: "₹40,000", detail: "Central ₹30k · State ₹10k" },
      { total: "₹80,000", detail: "Central ₹60k · State ₹20k" },
      { total: "₹1,08,000", detail: "Central ₹78k · State ₹30k" },
    ],
  },
  {
    state: "Haryana",
    values: [
      { total: "₹30,000", detail: "Central subsidy only" },
      { total: "₹60,000", detail: "Central subsidy only" },
      { total: "₹78,000", detail: "Central subsidy only" },
    ],
  },
];

const eligibility = ["Residential rooftop", "Net metering", "MNRE/DISCOM-approved vendor"];

export default function SubsidyInfo() {
  return (
    <section id="subsidy" className="bg-paper py-14 sm:py-18">
      <div className="container-wide">
        <div className="text-center">
          <p className="section-kicker">Government subsidy</p>
        </div>

        <div className="mt-9 grid gap-10 lg:grid-cols-[.68fr_1.32fr] lg:items-start lg:gap-16">
          <Reveal className="max-w-md lg:pt-7">
            <h2 className="section-title !mt-0 !text-3xl sm:!text-4xl">
              Support for your rooftop solar plan.
            </h2>
            <p className="section-copy !text-base">
              Eligible homeowners in Delhi, Uttar Pradesh, and Haryana can receive support under the PM Surya Ghar: Muft Bijli Yojana.
            </p>

            <div className="mt-7 border-t border-ink/10 pt-5">
              <p className="font-mono text-[10px] font-bold uppercase tracking-[.18em] text-teal">Basic eligibility</p>
              <ul className="mt-3 space-y-2.5">
                {eligibility.map((item) => (
                  <li key={item} className="flex items-center gap-2.5 text-sm font-semibold text-ink/65">
                    <span className="grid h-5 w-5 shrink-0 place-items-center rounded-full bg-lime/70 text-teal"><Check size={12} strokeWidth={2.5} /></span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </Reveal>

          <Reveal delay={0.1}>
            <div className="mb-4 flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between sm:gap-5">
              <div>
                <h3 className="text-xl font-black tracking-tight text-ink">Estimated support by system size</h3>
                <p className="mt-1 text-sm text-ink/55">Total subsidy, with the contribution shown below.</p>
              </div>
              <p className="max-w-[14rem] text-xs leading-5 text-ink/45 sm:text-right">Subject to current programme rules and approval</p>
            </div>

            <div className="overflow-x-auto rounded-2xl border border-ink/10 bg-white shadow-soft">
              <table className="w-full min-w-[42rem] border-collapse">
                <thead>
                  <tr className="bg-night text-white">
                    <th scope="col" className="w-[31%] px-5 py-4 text-left text-xs font-bold uppercase tracking-[.12em] text-white/70">State</th>
                    {['1 kW', '2 kW', '3 kW+'].map((size) => (
                      <th key={size} scope="col" className="w-[23%] border-l border-white/10 px-4 py-4 text-center text-base font-black tracking-tight">{size}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {subsidyRows.map((row, rowIndex) => (
                    <tr key={row.state} className={rowIndex === 0 ? "border-b border-ink/10" : ""}>
                      <th scope="row" className="bg-cream/70 px-5 py-5 text-left text-sm font-bold leading-5 text-ink">{row.state}</th>
                      {row.values.map((value, index) => (
                        <td key={`${row.state}-${index}`} className="border-l border-ink/10 px-4 py-5 text-center">
                          <span className="block whitespace-nowrap text-base font-black tracking-tight text-ink">{value.total}</span>
                          <span className="mt-1.5 block whitespace-nowrap text-[10px] font-semibold text-ink/45">{value.detail}</span>
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
