"use client";

import { useEffect, useRef, useState } from "react";

const steps = [
  ["01", "Free online consultation", "Share your electricity bill, property details and goals with our solar team on WhatsApp. We assess your needs, answer questions and outline the right next steps.", "DAY 0 · ONLINE"],
  ["02", "System design & transparent estimate", "You get a line-item estimate: panel make and wattage, inverter model, structure spec, wiring, and a generation estimate for your exact roof. No lump-sum mystery pricing.", "2–3 DAYS"],
  ["03", "Subsidy & net-metering paperwork", "We file your PM Surya Ghar subsidy application and the net-metering request with your DISCOM, and follow up until both are sanctioned. You sign; we chase.", "2–4 WEEKS · WE HANDLE IT"],
  ["04", "Installation & commissioning", "Structure, panels, inverter, earthing and cabling go up — typically in two to three days, with your roof left clean. Then the DISCOM inspects, the net meter goes in, and we switch on.", "2–3 DAYS ON SITE"],
  ["05", "Monitoring, cleaning & AMC", "You watch generation live on the inverter app. We come back on schedule for cleaning and health checks, so year five performs like year one.", "ONGOING · QUARTERLY VISITS"],
] as const;

export function ProjectTimeline() {
  const viewportRef = useRef<HTMLDivElement>(null);
  const [activeStep, setActiveStep] = useState(0);

  useEffect(() => {
    const viewport = viewportRef.current;
    if (!viewport) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (visible) setActiveStep(Number(visible.target.getAttribute("data-step")));
      },
      { root: viewport, threshold: [0.2, 0.5, 0.8] },
    );

    const stepElements = viewport.querySelectorAll<HTMLElement>("[data-step]");
    stepElements.forEach((step) => observer.observe(step));
    return () => observer.disconnect();
  }, []);

  return (
    <section id="process" className="project-timeline">
      <div className="container-wide">
        <p className="section-kicker">How a project runs</p>
        <h2 className="section-title">Consultation to commissioning, handled.</h2>
        <p className="section-copy">Five steps, one accountable team. Scroll through the process at your own pace.</p>

        <div className="project-timeline-experience">
          <div className="project-timeline-rail" aria-hidden="true">
            {steps.map(([number], index) => <span key={number} className={index === activeStep ? "is-active" : ""}>{number}</span>)}
          </div>
          <div ref={viewportRef} className="project-timeline-viewport" aria-label="Project delivery steps">
            {steps.map(([number, title, body, duration], index) => (
              <article className={`project-timeline-step ${index === activeStep ? "is-active" : ""}`} data-step={index} key={number}>
                <div className="project-timeline-number">{number}</div>
                <div className="project-timeline-content">
                  <p className="project-timeline-counter">STEP {number} / {String(steps.length).padStart(2, "0")}</p>
                  <h3>{title}</h3>
                  <p>{body}</p>
                  <span>{duration}</span>
                </div>
              </article>
            ))}
          </div>
        </div>
        <p className="project-timeline-hint" aria-hidden="true">SCROLL TO EXPLORE <span>↓</span></p>
      </div>
    </section>
  );
}
