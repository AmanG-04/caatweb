"use client";

import { useState } from "react";

export const faqs = [
  {
    q: "How much subsidy do I actually get?",
    a: "The applicable amount depends on the current programme rules, your system capacity and approval. See our solar subsidy guidance page for the current residential rates and full process; we prepare and file the application as part of every residential project.",
  },
  {
    q: "How much roof space do I need?",
    a: "Plan on roughly 80 sq ft of shadow-free roof per kW. A typical 3 kW home system needs about 240 sq ft — a modest terrace. Water tanks, parapet walls and neighbouring buildings all cast shadows that matter, which is why we do a shadow analysis before quoting rather than guessing from a satellite photo.",
  },
  {
    q: "What happens during monsoon and at night?",
    a: "At night the grid supplies you as usual. In monsoon, panels still generate 40–60% of their sunny-day output from diffused light. The key is net metering: surplus units you export on sunny days are credited to your account and offset the units you draw later, so your bill is settled on the net figure across the billing cycle.",
  },
  {
    q: "How much maintenance does a system need?",
    a: "Very little, but not zero. Panels need cleaning every 2–4 weeks in dusty months — dust alone can cost 10–15% of generation. The inverter should get an annual health check, and wiring and earthing an annual inspection. Our AMC covers all of this on a fixed schedule, with generation reports so you can see the system is performing.",
  },
  {
    q: "What is the payback period?",
    a: "For a typical residential system after subsidy, 3–4 years is realistic at current Delhi NCR tariffs; commercial systems paying higher tariffs often see 3 years or less. The panels are warrantied for 30 years of performance, so everything after payback is effectively free electricity. We give you the payback calculation for your actual bill before you commit.",
  },
  {
    q: "Will my panels work during a power cut?",
    a: "A standard grid-tied system shuts off during an outage — a safety feature called anti-islanding that protects linemen working on the grid. If backup matters to you, we design hybrid systems with a battery, or integrate solar with your existing inverter or generator, so critical loads keep running while the grid is down.",
  },
];

export default function FAQ() {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <section id="faq" className="bg-paper py-14 sm:py-8">
      <div className="mx-auto max-w-none 2xl:px-16 px-5 sm:px-8">
        <div className="grid gap-10 lg:grid-cols-[1fr_1.6fr] lg:gap-16">
          <div>
            <p className="section-kicker">Straight answers</p>
            <h2 className="section-title !text-4xl sm:!text-5xl">
              Questions every roof owner asks.
            </h2>
            <p className="section-copy max-w-md !text-base">
              The same six questions come up in most solar conversations. Here
              are the clear answers before you contact us.
            </p>
          </div>

          <div className="divide-y divide-ink/10 rounded-3xl border border-ink/10 bg-white px-6 sm:px-8">
            {faqs.map((faq, i) => {
              const isOpen = open === i;

              return (
                <div key={faq.q}>
                  <button
                    type="button"
                    aria-expanded={isOpen}
                    aria-controls={`faq-panel-${i}`}
                    id={`faq-button-${i}`}
                    onClick={() => setOpen(isOpen ? null : i)}
                    className="flex w-full items-center justify-between gap-4 py-5 text-left sm:py-6"
                  >
                    <span className="text-base font-black tracking-tight text-ink sm:text-lg">
                      {faq.q}
                    </span>
                    <span className={`faq-chevron shrink-0 text-violet ${isOpen ? "is-open" : ""}`} aria-hidden="true">
                      <svg
                        width="20"
                        height="20"
                        viewBox="0 0 20 20"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.8"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="m5 8 5 5 5-5" />
                      </svg>
                    </span>
                  </button>
                  <div
                    id={`faq-panel-${i}`}
                    role="region"
                    aria-labelledby={`faq-button-${i}`}
                    aria-hidden={!isOpen}
                    className={`faq-answer${isOpen ? " is-open" : ""}`}
                  >
                    <div className="faq-answer-inner">
                      <p className="pb-6 pr-8 text-sm leading-relaxed text-ink-soft">
                        {faq.a}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
