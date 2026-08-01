"use client";

import type { PointerEvent } from "react";

const benefits = [
  "Bill-based system sizing and savings estimate",
  "Residential, commercial and industrial rooftop systems",
  "Subsidy and net-metering support",
  "Installation, monitoring and maintenance",
];

function setFillOrigin(event: PointerEvent<HTMLElement>) {
  const bounds = event.currentTarget.getBoundingClientRect();
  event.currentTarget.style.setProperty("--fill-x", `${event.clientX - bounds.left}px`);
  event.currentTarget.style.setProperty("--fill-y", `${event.clientY - bounds.top}px`);
}

export function PowerbotBenefits() {
  return (
    <div className="powerbot-benefits mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {benefits.map((benefit, index) => (
        <article key={benefit} className="powerbot-benefit-card flex min-h-64 flex-col p-7" onPointerEnter={setFillOrigin}>
          <div className="flex items-center justify-between gap-4">
            <span className="powerbot-benefit-number">0{index + 1}</span>
            <span className="powerbot-benefit-eyebrow">PowerBot advantage</span>
          </div>
          <div className="mt-auto">
            <span className="powerbot-benefit-rule" aria-hidden="true" />
            <h3 className="powerbot-benefit-title mt-5 text-[1.35rem] font-black leading-[1.18] tracking-[-.025em]">{benefit}</h3>
          </div>
        </article>
      ))}
    </div>
  );
}
