"use client";

import { motion, useReducedMotion } from "framer-motion";

function IconSun() {
  return (
    <svg
      width="26"
      height="26"
      viewBox="0 0 26 26"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <circle cx="13" cy="13" r="4.5" />
      <path d="M13 2.5v3M13 20.5v3M2.5 13h3M20.5 13h3M5.6 5.6l2.1 2.1M18.3 18.3l2.1 2.1M20.4 5.6l-2.1 2.1M7.7 18.3l-2.1 2.1" />
    </svg>
  );
}

function IconPanel() {
  return (
    <svg
      width="26"
      height="26"
      viewBox="0 0 26 26"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <rect x="4" y="5" width="18" height="12" rx="1.5" />
      <path d="M4 11h18M10 5v12M16 5v12" />
      <path d="M9 21h8M13 17v4" />
    </svg>
  );
}

function IconInverter() {
  return (
    <svg
      width="26"
      height="26"
      viewBox="0 0 26 26"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <rect x="4" y="4" width="18" height="18" rx="2.5" />
      <path d="M8 10h4" />
      <path d="M8 13.5h2" />
      <path d="M8 18c1.2 0 1.2-2 2.4-2s1.2 2 2.4 2 1.2-2 2.4-2 1.2 2 2.4 2" />
      <circle cx="17.5" cy="9.5" r="1.5" />
    </svg>
  );
}

function IconHome() {
  return (
    <svg
      width="26"
      height="26"
      viewBox="0 0 26 26"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M4 12.5 13 5l9 7.5" />
      <path d="M6.5 11.5V21h13v-9.5" />
      <path d="m13.8 12-2.3 3.8h3l-2.3 3.8" />
    </svg>
  );
}

const steps = [
  {
    icon: IconSun,
    title: "Sunlight",
    text: "Photons strike the silicon cells on your roof — free fuel, roughly 300 days a year in most of India.",
  },
  {
    icon: IconPanel,
    title: "Panels make DC",
    text: "Each panel generates direct current. Strings of panels add up to your system's kilowatt rating.",
  },
  {
    icon: IconInverter,
    title: "Inverter converts",
    text: "The inverter turns DC into 230 V AC — the same voltage every appliance in your home runs on.",
  },
  {
    icon: IconHome,
    title: "Home + grid export",
    text: "Your home uses what it needs; extra units flow out through the net meter and spin your bill backwards.",
  },
];

function HConnector() {
  return (
    <div className="hidden flex-1 self-center lg:block" aria-hidden="true">
      <svg className="h-6 w-full" preserveAspectRatio="none">
        <line
          x1="0"
          y1="12"
          x2="100%"
          y2="12"
          stroke="var(--color-gold)"
          strokeWidth="2"
          className="energy-dash"
        />
      </svg>
    </div>
  );
}

function VConnector() {
  return (
    <div className="flex justify-center lg:hidden" aria-hidden="true">
      <svg className="h-12 w-6">
        <line
          x1="12"
          y1="0"
          x2="12"
          y2="48"
          stroke="var(--color-gold)"
          strokeWidth="2"
          className="energy-dash"
        />
      </svg>
    </div>
  );
}

export default function HowItWorks() {
  const reduced = useReducedMotion();

  return (
    <section id="how-it-works" className="bg-night py-14 sm:py-18">
      <div className="container-wide">
        <motion.div
          initial={false}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        >
          <p className="section-kicker section-kicker-dark">
            How it works
          </p>
          <h2 className="section-title section-title-light">
            From sunlight to switchboard.
          </h2>
          <p className="section-copy section-copy-light">
            No black box. Four stages between the sun and your ceiling fan —
            here is exactly what each one does.
          </p>
        </motion.div>

        <div className="mt-14 flex flex-col lg:flex-row lg:items-stretch lg:gap-0">
          {steps.map((step, i) => (
            <div key={step.title} className="contents">
              {i > 0 && (
                <>
                  <HConnector />
                  <VConnector />
                </>
              )}
              <motion.div
                initial={false}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{
                  duration: 0.6,
                  delay: reduced ? 0 : 0.12 * i,
                  ease: [0.22, 1, 0.36, 1],
                }}
                className="flex flex-col items-center rounded-3xl border border-white/10 bg-dusk/50 px-6 py-8 text-center lg:w-56 lg:shrink-0"
              >
                <div className="flex h-14 w-14 items-center justify-center rounded-full border border-gold/40 bg-night text-gold">
                  <step.icon />
                </div>
                <p className="mt-4 font-mono text-[11px] uppercase tracking-[0.22em] text-gold/70">
                  0{i + 1}
                </p>
                <h3 className="mt-1 text-lg font-black tracking-tight text-white">
                  {step.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-white/60">
                  {step.text}
                </p>
              </motion.div>
            </div>
          ))}
        </div>

        <motion.p
          initial={false}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.7, delay: 0.5 }}
          className="mt-10 text-center font-mono text-[11px] uppercase tracking-[0.22em] text-white/40"
        >
          DC in · AC out · surplus exported via net meter
        </motion.p>
      </div>
    </section>
  );
}
