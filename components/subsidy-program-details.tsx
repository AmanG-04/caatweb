const subsidyRows = [
  { capacity: "1 kW", amount: "₹30,000" },
  { capacity: "2 kW", amount: "₹60,000" },
  { capacity: "3 kW or more", amount: "₹78,000", note: "Maximum cap" },
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

export function SubsidyProgramDetails() {
  return (
    <div className="space-y-12">
      <div className="max-w-3xl">
        <p className="section-kicker">Current residential rates</p>
        <h2 className="section-title">The subsidy figures, at a glance.</h2>
        <p className="section-copy">
          These are the residential PM Surya Ghar rates currently used in our estimates. Final eligibility and the applicable amount are confirmed by the authorities during the project process.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {subsidyRows.map((row) => (
          <article key={row.capacity} className="rounded-3xl border border-ink/10 bg-paper p-6 sm:p-7">
            <p className="font-mono text-[11px] font-bold uppercase tracking-[.18em] text-teal">{row.capacity}</p>
            <p className="mt-4 text-3xl font-black tracking-[-.05em] text-ink">{row.amount}</p>
            {row.note && <p className="mt-2 text-sm font-semibold text-ink/55">{row.note}</p>}
          </article>
        ))}
      </div>

      <div className="border-t border-ink/10 pt-12">
        <p className="section-kicker">The process</p>
        <h2 className="section-title">From application to bank credit.</h2>
        <ol className="subsidy-steps mt-8 flex flex-wrap items-center justify-center gap-x-3 gap-y-3 rounded-3xl border border-ink/10 bg-white px-6 py-5 shadow-soft">
          {steps.map((step, index) => (
            <li key={step} className="subsidy-step flex items-center gap-3">
              <span className="subsidy-step-content flex items-center gap-3">
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-teal font-mono text-[11px] font-bold text-white shadow-sm">
                  {index + 1}
                </span>
                <span className="text-xs font-bold uppercase tracking-[0.08em] text-ink sm:text-sm">
                  {step}
                </span>
              </span>
              {index < steps.length - 1 && <StepArrow index={index} />}
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
}
