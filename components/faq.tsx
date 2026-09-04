"use client";

import { useState } from "react";
import { faqItems } from "@/lib/seo";

export const faqs = faqItems.map(({ question, answer }) => ({ q: question, a: answer }));

export default function FAQ() {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <section id="faq" className="bg-paper py-14 sm:py-8">
      <div className="container-wide">
        <div className="mx-auto max-w-3xl text-center">
            <p className="section-kicker">Straight answers</p>
            <h2 className="section-title mx-auto">
              Questions every roof owner asks.
            </h2>
            <p className="section-copy mx-auto">
              The same six questions come up in most solar conversations. Here
              are the clear answers before you contact us.
            </p>
        </div>

        <div className="mx-auto mt-10 max-w-4xl divide-y divide-ink/10 rounded-3xl border border-ink/10 bg-white px-6 sm:px-8">
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
                      <p className="pb-6 pr-8 text-base leading-7 text-ink-soft">
                        {faq.a}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
        </div>
      </div>
    </section>
  );
}
